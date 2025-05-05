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
        print(f"Admin auth header: {auth_header[:20]}...")
        
        if not auth_header.startswith('Bearer '):
            print("Missing or invalid Authorization header format")
            return self.get_response(request)
        
        token = auth_header.split(' ')[1]
        print(f"Extracted token (first 15 chars): {token[:15]}...")
        
        # Verify token
        try:
            # Decode without verification first to debug
            try:
                header = jwt.get_unverified_header(token)
                print(f"Token header: {header}")
            except Exception as e:
                print(f"Error reading token header: {e}")
                
            # Try to decode token
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY, 
                algorithms=['HS256'],
                options={"verify_signature": True}
            )
            
            print(f"Token payload: {json.dumps(payload)}")
            
            # Check if admin flag is in the payload
            is_admin = payload.get('is_admin', False)
            
            if is_admin:
                request.is_admin = True
                print(f"Admin authentication successful - email: {payload.get('email')}")
            else:
                print("Token valid but not admin token")
        except jwt.ExpiredSignatureError:
            print("Admin token expired")
        except jwt.DecodeError as e:
            print(f"Token decode error: {e}")
        except jwt.InvalidTokenError as e:
            print(f"Invalid token: {e}")
        except Exception as e:
            print(f"Admin auth error: {str(e)}")
        
        return self.get_response(request)
