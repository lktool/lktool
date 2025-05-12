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

class AdminSubmissionsView(APIView):
    """
    API endpoint for admin to view submissions
    """
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request):
        # Debug info
        print(f"AdminSubmissionsView - user: {request.user}, is_staff: {request.user.is_staff}, role: {getattr(request.user, 'role', 'unknown')}")
        
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
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request, submission_id):
        print(f"AdminSubmissionDetailView - user: {request.user}, is_staff: {request.user.is_staff}")
        
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
            serializer = ContactSubmissionSerializer(submission)
            return Response(serializer.data)
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)

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
            analysis_data = request.data.get('analysis', {})
            
            # Update submission with admin reply
            submission.admin_reply = reply_text
            submission.admin_reply_date = timezone.now()
            submission.is_processed = True
            submission.save()
            
            # Format the email with professional styling
            email_subject = f"Your LinkedIn Profile Analysis Is Ready"
            
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
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>LinkedIn Profile Analysis</h1>
                    </div>
                    <div class="content">
                        <p>Hello,</p>
                        <p>We've completed the analysis of your LinkedIn profile. Here's what we found:</p>
                        
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
            email_text = f"""
            LinkedIn Profile Analysis
            
            Hello,
            
            We've completed the analysis of your LinkedIn profile. Here's what we found:
            
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
                
                print(f"Analysis and reply sent to {submission.email}")
            except Exception as e:
                print(f"Failed to send reply notification: {e}")
                # Continue even if email fails
            
            return Response({
                "message": "Reply and analysis sent successfully",
                "submission_id": submission_id
            }, status=status.HTTP_200_OK)
            
        except ContactSubmission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in AdminReplyView: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
