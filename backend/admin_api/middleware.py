from django.conf import settings
import jwt
import logging
import traceback

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
        
        # Get admin token from request (with detailed debug info)
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            print(f"Missing or invalid Authorization header format: {auth_header[:20]}...")
            return self.get_response(request)
        
        token = auth_header.split(' ')[1]
        
        # Print partial token for debugging
        print(f"AdminAuthMiddleware: Processing token {token[:15]}...")
        
        # Verify token
        try:
            # Debug decode without verification first
            try:
                unverified = jwt.decode(token, options={"verify_signature": False})
                print(f"Token claims: {unverified}")
            except Exception as decode_error:
                print(f"Failed to decode token without verification: {str(decode_error)}")
            
            # Now try full verification
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256'],
                options={
                    'verify_signature': True,
                    'require_exp': True, 
                    'require_iat': False,  # don't require issued at
                    'require_nbf': False   # don't require not before
                }
            )
            
            # Look for admin flag and set it if found
            if payload.get('is_admin') is True:
                request.is_admin = True
                print(f"Admin token verified for {payload.get('email', 'unknown')}")
            else:
                print(f"Token valid but missing is_admin flag: {payload}")
                
        except Exception as e:
            # Catch and log all exceptions without breaking
            print(f"Admin token validation error: {str(e)}")
            print(traceback.format_exc())
        
        return self.get_response(request)
