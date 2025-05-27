class CSRFDebugMiddleware:
    """
    Middleware that logs detailed information about CSRF verification.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Process the request
        response = self.get_response(request)
        
        # Only debug API endpoints
        if request.path.startswith('/api/'):
            # Check if CSRF was enforced
            csrf_enforced = not getattr(request, '_dont_enforce_csrf_checks', False)
            
            # Log detailed CSRF information for debugging
            print(f"CSRF Debug - Path: {request.path}")
            print(f"CSRF Debug - Method: {request.method}")
            print(f"CSRF Debug - CSRF Enforced: {csrf_enforced}")
            
            # Check for JWT auth token
            if request.META.get('HTTP_AUTHORIZATION', '').startswith('Bearer '):
                print("JWT token detected")
                
                # Check admin access 
                if request.user and request.user.is_authenticated:
                    if request.user.is_staff or getattr(request.user, 'role', '') == 'admin':
                        print(f"Admin JWT token detected: {request.user.email}")
        
        return response
