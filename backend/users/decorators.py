from functools import wraps
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

def cached_per_user(timeout=300):
    """
    Cache a view response with a per-user key to ensure proper isolation
    This is for class-based views or API views
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            # Apply standard cache but vary based on Authorization header
            # This ensures each user gets their own cache entry
            cached_view = cache_page(timeout)
            vary_view = vary_on_headers('Authorization')
            return vary_view(cached_view(view_func))(request, *args, **kwargs)
        return _wrapped_view
    return decorator
