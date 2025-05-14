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
            
            # Safely handle form_data access
            try:
                # Check if form_data property/method exists and has a value
                if hasattr(submission, 'form_data'):
                    form_data = submission.form_data
                    if form_data:
                        data['form_data'] = form_data
                elif hasattr(submission, '_form_data') and submission._form_data:
                    # Try to access the raw field if property doesn't exist
                    import json
                    try:
                        data['form_data'] = json.loads(submission._form_data)
                    except (json.JSONDecodeError, TypeError):
                        data['form_data'] = {}
                else:
                    # No form data found
                    data['form_data'] = {}
            except Exception as e:
                print(f"Error accessing form_data: {e}")
                print(traceback.format_exc())
                # Provide empty default if access fails
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
            
            # Get data from request
            reply_text = request.data.get('reply')
            form_data = request.data.get('form_data')
            
            # Update submission with admin reply and form data
            submission.admin_reply = reply_text
            if form_data:
                submission.form_data = form_data
            
            submission.admin_reply_date = timezone.now()
            submission.is_processed = True
            submission.save()
            
            # Check if this is an update to an existing reply
            is_update = submission.admin_reply_date is not None
            
            # Format the email with professional styling
            email_subject = "Updated: LinkedIn Profile Analysis" if is_update else "Your LinkedIn Profile Analysis Is Ready"
            
            # Create HTML email with better formatting
            email_html = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background-color: #0077B5; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; background-color: #f9f9f9; }}
                    .footer {{ text-align: center; padding: 10px; font-size: 12px; color: #666; }}
                    .score {{ font-size: 24px; font-weight: bold; }}
                    .section {{ margin-bottom: 20px; }}
                    .recommendations {{ background-color: #e6f3ff; padding: 15px; border-left: 5px solid #0077B5; }}
                    .positive {{ color: #2e7d32; }}
                    .negative {{ color: #c62828; }}
                    .update-notice {{ background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin-bottom: 20px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>LinkedIn Profile Analysis</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        
                        {f'<div class="update-notice"><strong>Note:</strong> This is an updated analysis of your LinkedIn profile.</div>' if is_update else ''}
                        
                        <p>{'We have updated our analysis of' if is_update else "We've completed the analysis of"} your LinkedIn profile. Here's what we found:</p>
                        
                        <div class="section">
                            {submission.admin_reply}
                        </div>
                        
                        <div class="recommendations">
                            <h3>Next Steps</h3>
                            <p>We recommend implementing these changes to improve your profile's effectiveness.</p>
                            <p>If you have any questions about this analysis, feel free to reply to this email.</p>
                        </div>
                        
                        <p>Thank you for using our service!</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from LK Tool Box.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version for email clients that don't support HTML
            update_notice = "Note: This is an updated analysis of your LinkedIn profile.\n\n" if is_update else ""
            email_text = f"""
            LinkedIn Profile Analysis
            
            Hello,
            
            {update_notice}{'We have updated our analysis of' if is_update else "We've completed the analysis of"} your LinkedIn profile. Here's what we found:
            
            {submission.admin_reply}
            
            Thank you for using our service!
            """
            
            # Send notification to user
            try:
                send_notification_email(
                    subject=email_subject,
                    message=email_text,
                    html_message=email_html,
                    recipient_list=[submission.email]
                )
                
                print(f"Analysis and reply {'updated and re-sent' if is_update else 'sent'} to {submission.email}")
            except Exception as e:
                print(f"Failed to send reply notification: {e}")
                # Continue even if email fails
            
            return Response({
                "message": f"Reply {'updated and resent' if is_update else 'sent'} successfully",
                "submission_id": submission_id
            }, status=status.HTTP_200_OK)
            
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in AdminReplyView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminProcessedSubmissionsView(APIView):
    """
    API endpoint for admin to view already processed submissions
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request):
        # Debug info
        print(f"AdminProcessedSubmissionsView - user: {request.user}, is_staff: {request.user.is_staff}")
        
        try:
            # Get filter parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 10))
            
            # Get only processed submissions
            submissions = ContactSubmission.objects.filter(is_processed=True).order_by('-admin_reply_date')
                
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
