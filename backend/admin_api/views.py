from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.conf import settings
import jwt
from datetime import datetime, timedelta

from contact.models import ContactSubmission
from contact.serializers import ContactSerializer  # Fixed import name
from .serializers import AdminContactSerializer
from users.models import CustomUser
from users.serializers import UserSerializer

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
    
    def post(self, request):
        """Handle LinkedIn profile analysis submission"""
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            # Get required data
            submission_id = request.data.get('submission')
            analysis_data = request.data.get('data')
            
            # Validate data
            if not submission_id or not analysis_data:
                return Response({"detail": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
                
            # Get the submission
            submission = ContactSubmission.objects.get(id=submission_id)
            
            # Use admin serializer to update analysis
            serializer = AdminContactSerializer(
                submission, 
                data={'analysis': analysis_data, 'is_processed': True},
                partial=True
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Analysis saved successfully"}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except ContactSubmission.DoesNotExist:
            return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class UpdateSubmissionStatusView(APIView):
    """
    View to update a submission's processed status and analysis
    """
    def patch(self, request, pk):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        try:
            submission = ContactSubmission.objects.get(pk=pk)
        except ContactSubmission.DoesNotExist:
            return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Use admin serializer that allows updating analysis field
        serializer = AdminContactSerializer(submission, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class UserSubmissionsView(APIView):
    """
    View to fetch submissions for a specific user (Admin only)
    """
    def get(self, request, user_id):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        from users.models import CustomUser
        try:
            # First check if user exists
            user = CustomUser.objects.get(id=user_id)
            
            # Get submissions for this user's email
            submissions = ContactSubmission.objects.filter(email=user.email).order_by('-created_at')
            serializer = ContactSerializer(submissions, many=True)
            
            return Response(serializer.data)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserListView(APIView):
    """
    View to list all users for the admin dashboard
    """
    def get(self, request):
        # Check if user is admin
        if not getattr(request, 'is_admin', False):
            return Response({"detail": "Admin authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            
        users = CustomUser.objects.all().order_by('-date_joined')
        
        # Create a simplified serializer response for better performance
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'email': user.email,
                'is_verified': user.is_verified,
                'date_joined': user.date_joined
            })
            
        return Response(user_data)
