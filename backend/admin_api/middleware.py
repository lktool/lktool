from django.conf import settings
import jwt
import logging

# Set up logger
logger = logging.getLogger(__name__)

class AdminAuthMiddleware:
    """Custom middleware to verify admin tokens"""
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Check standard Authorization header first
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        # Debug what headers we're getting
        print(f"AdminAuthMiddleware: Processing token {auth_header[:10] if auth_header else 'None'}...")
        if auth_header:
            print(f"Auth header found: {auth_header[:15]}...")
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Debug token
                print(f"Attempting to decode token: {token[:10]}...")
                
                # Decode with a more lenient approach
                payload = jwt.decode(
                    token, 
                    settings.SECRET_KEY, 
                    algorithms=['HS256'],
                    options={"verify_exp": False}  # Temporarily ignore expiration
                )
                
                print(f"Token claims: {payload}")
                
                # Set admin flag if any of these is true
                if payload.get('is_admin') or payload.get('user_type') == 'admin':
                    request.is_admin = True
                    print(f"Admin token verified for {payload.get('email', 'unknown')}")
                else:
                    request.is_admin = False
            except Exception as e:
                print(f"Token validation error: {e}")
                request.is_admin = False
        else:
            request.is_admin = False
        
        return self.get_response(request)
