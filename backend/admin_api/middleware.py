from django.conf import settings
import jwt
import logging

# Set up logger
logger = logging.getLogger(__name__)

class AdminAuthMiddleware:
    """
    Custom middleware to verify admin tokens by checking for admin role
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Use standard Authorization header 
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        # Debug the headers for admin routes
        if '/api/admin/' in request.path and request.method != 'OPTIONS':
            logger.info(f"Admin request to {request.path}")
            logger.info(f"Authorization header: {auth_header}")
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Add debug output for token validation
                logger.info(f"Attempting to decode token: {token[:20]}...")
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                logger.info(f"Token decoded successfully. Payload keys: {payload.keys()}")
                
                # Check for admin role - either via role claim or user_type
                is_admin = (payload.get('role') == 'admin') or (payload.get('user_type') == 'admin')
                logger.info(f"Role check: role={payload.get('role')}, user_type={payload.get('user_type')}, is_admin={is_admin}")
                
                if is_admin:
                    request.is_admin = True
                    logger.info("Admin authenticated successfully")
                else:
                    request.is_admin = False
                    logger.warning("Token does not have admin role")
            except jwt.ExpiredSignatureError:
                request.is_admin = False
                logger.error("JWT token has expired")
            except jwt.InvalidTokenError:
                request.is_admin = False
                logger.error("Invalid JWT token")
            except Exception as e:
                request.is_admin = False
                logger.error(f"JWT validation error: {str(e)}")
        else:
            request.is_admin = False
            if '/api/admin/' in request.path and request.method != 'OPTIONS' and request.path != '/api/admin/login/':
                logger.warning(f"Admin auth failed - missing token for {request.path}")
            
        # IMPORTANT: Set this attribute explicitly 
        request.admin_checked = True
            
        return self.get_response(request)
