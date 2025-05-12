from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import ContactSubmission
from .serializers import ContactSerializer

class SubmissionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminSubmissionsView(APIView):
    """
    API endpoint for admins to view and filter all submissions
    """
    permission_classes = [IsAdminUser]
    pagination_class = SubmissionPagination
    
    def get(self, request):
        # Get filter parameters
        status_filter = request.query_params.get('status')
        search_query = request.query_params.get('search')
        
        # Start with all submissions
        queryset = ContactSubmission.objects.all()
        
        # Apply status filter
        if status_filter:
            if status_filter == 'processed':
                queryset = queryset.filter(is_processed=True)
            elif status_filter == 'pending':
                queryset = queryset.filter(is_processed=False)
        
        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(email__icontains=search_query) | 
                Q(linkedin_url__icontains=search_query) |
                Q(message__icontains=search_query)
            )
            
        # Apply sorting (default to newest first)
        sort_by = request.query_params.get('sort', '-created_at')
        queryset = queryset.order_by(sort_by)
        
        # Paginate the results
        paginator = self.pagination_class()
        paginated_queryset = paginator.paginate_queryset(queryset, request)
        
        # Serialize and return
        serializer = ContactSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

class AdminSubmissionDetailView(APIView):
    """
    API endpoint for admins to view, update or delete a specific submission
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request, submission_id):
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            serializer = ContactSerializer(submission)
            return Response(serializer.data)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, submission_id):
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            
            # Update only allowed fields
            if 'is_processed' in request.data:
                submission.is_processed = request.data.get('is_processed')
            
            submission.save()
            
            serializer = ContactSerializer(submission)
            return Response(serializer.data)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, submission_id):
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            submission.delete()
            return Response({"message": "Submission deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
