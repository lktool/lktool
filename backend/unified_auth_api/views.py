from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from contact.models import ContactSubmission
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q

from .models import SubmissionAnalysis
from .serializers import (
    CustomTokenObtainPairSerializer, UserSerializer, SubmissionSerializer, 
    UserSubmissionDetailSerializer, AdminSubmissionSerializer, AnalysisSerializer
)
from .permissions import IsOwnerOrAdmin, IsAdminUser

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view with user role information"""
    serializer_class = CustomTokenObtainPairSerializer

class UserSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for user's submissions"""
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return only user's own submissions"""
        return ContactSubmission.objects.filter(
            Q(user=self.request.user) | 
            Q(email__iexact=self.request.user.email)
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'retrieve':
            return UserSubmissionDetailSerializer
        return SubmissionSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to enforce access control"""
        instance = self.get_object()
        
        # If submission is not processed and user wants to see details,
        # return a limited view without analysis
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class AdminSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for admin to manage all submissions"""
    queryset = ContactSubmission.objects.all()
    serializer_class = AdminSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        """Allow filtering by processed status"""
        queryset = ContactSubmission.objects.all()
        
        status_filter = self.request.query_params.get('status')
        if status_filter == 'processed':
            queryset = queryset.filter(is_processed=True)
        elif status_filter == 'pending':
            queryset = queryset.filter(is_processed=False)
            
        return queryset.order_by('-created_at')
        
    def partial_update(self, request, *args, **kwargs):
        """
        Handle admin replies and updates to submissions
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Check if this is an admin reply
        admin_reply = request.data.get('admin_reply')
        if admin_reply:
            # Set reply date automatically
            serializer.validated_data['admin_reply_date'] = timezone.now()
            # Mark as processed when replied to
            serializer.validated_data['is_processed'] = True
            
            # Send email notification if email changed
            if instance.admin_reply != admin_reply:
                try:
                    self._send_reply_notification(instance, admin_reply)
                except Exception as e:
                    # Log error but don't fail the update
                    print(f"Failed to send reply notification: {e}")
        
        # Perform update
        self.perform_update(serializer)
        return Response(serializer.data)
        
    def _send_reply_notification(self, submission, reply_text):
        """Send notification when admin replies to a submission"""
        subject = "Response to your LinkedIn Profile Submission"
        message = f"""
        Hello,
        
        We've reviewed your LinkedIn profile submission and provided feedback.
        
        Admin Reply: {reply_text}
        
        Original Message: {submission.message}
        LinkedIn URL: {submission.linkedin_url}
        
        Thank you for using our service.
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[submission.email],
            fail_silently=False
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Return submission statistics for admin dashboard"""
        total = ContactSubmission.objects.count()
        processed = ContactSubmission.objects.filter(is_processed=True).count()
        pending = total - processed
        
        return Response({
            'total': total,
            'processed': processed,
            'pending': pending
        })

class AnalysisViewSet(viewsets.ModelViewSet):
    """ViewSet for advanced analysis of submissions"""
    serializer_class = AnalysisSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    def get_queryset(self):
        return SubmissionAnalysis.objects.all().order_by('-analyzed_at')
