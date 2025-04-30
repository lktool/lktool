from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from contact.models import ContactSubmission
from contact.serializers import ContactSubmissionSerializer

class FormSubmissionListView(generics.ListAPIView):
    """
    View to list all contact form submissions for admin users.
    """
    queryset = ContactSubmission.objects.all().order_by('-created_at')
    serializer_class = ContactSubmissionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        """Allow filtering by processed status"""
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')
        
        if status == 'processed':
            return queryset.filter(is_processed=True)
        elif status == 'pending':
            return queryset.filter(is_processed=False)
            
        return queryset

class FormSubmissionDetailView(generics.RetrieveUpdateAPIView):
    """
    View to retrieve or update a specific contact form submission for admin users.
    """
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer
    permission_classes = [IsAdminUser]
    
    def patch(self, request, *args, **kwargs):
        """Allow partial updates for processed status"""
        instance = self.get_object()
        
        # Only allow updating the is_processed field
        if 'is_processed' in request.data:
            instance.is_processed = request.data['is_processed']
            instance.save(update_fields=['is_processed'])
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """Get basic stats about submissions for admin dashboard"""
    total_count = ContactSubmission.objects.count()
    processed_count = ContactSubmission.objects.filter(is_processed=True).count()
    pending_count = total_count - processed_count
    
    return Response({
        'total_submissions': total_count,
        'processed_submissions': processed_count,
        'pending_submissions': pending_count
    })
