from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.conf import settings
from django.contrib.auth import get_user_model
import jwt
from datetime import datetime, timedelta

from contact.models import ContactSubmission
from contact.serializers import ContactSerializer  # Fixed import name
from .serializers import AdminUserSerializer
from users.models import CustomUser

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
            
        # Generate admin-specific token
        payload = {
            'user_type': 'admin',
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
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
        
        serializer = ContactSerializer(submissions, many=True)  # Fixed serializer name
        return Response(serializer.data)
        
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
            
        serializer = ContactSerializer(submission)  # Fixed serializer name
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
    """View to list all users for admin selection"""
    
    def get(self, request):
        # Debug authentication state
        print(f"Admin auth check: is_admin={getattr(request, 'is_admin', False)}")
        print(f"Auth header: {request.headers.get('Authorization')}")
        
        # Always return JSON, never HTML
        try:
            # Check if admin
            if not getattr(request, 'is_admin', False):
                return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Create minimal user data that always works
            data = []
            try:
                users = CustomUser.objects.filter(is_active=True)
                for user in users:
                    data.append({"id": user.id, "email": user.email})
            except Exception as e:
                print(f"Database error: {e}")
                # Return empty array but with 200 status
                
            # Return JSON data with explicit content type
            return Response(
                data, 
                status=status.HTTP_200_OK,
                content_type="application/json"
            )
        except Exception as e:
            print(f"Critical error in UserListView: {e}")
            # Return a proper JSON response even for critical errors
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content_type="application/json"
            )

class UserSubmissionsView(APIView):
    """View to fetch submissions for a specific user"""
    def get(self, request, user_id):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            # Get the user with proper error handling
            try:
                user = CustomUser.objects.get(id=user_id)
            except CustomUser.DoesNotExist:
                return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
                
            # Get submissions for this user
            submissions = ContactSubmission.objects.filter(email=user.email).order_by('-created_at')
            
            # Prepare response data
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
            
        except Exception as e:
            print(f"Error in UserSubmissionsView: {e}")
            return Response(
                {"detail": f"Error fetching submissions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
