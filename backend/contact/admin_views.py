from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.core.paginator import Paginator
from django.utils import timezone
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer, AdminAnalysisSerializer
from users.authentication import AdminJWTAuthentication
from .email_service import send_notification_email
import traceback

class AdminSubmissionsView(APIView):
    """
    API endpoint for admin to view submissions
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request):
        # Debug info
        print(f"AdminSubmissionsView - user: {request.user}, is_staff: {request.user.is_staff}, role: {getattr(request.user, 'role', 'unknown')}")
        
        try:
            # Get filter parameters
            status_filter = request.query_params.get('status')
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            # Build query - use proper ordering to ensure latest submissions appear first
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
            
            # Add cache busting headers to response
            response = Response({
                'submissions': serializer.data,
                'total_count': paginator.count,
                'total_pages': paginator.num_pages,
                'current_page': page
            })
            
            # Add cache control headers to prevent caching
            response["Cache-Control"] = "no-cache, no-store, must-revalidate, private"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
            
            return response
        except Exception as e:
            print(f"Error in AdminSubmissionsView.get: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'An error occurred while fetching submissions',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminSubmissionDetailView(APIView):
    """
    API endpoint for admin to get a specific submission
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request, submission_id):
        print(f"AdminSubmissionDetailView - user: {request.user}, is_staff: {request.user.is_staff}")
        
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            serializer = ContactSubmissionSerializer(submission)
            
            # Start with the serialized data
            data = serializer.data
            
            # Safely access form_data - it might not exist in the database yet
            try:
                # Try to get form_data through the property
                form_data = submission.form_data
                data['form_data'] = form_data if form_data else {}
            except Exception as e:
                print(f"Warning: Could not access form_data: {e}")
                data['form_data'] = {}
            
            return Response(data)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in AdminSubmissionDetailView: {e}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminReplyView(APIView):
    """
    API endpoint for admins to reply to user submissions with LinkedIn analysis
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def post(self, request, submission_id):
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            
            # Debug the request data
            print(f"AdminReplyView - Processing reply for submission {submission_id}")
            print(f"Request data: {request.data}")
            
            # Get data from request
            reply_text = request.data.get('reply')
            form_data = request.data.get('form_data')
            
            if form_data:
                print(f"Form data received: {type(form_data)}")
                print(f"Form data sample: {list(form_data.items())[:5]}")
            else:
                print("No form data received in request")
            
            # Update submission with admin reply
            submission.admin_reply = reply_text
            
            # Only try to set form_data if it's provided
            if form_data:
                try:
                    # Store form_data as a JSON field - use proper data structure
                    submission.form_data = form_data
                    print(f"Form data saved to submission {submission_id}")
                except Exception as e:
                    print(f"Warning: Could not save form_data: {e}")
                    print(traceback.format_exc())
            
            submission.admin_reply_date = timezone.now()
            submission.is_processed = True
            submission.save()
            
            # Create email and send notification
            # ...existing email sending code...
            
            return Response({
                "message": f"Reply {'updated and resent' if submission.admin_reply_date else 'sent'} successfully",
                "submission_id": submission_id
            }, status=status.HTTP_200_OK)
            
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in AdminReplyView: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminProcessedSubmissionsView(APIView):
    """
    API endpoint for admin to view already processed submissions
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request):
        print(f"AdminProcessedSubmissionsView - user: {request.user}, is_staff: {request.user.is_staff}")
        
        try:
            # Get filter parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            # Use a raw query to avoid the field that might not exist
            from django.db import connection
            
            # Query only the fields we know exist
            query = """
            SELECT id, linkedin_url, message, email, created_at, 
                   name, subject, message_type, user_id, admin_reply, 
                   admin_reply_date, is_processed
            FROM contact_contactsubmission
            WHERE is_processed = true
            ORDER BY admin_reply_date DESC
            """
            
            with connection.cursor() as cursor:
                cursor.execute(query)
                columns = [col[0] for col in cursor.description]
                submissions_raw = [dict(zip(columns, row)) for row in cursor.fetchall()]
            
            # Manual pagination
            total_count = len(submissions_raw)
            total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
            
            start = (page - 1) * page_size
            end = min(start + page_size, total_count)
            paginated_submissions = submissions_raw[start:end]
            
            # Add empty form_data to each submission
            for sub in paginated_submissions:
                sub['form_data'] = {}
                # Format dates as strings
                if sub['created_at']:
                    sub['created_at'] = sub['created_at'].isoformat() if hasattr(sub['created_at'], 'isoformat') else sub['created_at']
                if sub['admin_reply_date']:
                    sub['admin_reply_date'] = sub['admin_reply_date'].isoformat() if hasattr(sub['admin_reply_date'], 'isoformat') else sub['admin_reply_date']
            
            return Response({
                'submissions': paginated_submissions,
                'total_count': total_count,
                'total_pages': total_pages,
                'current_page': page
            })
            
        except Exception as e:
            print(f"Error in AdminProcessedSubmissionsView.get: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'An error occurred while fetching processed submissions',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, submission_id):
        """Delete a processed submission"""
        try:
            submission = ContactSubmission.objects.get(id=submission_id, is_processed=True)
            submission.delete()
            return Response({"message": "Submission deleted successfully"}, status=status.HTTP_200_OK)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in AdminProcessedSubmissionsView.delete: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
