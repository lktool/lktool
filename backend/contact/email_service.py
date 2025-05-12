from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_notification_email(subject, message, recipient_list=None, from_email=None):
    """
    Utility function to send email notifications
    
    Args:
        subject (str): Email subject
        message (str): Email message content
        recipient_list (list): List of email recipients, defaults to ADMIN_EMAIL if not provided
        from_email (str): Sender email address, defaults to DEFAULT_FROM_EMAIL if not provided
    
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Use default admin email if no recipients provided
        if recipient_list is None:
            recipient_list = [settings.ADMIN_EMAIL]
            
        # Use default from email if not provided
        if from_email is None:
            from_email = settings.DEFAULT_FROM_EMAIL
            
        logger.info(f"Sending email notification to {recipient_list}")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False
        )
        
        return result > 0
    except Exception as e:
        logger.error(f"Failed to send notification email: {str(e)}")
        return False
