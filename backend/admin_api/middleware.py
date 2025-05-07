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
        # Check both types of authorization headers
        auth_header = request.META.get('HTTP_AUTHORIZATION') or request.META.get('HTTP_ADMIN_AUTHORIZATION')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                
                # Set is_admin flag if either condition is met
                if payload.get('is_admin') is True or payload.get('user_type') == 'admin':
                    request.is_admin = True
                    print(f"Admin token verified for {payload.get('email', 'unknown')}")
                else:
                    request.is_admin = False
                    print(f"Token valid but not admin: {payload}")
            except Exception as e:
                print(f"Admin token validation error: {str(e)}")
                request.is_admin = False
        else:
            request.is_admin = False
            
        return self.get_response(request)
