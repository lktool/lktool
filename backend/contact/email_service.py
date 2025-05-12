import logging
from django.core.mail import send_mail as django_send_mail
from django.conf import settings
import traceback

logger = logging.getLogger(__name__)

def send_notification_email(subject, message, recipient_list=None):
    """
    Send email notification with better error handling and logging
    
    Args:
        subject (str): Email subject
        message (str): Email body content
        recipient_list (list): List of recipient email addresses
    """
    if recipient_list is None:
        recipient_list = [settings.ADMIN_EMAIL]
    
    try:
        # Log the email attempt
        logger.info(f"Sending email notification: Subject: {subject}, To: {recipient_list}")
        
        # Ensure we have the proper settings
        if not settings.EMAIL_HOST_USER or not settings.DEFAULT_FROM_EMAIL:
            logger.error("Email settings are not configured properly")
            return False
            
        # Send the email
        result = django_send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False
        )
        
        if result:
            logger.info(f"Email notification sent successfully to {recipient_list}")
            return True
        else:
            logger.error(f"Failed to send email notification to {recipient_list}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        logger.error(traceback.format_exc())
        return False
