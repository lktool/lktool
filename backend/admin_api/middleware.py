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
        # Check both standard Authorization and Admin-Authorization headers
        admin_auth_header = request.META.get('HTTP_ADMIN_AUTHORIZATION') or request.META.get('HTTP_AUTHORIZATION')
        
        if admin_auth_header and admin_auth_header.startswith('Bearer '):
            token = admin_auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                if payload.get('user_type') == 'admin':
                    request.is_admin = True
                    logger.info("Admin authenticated successfully")
                else:
                    request.is_admin = False
                    logger.warning("Token missing admin user_type")
            except jwt.PyJWTError as e:
                request.is_admin = False
                logger.error(f"JWT validation error: {str(e)}")
        else:
            request.is_admin = False
            if '/api/admin/' in request.path and request.method != 'OPTIONS' and request.path != '/api/admin/login/':
                logger.warning(f"Admin auth failed - missing token for {request.path}")
            
        return self.get_response(request)
