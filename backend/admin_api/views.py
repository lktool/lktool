from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from django.conf import settings
import jwt
from datetime import datetime, timedelta

from contact.models import ContactSubmission
from contact.serializers import ContactSerializer  # Fixed import name

class AdminLoginView(APIView):
    """
    Secure admin login endpoint that uses hardcoded credentials from settings
    """
    permission_classes = []
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Compare with hardcoded admin credentials
        if email != settings.ADMIN_EMAIL or password != settings.ADMIN_PASSWORD:
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
