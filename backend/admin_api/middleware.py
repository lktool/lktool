from django.conf import settings
import jwt
import logging

# Set up logger
logger = logging.getLogger(__name__)

class AdminAuthMiddleware:
    """
    Custom middleware to verify admin tokens
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip admin auth for non-admin URLs
        if not request.path.startswith('/api/admin/'):
            return self.get_response(request)
        
        # Skip admin auth for login endpoint
        if request.path == '/api/admin/login/':
            return self.get_response(request)
        
        # Set default
        request.is_admin = False
        
        # Get admin token from request
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            logger.warning(f"Missing or invalid Authorization header: {auth_header}")
            return self.get_response(request)
        
        token = auth_header.split(' ')[1]
        
        # Verify token
        try:
            # Decode the JWT token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            is_admin = payload.get('is_admin', False)
            
            if is_admin:
                request.is_admin = True
                logger.info(f"Admin authenticated successfully: {payload.get('email', 'unknown')}")
            else:
                logger.warning(f"Token valid but not admin: {payload}")
                
        except jwt.ExpiredSignatureError:
            logger.warning("Admin token expired")
        except jwt.InvalidTokenError:
            logger.warning("Invalid admin token")
        except Exception as e:
            logger.error(f"Admin auth error: {str(e)}")
            
        return self.get_response(request)
