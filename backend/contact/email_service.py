"""
Simple email service for contact form submissions.
"""
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_notification_email(user_email, url, message, recipient_email=None, subject=None):
    """
    Simple function to send notification emails for contact form
    """
    if recipient_email is None:
        recipient_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
    
    if subject is None:
        subject = "New Message from Website User"
        
    # Plain text message first
    plain_message = f"""
    New Form Submission
    
    From: {user_email}
    URL: {url}
    
    Message:
    {message}
    
    This message was submitted via the form on your website.
    """
    
    try:
        # Use Django's send_mail function directly
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info(f"Notification email sent to {recipient_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False
