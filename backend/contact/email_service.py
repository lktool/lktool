import logging
from django.core.mail import send_mail as django_send_mail
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import traceback

logger = logging.getLogger(__name__)

def send_notification_email(subject, message, recipient_list=None, html_message=None):
    """
    Send email notification with HTML support and better error handling
    
    Args:
        subject (str): Email subject
        message (str): Plain text email content
        recipient_list (list): List of recipient email addresses
        html_message (str): Optional HTML content of the email
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
            
        # If we have HTML content, use EmailMultiAlternatives for both formats
        if html_message:
            email = EmailMultiAlternatives(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list
            )
            email.attach_alternative(html_message, "text/html")
            result = email.send(fail_silently=False)
        else:
            # Regular plain text email
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
