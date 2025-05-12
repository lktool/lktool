from django.http import JsonResponse
import re
from rest_framework_simplejwt.authentication import JWTAuthentication

class RoleBasedMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_auth = JWTAuthentication()
        
        # Define URL patterns that require admin role
        self.admin_patterns = [
            re.compile(r'^/api/admin/'),
        ]
        
    def __call__(self, request):
        # Check if URL requires admin role
        path = request.path
        requires_admin = any(pattern.match(path) for pattern in self.admin_patterns)
        
        if requires_admin:
            # Try to authenticate with JWT
            try:
                auth_header = request.META.get('HTTP_AUTHORIZATION', '')
                if not auth_header.startswith('Bearer '):
                    return JsonResponse({"detail": "Admin access required"}, status=403)
                
                token = auth_header.split(' ')[1]
                validated_token = self.jwt_auth.get_validated_token(token)
                
                # Check for admin role in token
                is_admin = validated_token.get('role') == 'admin'
                if not is_admin:
                    return JsonResponse({"detail": "Admin access required"}, status=403)
                
            except Exception as e:
                return JsonResponse({"detail": f"Admin access required: {str(e)}"}, status=403)
        
        # Continue with the request
        response = self.get_response(request)
        return response
