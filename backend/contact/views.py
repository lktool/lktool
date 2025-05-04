from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.conf import settings
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from django.core.mail import send_mail
import json
import traceback
from django.db import models
from django.db.models import Q

from .serializers import ContactSerializer
from .models import ContactSubmission
from .email_service import send_notification_email

logger = logging.getLogger(__name__)

class ContactFormView(APIView):
    """
    API endpoint for submitting contact forms
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Add user to request data if authenticated
        data = request.data.copy()
        if request.user.is_authenticated:
            data['email'] = request.user.email
            
        serializer = ContactSerializer(data=data)
        if serializer.is_valid():
            submission = serializer.save()
            
            # Send email notification to admin
            try:
                subject = f"New LinkedIn Profile Submission: {submission.email}"
                message = f"""
                A new LinkedIn profile has been submitted:
                
                Email: {submission.email}
                LinkedIn URL: {submission.linkedin_url}
                
                Message:
                {submission.message}
                
                You can review this submission in the admin dashboard.
                """
                from_email = settings.DEFAULT_FROM_EMAIL
                recipient_list = [settings.ADMIN_EMAIL]
                
                # Log email attempt
                print(f"Attempting to send email to {recipient_list} from {from_email}")
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=from_email,
                    recipient_list=recipient_list,
                    fail_silently=False,
                )
                print("Email sent successfully")
            except Exception as e:
                print(f"Failed to send email notification: {e}")
                # Continue even if email fails - don't impact user experience
            
            return Response({"message": "Form submitted successfully!"}, status=status.HTTP_201_CREATED)
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

class UserSubmissionsView(APIView):
    """
    API endpoint for users to view their own submissions
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get current user's email
        user_email = request.user.email
        
        # Fetch submissions matching the user's email
        submissions = ContactSubmission.objects.filter(email=user_email).order_by('-created_at')
        serializer = ContactSerializer(submissions, many=True)
        return Response(serializer.data)

class UserAnalysesView(APIView):
    """API endpoint for users to view analyses of their submissions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get current user's email
        user_email = request.user.email
        
        # Fetch submissions with analyses
        submissions = ContactSubmission.objects.filter(
            email=user_email, 
            is_processed=True,
            analysis__isnull=False
        ).order_by('-created_at')
        
        data = []
        for submission in submissions:
            data.append({
                'id': submission.id,
                'linkedin_url': submission.linkedin_url,
                'created_at': submission.created_at,
                'analysis': submission.analysis
            })
        
        return Response(data)