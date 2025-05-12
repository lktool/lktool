from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.core.paginator import Paginator
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer

class AdminSubmissionsView(APIView):
    """
    API endpoint for admin to view submissions
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Check if user is admin - extra safeguard
        if not request.user.is_staff and not getattr(request.user, 'role', '') == 'admin':
            print(f"Access denied for user {request.user} - role: {getattr(request.user, 'role', 'unknown')}")
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
        print(f"Admin access granted for user {request.user.email}")
        
        # Get filter parameters
        status_filter = request.query_params.get('status')
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Build query
        submissions = ContactSubmission.objects.all().order_by('-created_at')
        
        # Apply filters
        if status_filter == 'pending':
            submissions = submissions.filter(is_processed=False)
        elif status_filter == 'processed':
            submissions = submissions.filter(is_processed=True)
            
        # Paginate results
        paginator = Paginator(submissions, page_size)
        page_obj = paginator.get_page(page)
        
        # Serialize data
        serializer = ContactSubmissionSerializer(page_obj, many=True)
        
        return Response({
            'submissions': serializer.data,
            'total_count': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page
        })

class AdminSubmissionDetailView(APIView):
    """
    API endpoint for admin to get a specific submission
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request, submission_id):
        # Check if user is admin - extra safeguard
        if not request.user.is_staff and not getattr(request.user, 'role', '') == 'admin':
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            serializer = ContactSubmissionSerializer(submission)
            return Response(serializer.data)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
