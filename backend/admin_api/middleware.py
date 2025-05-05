from django.conf import settings
import jwt
import logging
import json

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
            print(f"Missing or invalid Authorization header format: {auth_header[:20]}...")
            return self.get_response(request)
        
        token = auth_header.split(' ')[1]
        
        # Verify token
        try:
            # Decode properly with more flexible options
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256'],
                options={
                    'verify_signature': True,
                    'require_exp': True, 
                    'require_iat': False,
                    'require_nbf': False
                }
            )
            
            # Simply look for is_admin flag
            if payload.get('is_admin') is True:
                request.is_admin = True
                print(f"Admin authentication successful for {payload.get('email', 'unknown')}")
            else:
                print(f"Token valid but missing is_admin flag")
        except Exception as e:
            print(f"Admin auth error: {str(e)}")
        
        return self.get_response(request)
