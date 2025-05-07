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
        # Focus on Authorization header (standard practice)
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                if payload.get('user_type') == 'admin':
                    request.is_admin = True
                    logger.debug("Admin authenticated successfully")
                else:
                    request.is_admin = False
                    logger.debug("Token missing admin user_type")
            except jwt.PyJWTError as e:
                request.is_admin = False
                logger.error(f"JWT validation error: {str(e)}")
        else:
            request.is_admin = False
            if '/api/admin/' in request.path and request.method != 'OPTIONS' and request.path != '/api/admin/login/':
                logger.debug(f"Admin auth failed - missing token for {request.path}")
            
        return self.get_response(request)
