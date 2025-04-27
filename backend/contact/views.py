from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging
import traceback

from .serializers import ContactSerializer
from .models import ContactSubmission
from .email_service import send_notification_email

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
                # Log the request data for debugging
                logger.info(f"Processing contact form submission: {serializer.validated_data}")
                
                # Save the submission
                submission = serializer.save()
                logger.info(f"Contact submission saved with ID: {submission.id}")
                
                try:
                    # Get the admin email from settings (with fallback)
                    admin_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
                    logger.info(f"Sending notification to admin email: {admin_email}")
                    
                    # Use the email service, but handle any errors separately
                    send_notification_email(
                        user_email=submission.email,
                        url=submission.linkedin_url,
                        message=submission.message,
                        recipient_email=admin_email,
                        subject="New Message from Website User"
                    )
                except Exception as email_error:
                    # Just log email errors but don't fail the request
                    logger.error(f"Failed to send email notification: {str(email_error)}")
                    # Continue processing - we don't want email failures to prevent form submission
                
                # Return success even if email failed
                return Response({
                    "message": "Your message has been sent successfully! We'll contact you soon."
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Log the full exception with traceback
                logger.error(f"Error processing contact form: {str(e)}")
                logger.error(traceback.format_exc())
                return Response({
                    "error": "An error occurred while processing your request. Please try again later."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Log validation errors
            logger.warning(f"Contact form validation error: {serializer.errors}")

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)