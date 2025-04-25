from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.mail import EmailMessage
from django.conf import settings
import threading
import logging

from .serializers import ContactSerializer
from .models import ContactSubmission

logger = logging.getLogger(__name__)

# Function to send email in background
def send_contact_email_async(subject, message, from_email, recipient_list, reply_to, html_message=None):
    try:
        logger.info(f"Sending contact email to admin: {recipient_list}")
        
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=from_email,
            to=recipient_list,
            reply_to=[reply_to]
        )
        
        if html_message:
            email.content_subtype = "html"
            email.body = html_message
            
        email.send(fail_silently=False)
        
        logger.info(f"Contact email sent successfully to admin")
    except Exception as e:
        logger.error(f"Failed to send contact email: {str(e)}")
        
        # Print detailed error for debugging
        if settings.DEBUG:
            import traceback
            print("\n--------------------------------")
            print("CONTACT EMAIL SENDING ERROR")
            print("--------------------------------")
            print(f"To: {recipient_list}")
            print(f"From: {from_email}")
            print(f"Reply-To: {reply_to}")
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
            print("--------------------------------\n")

class ContactFormView(APIView):
    """
    View to handle contact form submissions
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Save the submission
                submission = serializer.save()
                
                # Get the admin email from settings (with fallback)
                admin_email = getattr(settings, 'ADMIN_EMAIL', settings.DEFAULT_FROM_EMAIL)
                
                # Prepare email content
                subject = f"New Contact Form Submission - LinkedIn Tool"
                
                # Create HTML message
                html_message = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #328E6E;">New Contact Form Submission</h2>
                    <p><strong>From:</strong> {submission.email}</p>
                    <p><strong>LinkedIn URL:</strong> {submission.linkedin_url}</p>
                    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
                        <p><strong>Message:</strong></p>
                        <p>{submission.message}</p>
                    </div>
                    <p style="color: #666; font-size: 0.8em;">
                        This message was submitted via the contact form on your website.
                        You can reply directly to this email to respond to the user.
                    </p>
                </div>
                """
                
                # Plain text version
                message = f"""
                New Contact Form Submission
                
                From: {submission.email}
                LinkedIn URL: {submission.linkedin_url}
                
                Message:
                {submission.message}
                
                This message was submitted via the contact form on your website.
                """
                
                # Start email sending in background thread
                email_thread = threading.Thread(
                    target=send_contact_email_async,
                    args=(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [admin_email],
                        submission.email,
                        html_message
                    )
                )
                email_thread.daemon = True
                email_thread.start()
                
                return Response({
                    "message": "Your message has been sent successfully! We'll contact you soon."
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Error processing contact form: {str(e)}")
                return Response({
                    "error": "An error occurred while processing your request. Please try again later."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
