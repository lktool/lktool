from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q

User = get_user_model()

from .models import SubmissionAnalysis
from .serializers import (
    CustomTokenObtainPairSerializer, UserSerializer, SubmissionSerializer,
    UserSubmissionDetailSerializer, AdminSubmissionSerializer, AnalysisSerializer,
    RegisterSerializer
)
from .permissions import IsOwnerOrAdmin, IsAdminUser

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view with user role information"""
    serializer_class = CustomTokenObtainPairSerializer

class RegisterUserView(generics.CreateAPIView):
    """Register a new user"""
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    """View or update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user

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

class GoogleAuthView(APIView):
    """
    Handle Google authentication with their OAuth2 tokens
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        credential = request.data.get('credential')
        action = request.data.get('action', 'login')  # 'login' or 'signup'
        
        if not credential:
            return Response(
                {"error": "Google credential is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the Google ID token
            client_id = os.environ.get('GOOGLE_CLIENT_ID', 
                '865917249576-o12qfisk9hpp4b10vjvdj2d1kqhunva9.apps.googleusercontent.com')
            
            id_info = id_token.verify_oauth2_token(
                credential, google_requests.Request(), client_id
            )
            
            # Get email from verified token
            email = id_info.get('email')
            if not email:
                return Response(
                    {"error": "Email not found in Google token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                
                # If action is signup but user exists
                if action == 'signup':
                    return Response(
                        {"error": "Account already exists", "needs_login": True}, 
                        status=status.HTTP_409_CONFLICT
                    )
                
            except User.DoesNotExist:
                # If action is login but user doesn't exist
                if action == 'login':
                    return Response(
                        {"error": "Account not found", "needs_signup": True}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Create new user for signup action
                user = User.objects.create_user(
                    email=email,
                    username=email,  # Use email as username
                    is_verified=True,  # Google-verified email
                    password=None  # No password for social login
                )
                
                # Set some default fields from Google data
                if 'given_name' in id_info:
                    user.first_name = id_info['given_name']
                if 'family_name' in id_info:
                    user.last_name = id_info['family_name']
                
                user.save()
            
            # Generate JWT token
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            # Add custom claims
            refresh['email'] = user.email
            
            # Check admin status
            is_admin = user.is_staff or user.email == getattr(settings, 'ADMIN_EMAIL', None)
            refresh['role'] = 'admin' if is_admin else 'user'
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'role': 'admin' if is_admin else 'user',
                'is_staff': is_admin,
                'user_id': user.id,
                'is_new_user': action == 'signup'
            })
            
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
