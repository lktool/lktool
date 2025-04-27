"""
Email service for contact form submissions.
"""
import logging
import traceback
from django.core.mail import EmailMessage
from django.conf import settings

logger = logging.getLogger(__name__)

def send_notification_email(user_email, url, message, recipient_email=None, subject="New Message from Website User"):
    """
    Sends an email notification to admin when a user submits a contact form.
    
    Args:
        user_email: Email address provided by the user (used as reply-to)
        url: URL provided by the user
        message: Message provided by the user
        recipient_email: Email to send notification to (defaults to ADMIN_EMAIL)
        subject: Email subject line
    """
    # Get recipient email from settings if not provided
    if recipient_email is None:
        recipient_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
    
    # Create HTML message
    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #328E6E;">New Form Submission</h2>
        <p><strong>From:</strong> {user_email}</p>
        <p><strong>URL:</strong> {url}</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 4px;">
            <p><strong>Message:</strong></p>
            <p>{message}</p>
        </div>
        <p style="color: #666; font-size: 0.8em;">
            This message was submitted via the form on your website.
            You can reply directly to this email to respond to the user.
        </p>
    </div>
    """
    
    # Create plain text version
    plain_message = f"""
    New Form Submission
    
    From: {user_email}
    URL: {url}
    
    Message:
    {message}
    
    This message was submitted via the form on your website.
    """
    
    try:
        # Log detailed information for debugging
        logger.info(f"Sending notification email: FROM={settings.DEFAULT_FROM_EMAIL}, TO={recipient_email}, REPLY_TO={user_email}")
        
        # Create email message
        email = EmailMessage(
            subject=subject,
            body=html_message,  # Use HTML by default
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email],
            reply_to=[user_email]
        )
        
        # Set content type to HTML
        email.content_subtype = "html"
        
        # Send email and capture result
        sent = email.send(fail_silently=False)
        
        if sent:
            logger.info(f"Email notification sent successfully to {recipient_email}")
            return True
        else:
            logger.error(f"Failed to send email notification (returned 0)")
            return False
            
    except Exception as e:
        # Detailed error logging
        logger.error(f"Failed to send notification email: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Print debugging information
        print("\n--------------------------------")
        print(f"EMAIL CONFIG:")
        print(f"HOST: {settings.EMAIL_HOST}")
        print(f"PORT: {settings.EMAIL_PORT}")
        print(f"TLS: {settings.EMAIL_USE_TLS}")
        print(f"USER: {settings.EMAIL_HOST_USER}")
        print(f"FROM: {settings.DEFAULT_FROM_EMAIL}")
        print(f"ADMIN: {recipient_email}")
        print("ERROR DETAILS:")
        print(f"{str(e)}")
        print("--------------------------------\n")
        
        return False
