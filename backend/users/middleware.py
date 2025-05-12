from django.http import JsonResponse
from django.contrib.auth.models import Group
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
import re
import logging

logger = logging.getLogger(__name__)

class RoleBasedMiddleware:
    """
    Middleware to ensure that JWT token-based roles are correctly processed
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Process JWT token if present
        if 'HTTP_AUTHORIZATION' in request.META and request.META['HTTP_AUTHORIZATION'].startswith('Bearer '):
            try:
                # Using JWT auth to get the token and user
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(
                    request.META['HTTP_AUTHORIZATION'].split(' ')[1]
                )
                
                # Check if this is an admin token
                if validated_token.get('role') == 'admin':
                    # Debug logging
                    logger.info(f"Admin JWT token detected: {validated_token.get('email')}")
                    
                    # Mark the request as having admin privileges
                    request.is_admin_token = True
                    
                    # If the path is related to admin endpoints
                    if '/api/admin/' in request.path or request.path.startswith('/admin/'):
                        logger.info(f"Admin endpoint accessed: {request.path}")
                    
            except Exception as e:
                logger.error(f"JWT validation error: {str(e)}")
                # Don't block the request, just log the error
        
        response = self.get_response(request)
        return response
