from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import TokenRefreshView
import logging

logger = logging.getLogger(__name__)

class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh view with better error handling for invalid/expired tokens
    """
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except TokenError as e:
            logger.warning(f"Token refresh failed: {str(e)}")
            return Response(
                {"detail": "Invalid token. Please log in again."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error(f"Token refresh error: {str(e)}")
            return Response(
                {"detail": "Authentication failed. Please log in again."},
                status=status.HTTP_401_UNAUTHORIZED
            )
