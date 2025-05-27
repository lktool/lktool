from django.conf import settings
import re

class CSRFExemptMiddleware:
    """Middleware that exempts specific paths from CSRF verification."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Compile the exempt paths as regular expressions
        self.exempt_urls = [re.compile(path) for path in getattr(settings, 'CSRF_EXEMPT_PATHS', [])]
    
    def __call__(self, request):
        # Check if the path should be exempt from CSRF
        path = request.path_info
        
        # Add debug information
        if request.path.startswith('/api/admin/'):
            print(f"Admin endpoint accessed: {request.path}")
            
        request._api_debug = {
            'path': path,
            'method': request.method,
            'is_api': path.startswith('/api/'),
            'is_admin': path.startswith('/api/admin/')
        }
        
        if any(pattern.match(path) for pattern in self.exempt_urls):
            # Mark this request as not requiring CSRF verification
            request._dont_enforce_csrf_checks = True
            
            # Add debug log
            if settings.DEBUG:
                print(f"CSRF exemption applied to: {path}")
        
        response = self.get_response(request)
        return response
