from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging
from django.conf import settings

from .serializers import ContactSerializer

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class ContactFormView(APIView):
    """
    View to handle contact form submissions without using the database (temporary fix)
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Skip saving to database (since table doesn't exist yet)
                # Just extract the validated data
                data = serializer.validated_data
                
                # Log the data
                logger.info(f"Contact form data received: {data}")
                
                # Get admin email
                admin_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
                
                # Format email content
                email_content = f"""
                New contact form submission:
                
                Email: {data['email']}
                LinkedIn URL: {data['linkedin_url']}
                
                Message:
                {data['message']}
                """
                
                # Log email content (instead of sending)
                logger.info(f"Would send email to {admin_email} with content: {email_content}")
                
                # Return success
                return Response({
                    "message": "Your message has been received. We'll contact you soon."
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Error processing contact form: {str(e)}")
                return Response({
                    "error": "An error occurred while processing your request."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)