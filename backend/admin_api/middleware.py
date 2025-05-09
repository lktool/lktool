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
        # Check if path is an admin path (matches both '/admin/' and '/api/admin/')
        is_admin_path = '/admin/' in request.path or '/api/admin/' in request.path
        
        # Skip OPTIONS requests and login endpoint
        is_exempt = (request.method == 'OPTIONS' or 
                    'login' in request.path or 
                    not is_admin_path)
        
        if not is_exempt:
            # Use standard Authorization header 
            auth_header = request.META.get('HTTP_AUTHORIZATION')
            logger.info(f"Processing admin request: {request.path}")
            logger.info(f"Auth header: {'Present' if auth_header else 'Missing'}")
            
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                logger.info(f"Token found: {token[:10]}...")
                
                try:
                    # Important: algorithms must be a list
                    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                    logger.info(f"Token decoded: {payload.keys()}")
                    
                    # Check multiple possible fields for admin role
                    is_admin = (
                        payload.get('role') == 'admin' or 
                        payload.get('user_type') == 'admin'
                    )
                    
                    logger.info(f"Admin role check: {is_admin}")
                    
                    if is_admin:
                        request.is_admin = True
                    else:
                        request.is_admin = False
                        logger.warning("Token does not have admin role")
                except Exception as e:
                    request.is_admin = False
                    logger.error(f"Token validation error: {str(e)}")
            else:
                request.is_admin = False
                logger.warning("Missing Authorization header for admin path")
        else:
            # Non-admin path or exempt request
            request.is_admin = False
            
        return self.get_response(request)
