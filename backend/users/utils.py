from rest_framework.views import exception_handler
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs detailed error information.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # Now add additional info to response
    if response is not None:
        # Log detailed error information
        request = context.get('request')
        view = context.get('view')
        
        # Get auth headers for debugging
        auth_header = request.META.get('HTTP_AUTHORIZATION', 'No Auth Header') if request else 'No Request'
        
        logger.error(
            f"API Error: {exc}, "
            f"View: {view.__class__.__name__ if view else 'Unknown'}, "
            f"Path: {request.path if request else 'Unknown'}, "
            f"User: {request.user if request and request.user else 'Anonymous'}, "
            f"Auth: {auth_header[:20]}..."  # Only show beginning of auth header for security
        )
        
        # Add more context to the response
        response.data['path'] = request.path if request else 'Unknown'
        response.data['view'] = view.__class__.__name__ if view else 'Unknown'
        
    return response
