from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

from .serializers import ContactSerializer
from .models import ContactSubmission
from .email_service import send_notification_email  # Import the new email service

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class ContactFormView(APIView):
    """
    View to handle contact form submissions
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Save the submission
                submission = serializer.save()
                
                # Use the new email service function with "New Message from Website User" subject
                send_notification_email(
                    user_email=submission.email,
                    url=submission.linkedin_url,
                    message=submission.message,
                    # This will default to ADMIN_EMAIL (mathan21092006@gmail.com)
                    subject="New Message from Website User"  # As specified in requirements
                )
                
                return Response({
                    "message": "Your message has been sent successfully! We'll contact you soon."
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Error processing contact form: {str(e)}")
                return Response({
                    "error": "An error occurred while processing your request. Please try again later."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
