from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import traceback
import logging

logger = logging.getLogger(__name__)

class AdminJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication for admin users
    """
    def authenticate(self, request):
        try:
            # First, try standard JWT authentication
            result = super().authenticate(request)
            
            if not result:
                return None
                
            user, token = result
            
            # Special case for hardcoded admin (for development/testing)
            admin_email = getattr(settings, 'ADMIN_EMAIL', None)
            if admin_email and user.email == admin_email:
                print(f"Authenticated hardcoded admin user: {user.email}")
                return user, token
                
            # For other users, check if they have admin role
            if not user.is_staff and getattr(user, 'role', '') != 'admin':
                raise AuthenticationFailed('User is not an admin')
                
            return user, token
            
        except Exception as e:
            print(f"AdminJWTAuthentication error: {str(e)}")
            print(traceback.format_exc())
            # Pass the exception up so it gets properly handled
            raise
