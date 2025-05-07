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
                # Add debug logging to see the token and decode process
                print(f"Admin Auth: Processing token: {token[:10]}...")
                
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print(f"Admin Auth: Token payload: {payload}")
                
                if payload.get('user_type') == 'admin':
                    request.is_admin = True
                    print("Admin Auth: Successfully verified admin token!")
                else:
                    request.is_admin = False
                    print(f"Admin Auth: Token missing admin user_type, payload: {payload}")
            except jwt.PyJWTError as e:
                request.is_admin = False
                print(f"Admin Auth: JWT validation error: {str(e)}")
        else:
            request.is_admin = False
            if '/api/admin/' in request.path and request.method != 'OPTIONS' and request.path != '/api/admin/login/':
                print(f"Admin Auth: No auth header found for path: {request.path}")
            
        return self.get_response(request)
