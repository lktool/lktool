import logging
from django.core.mail import send_mail as django_send_mail
from django.conf import settings
import traceback

logger = logging.getLogger(__name__)

def send_notification_email(subject, message, recipient_list=None, html_message=None):
    """Send email notification specifically for signup verification"""
    if recipient_list is None:
        return False
    
    try:
        logger.info(f"Sending signup verification email to: {recipient_list}")
        
        result = django_send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False
        )
        
        if result:
            logger.info(f"Signup verification email sent successfully to {recipient_list}")
            return True
        else:
            logger.error(f"Failed to send signup verification email to {recipient_list}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending signup verification email: {str(e)}")
        logger.error(traceback.format_exc())
        return False

# Comment out other email notification functions
"""
def send_reset_password_email():
    pass

def send_contact_notification():
    pass

def send_admin_notification():
    pass
"""
