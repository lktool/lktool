from django.conf import settings
import jwt

class AdminAuthMiddleware:
    """
    Custom middleware to verify admin tokens
    Moved from views.py to middleware.py for better organization
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        admin_auth_header = request.META.get('HTTP_ADMIN_AUTHORIZATION')
        if admin_auth_header and admin_auth_header.startswith('Bearer '):
            token = admin_auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                if payload.get('user_type') == 'admin':
                    request.is_admin = True
            except jwt.PyJWTError:
                request.is_admin = False
        else:
            request.is_admin = False
            
        return self.get_response(request)
