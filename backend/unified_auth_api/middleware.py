class RoleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.role = None
        if hasattr(request, 'auth') and isinstance(request.auth, dict):
            request.role = request.auth.get("role")
        return self.get_response(request)
