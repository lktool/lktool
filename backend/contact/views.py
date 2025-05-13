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
from django.utils import timezone

from .serializers import ContactSerializer, ContactFormSerializer
from .models import ContactSubmission
from .email_service import send_notification_email

logger = logging.getLogger(__name__)

class ContactFormView(APIView):
    """
    API endpoint for submitting contact forms
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Create a copy of request data to modify
        data = request.data.copy()
        
        # If user is authenticated, ensure we use their authenticated email
        if request.user.is_authenticated:
            # Use the exact authenticated email (don't rely on form input)
            user_email = request.user.email
            print(f"Associating submission with authenticated user: {user_email}")
            data['email'] = user_email
            
        # Debug the submission data
        print(f"Processing submission with data: {data}")
        
        serializer = ContactSerializer(data=data)
        if serializer.is_valid():
            submission = serializer.save()
            print(f"Created submission ID {submission.id} for email {submission.email}")
            
            # Add user reference if authenticated
            if request.user.is_authenticated:
                submission.user = request.user
                submission.save(update_fields=['user'])
                print(f"Updated submission with user reference: {request.user}")
            
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
                recipient_list = [settings.ADMIN_EMAIL]
                
                # Log email attempt
                print(f"Attempting to send email to {recipient_list} from {settings.DEFAULT_FROM_EMAIL}")
                
                send_notification_email(
                    subject=subject,
                    message=message,
                    recipient_list=recipient_list
                )
                print("Email sent successfully")
            except Exception as e:
                print(f"Failed to send email notification: {e}")
                # Continue even if email fails - don't impact user experience
            
            return Response({"message": "Form submitted successfully!"}, status=status.HTTP_201_CREATED)
        
        # Debug validation errors
        print(f"Validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContactMessageView(APIView):
    """
    API endpoint for sending contact form messages
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Create a copy of request data
        data = request.data.copy()
        
        # Add authenticated user email if available
        if request.user.is_authenticated:
            data['email'] = request.user.email
            
        serializer = ContactFormSerializer(data=data)
        if serializer.is_valid():
            submission = serializer.save()
            
            # Send email notification to admin
            try:
                subject = f"New Contact Form Message: {submission.subject}"
                message = f"""
                A new contact form message has been submitted:
                
                From: {submission.name} <{submission.email}>
                Subject: {submission.subject}
                Type: {submission.message_type}
                
                Message:
                {submission.message}
                """
                send_notification_email(
                    subject=subject,
                    message=message,
                    recipient_list=[settings.ADMIN_EMAIL]
                )
            except Exception as e:
                print(f"Failed to send contact notification: {e}")
                
            return Response({"message": "Your message has been sent successfully!"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmitFormView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Add the authenticated user's email to the submission data
        data = request.data.copy()
        data['email'] = request.user.email
        
        print(f"Processing submission with data: {data}")
        
        serializer = ContactSerializer(data=data)
        if serializer.is_valid():
            # Associate the submission with the authenticated user
            print(f"Associating submission with authenticated user: {request.user.email}")
            submission = serializer.save(user=request.user)
            
            # Send email notification to admin
            try:
                subject = f"New LinkedIn Profile Submission: {submission.email}"
                message = f"""
                A new LinkedIn profile has been submitted:
                
                Email: {submission.email}
                LinkedIn URL: {submission.linkedin_url}
                
                Message:
                {submission.message or 'No additional message provided'}
                
                You can review this submission in the admin dashboard.
                """
                
                # Print debug information before sending
                print(f"Attempting to send admin notification email to {settings.ADMIN_EMAIL}")
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.ADMIN_EMAIL],
                    fail_silently=False,
                )
                
                print(f"Admin notification email sent successfully to {settings.ADMIN_EMAIL}")
            except Exception as e:
                print(f"Failed to send admin notification email: {str(e)}")
                # Log the error but don't affect the user response
                logger.error(f"Failed to send admin notification: {str(e)}", exc_info=True)
            
            # Return the submission data along with a success message
            return Response({
                "success": True, 
                "data": serializer.data,
                "message": "LinkedIn profile submitted successfully!"
            }, status=status.HTTP_201_CREATED)
            
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
        # Get the authenticated user's email - prevent any potential spoofing
        user_email = request.user.email
        
        # Debug the user email and query
        print(f"Fetching submissions for authenticated user: {user_email}")
        
        try:
            # Filter strictly by the authenticated user's email
            submissions = ContactSubmission.objects.filter(
                email__iexact=user_email
            ).order_by('-created_at')
            
            # Build simple dictionaries with only required fields
            submissions_list = []
            for sub in submissions:
                submission_data = {
                    'id': sub.id,
                    'linkedin_url': sub.linkedin_url,
                    'message': sub.message,
                    'email': sub.email,
                    'is_processed': sub.is_processed,
                    'created_at': sub.created_at.isoformat(),
                }
                
                # Only include these fields if they have values
                if hasattr(sub, 'admin_reply') and sub.admin_reply:
                    submission_data['admin_reply'] = sub.admin_reply
                    
                if hasattr(sub, 'admin_reply_date') and sub.admin_reply_date:
                    submission_data['admin_reply_date'] = sub.admin_reply_date.isoformat()
                
                submissions_list.append(submission_data)
            
            # Debug the query results
            print(f"Found {len(submissions_list)} submissions for {user_email}")
            
            # Add strong cache control headers to prevent browser/CDN caching
            response = Response(submissions_list)
            response["Cache-Control"] = "no-cache, no-store, must-revalidate, private"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
            
            # Add a unique ETag based on user email to prevent other users' data being served
            import hashlib
            user_hash = hashlib.md5(user_email.encode()).hexdigest()[:10]
            response["ETag"] = f"\"user-{user_hash}-{len(submissions_list)}\""
            
            return response
            
        except Exception as e:
            # Log the full error with traceback for debugging
            import traceback
            print(f"Error in UserSubmissionsView: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": "An error occurred while fetching your submissions"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserAnalysesView(APIView):
    """API endpoint for users to view analyses of their submissions"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Get current user's email
        user_email = request.user.email
        
        # Fetch submissions with analyses
        submissions = ContactSubmission.objects.filter(
            email__iexact=user_email, 
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

class AdminReplyView(APIView):
    """
    API endpoint for admins to reply to user submissions
    """
    permission_classes = [IsAdminUser]
    
    def post(self, request, submission_id):
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            
            # Update submission with admin reply
            submission.admin_reply = request.data.get('reply')
            submission.admin_reply_date = timezone.now()
            submission.is_processed = True
            submission.save()
            
            # Send email notification to user using the email_service
            try:
                subject = f"Response to your LinkedIn Profile Submission"
                message = f"""
                Hello,
                
                We've reviewed your LinkedIn profile submission and provided feedback:
                
                {submission.admin_reply}
                
                You can view this response in your account dashboard.
                
                Thank you for using our service!
                """
                
                send_notification_email(
                    subject=subject,
                    message=message,
                    recipient_list=[submission.email]
                )
                
                print(f"Reply notification email sent to {submission.email}")
            except Exception as e:
                print(f"Failed to send reply notification: {e}")
            
            return Response({"message": "Reply sent successfully"}, status=status.HTTP_200_OK)
            
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)