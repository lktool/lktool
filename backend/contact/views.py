from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser

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
        try:
            # Additional logging for troubleshooting
            logger.info(f"Received contact form submission: {request.data}")
            
            serializer = ContactSerializer(data=request.data)
            
            if serializer.is_valid():
                try:
                    # Save the submission to database first
                    submission = serializer.save()
                    logger.info(f"Contact submission saved: {submission.id}")
                    
                    # Then attempt to send email - but don't fail if email fails
                    try:
                        # Get the admin email from settings with fallback
                        admin_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
                        logger.info(f"Sending contact notification to: {admin_email}")
                        
                        # Send email through the service
                        email_sent = send_notification_email(
                            user_email=submission.email,
                            url=submission.linkedin_url,
                            message=submission.message,
                            recipient_email=admin_email,
                            subject="New Message from Website User"
                        )
                        
                        if email_sent:
                            logger.info("Notification email sent successfully")
                        else:
                            logger.warning("Notification email failed, but form was processed")
                    
                    except Exception as email_error:
                        # Log email errors but don't fail the request
                        logger.error(f"Email sending failed: {str(email_error)}")
                    
                    # Always return success if the data was saved, even if email fails
                    return Response({
                        "message": "Your message has been sent successfully! We'll contact you soon."
                    }, status=status.HTTP_201_CREATED)
                    
                except Exception as e:
                    # Log the exception
                    logger.error(f"Error saving contact form: {str(e)}")
                    return Response({
                        "error": "An error occurred while processing your request. Please try again later."
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # Handle validation errors
                logger.warning(f"Validation error: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            # Catch-all for any unexpected errors
            logger.error(f"Unexpected error in contact form processing: {str(e)}")
            return Response({
                "error": "An unexpected error occurred. Please try again later."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def test_email_config(request):
    """
    Admin-only endpoint to test email configuration
    """
    try:
        from django.core.mail import send_mail
        
        # Get email settings from Django settings
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
        from_email = settings.DEFAULT_FROM_EMAIL
        
        # Log settings for debugging
        logger.info(f"Testing email with: FROM={from_email}, TO={admin_email}")
        
        # Send a simple test email
        result = send_mail(
            subject="Test Email from Django",
            message="This is a test email to verify your email configuration.",
            from_email=from_email,
            recipient_list=[admin_email],
            fail_silently=False,
        )
        
        if result:
            return Response({"message": "Test email sent successfully"})
        else:
            return Response({"error": "Failed to send test email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        logger.error(f"Error testing email: {str(e)}")
        return Response({"error": f"Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)