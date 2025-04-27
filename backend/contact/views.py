from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from django.core.mail import send_mail
import json
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
                # Save the submission to database
                submission = serializer.save()
                
                # Get admin email from settings
                admin_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
                
                # Log the email details for debugging
                logger.info(f"Contact form submission: {submission.id}")
                logger.info(f"Admin email from settings: {admin_email}")
                logger.info(f"From email: {settings.DEFAULT_FROM_EMAIL}")
                
                # Send email notification using our service
                email_sent = send_notification_email(
                    user_email=submission.email,
                    url=submission.linkedin_url,
                    message=submission.message,
                    recipient_email=admin_email,
                    subject="New Message from Website User"
                )
                
                if email_sent:
                    logger.info("Email notification sent successfully")
                else:
                    logger.warning("Failed to send email notification, but submission was saved")
                
                # Always return success if the form was saved, even if email failed
                return Response({
                    "message": "Your message has been received. We'll contact you soon.",
                    "email_sent": email_sent
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Error processing contact form: {str(e)}")
                return Response({
                    "error": "An error occurred while processing your request. Please try again later."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def test_email(request):
    """Admin only view to test email configuration"""
    try:
        # Get email settings from Django settings
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
        from_email = settings.DEFAULT_FROM_EMAIL
        email_host = settings.EMAIL_HOST
        email_port = settings.EMAIL_PORT
        email_user = settings.EMAIL_HOST_USER
        
        # Log settings
        logger.info(f"Testing email: FROM={from_email}, TO={admin_email}, HOST={email_host}, PORT={email_port}, USER={email_user}")
        
        # Send test email
        result = send_mail(
            subject="Test Email from Django",
            message="This is a test email to verify your email configuration.",
            from_email=from_email,
            recipient_list=[admin_email],
            fail_silently=False
        )
        
        # Return result
        return HttpResponse(
            json.dumps({
                "success": result > 0,
                "message": f"Email sent: {result}",
                "config": {
                    "host": email_host,
                    "port": email_port,
                    "from": from_email,
                    "to": admin_email,
                    "use_tls": settings.EMAIL_USE_TLS
                }
            }),
            content_type="application/json"
        )
    except Exception as e:
        return HttpResponse(
            json.dumps({
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc()
            }),
            content_type="application/json",
            status=500
        )