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
