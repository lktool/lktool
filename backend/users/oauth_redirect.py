from django.shortcuts import redirect
from django.views.decorators.http import require_GET

@require_GET
def google_oauth_redirect(request):
    """
    Simple view to handle Google OAuth redirects by forwarding to the frontend
    """
    # Get all query params
    query_string = request.META.get('QUERY_STRING', '')
    
    # Construct the frontend route with hash
    frontend_url = f"https://lktools.onrender.com/#/auth/google/callback"
    
    # Add query params if they exist
    if query_string:
        frontend_url += f"?{query_string}"
    
    # Redirect to frontend route
    return redirect(frontend_url)
