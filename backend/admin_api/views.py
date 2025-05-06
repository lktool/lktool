from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, AllowAny
from django.conf import settings
from django.contrib.auth import get_user_model
import jwt
from datetime import datetime, timedelta

from contact.models import ContactSubmission
from contact.serializers import ContactSerializer
from users.models import CustomUser  # Direct import instead of get_user_model()

class AdminLoginView(APIView):
    """
    Admin login view
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"Admin login attempt for: {email}")
        
        # Check if email and password match the admin credentials
        if email == settings.ADMIN_EMAIL and password == settings.ADMIN_PASSWORD:
            # Generate token with proper structure
            payload = {
                'email': email,
                'is_admin': True,
                'user_id': 'admin',  # Add required ID field
                'token_type': 'access',  # Add token type field
                'jti': datetime.utcnow().timestamp(),  # Add JWT ID
                'exp': datetime.utcnow() + timedelta(days=1)  # 1 day expiry
            }
            
            # Make sure token uses HS256 algorithm
            token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            # Convert bytes to string if needed
            if isinstance(token, bytes):
                token = token.decode('utf-8')
                
            print(f"Generated admin token with payload: {payload}")
            
            return Response({'token': token})
        
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class FormSubmissionListView(APIView):
    """
    View to list all contact form submissions for admin
    Also handles LinkedIn analysis submission
    """
    def get(self, request):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        submissions = ContactSubmission.objects.all().order_by('-created_at')
        
        # Filter by status if requested - Apply filter BEFORE serializing
        status_filter = request.query_params.get('status')
        if status_filter == 'processed':
            submissions = submissions.filter(is_processed=True)
        elif status_filter == 'pending':
            submissions = submissions.filter(is_processed=False)
        
        serializer = ContactSerializer(submissions, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Handle LinkedIn profile analysis submission"""
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get required data
            user_id = request.data.get('user')
            submission_id = request.data.get('submission')
            analysis_data = request.data.get('data')
            
            # Validate data
            if not user_id or not submission_id or not analysis_data:
                return Response({"detail": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Get the submission
            try:
                submission = ContactSubmission.objects.get(id=submission_id)
            except ContactSubmission.DoesNotExist:
                return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
            
            # Store analysis as JSON field
            submission.analysis = analysis_data
            # Mark as processed
            submission.is_processed = True
            submission.save()
            
            return Response({"message": "Analysis saved successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateSubmissionStatusView(APIView):
    """
    View to update a submission's processed status
    """
    def patch(self, request, pk):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            submission = ContactSubmission.objects.get(pk=pk)
        except ContactSubmission.DoesNotExist:
            return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Update is_processed status
        is_processed = request.data.get('is_processed')
        if is_processed is not None:
            submission.is_processed = bool(is_processed)
            submission.save(update_fields=['is_processed'])
            
        serializer = ContactSerializer(submission)
        return Response(serializer.data)

class AdminStatsView(APIView):
    """
    View to get statistics for the admin dashboard
    """
    def get(self, request):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        total_count = ContactSubmission.objects.count()
        processed_count = ContactSubmission.objects.filter(is_processed=True).count()
        pending_count = total_count - processed_count
        
        return Response({
            'total': total_count,
            'processed': processed_count,
            'pending': pending_count
        })

class UserListView(APIView):
    """List all active users for admin dropdown."""
    
    def get(self, request):
        # ...existing AdminAuthMiddleware sets request.is_admin...
        if not getattr(request, 'is_admin', False):
            return Response(
                {"detail": "Admin authentication required"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Fetch only id and email—no serialization issues
            qs = CustomUser.objects.filter(is_active=True)
            users = list(qs.values('id', 'email').order_by('-date_joined'))
            return Response(users, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Log the exception server‐side for diagnosis
            print(f"UserListView error: {e}")
            return Response(
                {"detail": "Error fetching users", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserSubmissionsView(APIView):
    """View to fetch submissions for a specific user"""
    def get(self, request, user_id):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            user = CustomUser.objects.get(id=user_id)
            # First try to get submissions by user FK relation
            submissions = ContactSubmission.objects.filter(user=user).order_by('-created_at')
            
            # If that doesn't work, try by email
            if submissions.count() == 0:
                submissions = ContactSubmission.objects.filter(email=user.email).order_by('-created_at')
                
            data = []
            for sub in submissions:
                data.append({
                    "id": sub.id,
                    "email": sub.email,
                    "linkedin_url": sub.linkedin_url,
                    "created_at": sub.created_at,
                    "is_processed": sub.is_processed,
                    "has_analysis": sub.analysis is not None
                })
            return Response(data)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
