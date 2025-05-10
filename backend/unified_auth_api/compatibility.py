class AuthCompatibilityMiddleware:
    """
    Middleware for compatibility between unified_auth_api and legacy admin_api auth
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # If using unified auth (has role)
        if hasattr(request, 'role') and request.role == 'admin':
            request.is_admin = True
        
        # If using old admin middleware (has is_admin)
        if getattr(request, 'is_admin', False):
            request.role = 'admin'
            
        return self.get_response(request)
