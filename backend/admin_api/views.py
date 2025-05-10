from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from django.utils import timezone

from contact.models import ContactSubmission
from contact.serializers import ContactSerializer  # Fixed import name
from contact.email_service import send_reply_notification
from unified_auth_api.permissions import IsAdminUserCustom

class AdminLoginView(APIView):
    """
    Secure admin login endpoint that uses hardcoded credentials from settings
    """
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Debug output to server logs
        print(f"Admin login attempt with: {email}")
        print(f"Expected admin email: {settings.ADMIN_EMAIL}")
        print(f"Passwords match: {password == settings.ADMIN_PASSWORD}")
        
        # Compare with hardcoded admin credentials
        if email != settings.ADMIN_EMAIL or password != settings.ADMIN_PASSWORD:
            print("Admin login failed: credentials mismatch")
            return Response(
                {"detail": "Invalid admin credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # UPDATED: Use standard JWT token format but with admin role
        # Create a token with admin role 
        token_payload = {
            'user_type': 'admin',
            'role': 'admin',
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')
        print("Admin login successful")
        
        return Response({
            'token': token,
            'message': 'Admin login successful'
        })

class AdminAuthMiddleware:
    """
    Custom middleware to verify admin tokens
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        admin_auth_header = request.META.get('HTTP_ADMIN_AUTHORIZATION')
        if admin_auth_header and admin_auth_header.startswith('Bearer '):
            token = admin_auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                if payload.get('user_type') == 'admin':
                    request.is_admin = True
            except jwt.PyJWTError:
                request.is_admin = False
        else:
            request.is_admin = False
            
        return self.get_response(request)
        
class FormSubmissionListView(APIView):
    """
    View to list all contact form submissions for admin
    """
    permission_classes = [IsAdminUserCustom]
    
    def get(self, request):
        submissions = ContactSubmission.objects.all().order_by('-created_at')
        
        # Filter by status if requested - Apply filter BEFORE serializing
        status_filter = request.query_params.get('status')
        if status_filter == 'processed':
            submissions = submissions.filter(is_processed=True)
        elif status_filter == 'pending':
            submissions = submissions.filter(is_processed=False)
        
        serializer = ContactSerializer(submissions, many=True)  # Fixed serializer name
        return Response(serializer.data)
        
class UpdateSubmissionStatusView(APIView):
    """
    View to update a submission's processed status
    """
    permission_classes = [IsAdminUserCustom]
    
    def patch(self, request, pk):
        try:
            submission = ContactSubmission.objects.get(pk=pk)
        except ContactSubmission.DoesNotExist:
            return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Update is_processed status
        is_processed = request.data.get('is_processed')
        if is_processed is not None:
            submission.is_processed = bool(is_processed)
            submission.save(update_fields=['is_processed'])
            
        serializer = ContactSerializer(submission)  # Fixed serializer name
        return Response(serializer.data)

class AdminStatsView(APIView):
    """
    View to get statistics for the admin dashboard
    """
    permission_classes = [IsAdminUserCustom]
    
    def get(self, request):
        total_count = ContactSubmission.objects.count()
        processed_count = ContactSubmission.objects.filter(is_processed=True).count()
        pending_count = total_count - processed_count
        
        return Response({
            'total': total_count,
            'processed': processed_count,
            'pending': pending_count
        })

class SubmissionReplyView(APIView):
    """
    View to add admin reply to a submission
    """
    permission_classes = [IsAdminUserCustom]
    
    def post(self, request, pk):
        try:
            submission = ContactSubmission.objects.get(pk=pk)
        except ContactSubmission.DoesNotExist:
            return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Get the reply text from request data
        reply_text = request.data.get('reply')
        if not reply_text:
            return Response({"detail": "Reply text is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update submission with admin reply
        submission.admin_reply = reply_text
        submission.admin_reply_date = timezone.now()
        submission.is_processed = True
        submission.save()
        
        # Send email notification to user
        try:
            send_reply_notification(submission)
        except Exception as e:
            # Log error but don't fail the request
            print(f"Failed to send reply notification: {e}")
        
        return Response({
            "message": "Reply sent successfully",
            "submission": ContactSerializer(submission).data
        })
