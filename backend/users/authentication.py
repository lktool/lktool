from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from django.conf import settings
from django.contrib.auth import get_user_model
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

class AdminJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that handles admin tokens specially.
    """
    
    def get_user(self, validated_token):
        """
        Attempt to find and return a user using the given validated token.
        Specifically handles admin tokens that don't map to a real user.
        """
        try:
            # Check if this is an admin token
            if validated_token.get('role') == 'admin' and validated_token.get('email') == getattr(settings, 'ADMIN_EMAIL', None):
                logger.info(f"Admin token detected for {validated_token.get('email')}")
                
                # Create a temporary "admin" user object that's not in the database
                admin_user = User()
                admin_user.id = 0
                admin_user.email = settings.ADMIN_EMAIL
                admin_user.is_staff = True
                admin_user.is_superuser = True
                admin_user.role = 'admin'
                
                return admin_user
                
            # Normal token processing for regular users
            return super().get_user(validated_token)
        except Exception as e:
            logger.error(f"Error in admin authentication: {str(e)}")
            raise exceptions.AuthenticationFailed('Token is invalid or expired')
