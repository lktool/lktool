"""
Email service for contact form submissions.
"""
import logging
import traceback
from django.core.mail import EmailMessage, send_mail
from django.conf import settings
import threading

logger = logging.getLogger(__name__)

def send_email_async(subject, message, recipient_list, html_message=None):
    """Send email asynchronously"""
    def _send_email_task():
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_message,
            fail_silently=False
        )
    
    email_thread = threading.Thread(target=_send_email_task)
    email_thread.daemon = True
    email_thread.start()

def send_notification_email(submission):
    """Send notification when a new submission is received"""
    subject = f"New LinkedIn Profile Submission: {submission.email}"
    message = f"""
    A new LinkedIn profile has been submitted:
    
    Email: {submission.email}
    LinkedIn URL: {submission.linkedin_url}
    
    Message:
    {submission.message}
    
    You can review this submission in the admin dashboard.
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Failed to send notification email: {e}")
        return False

def send_reply_notification(submission):
    """Send notification when admin replies to a submission"""
    subject = "Response to your LinkedIn Profile Submission"
    message = f"""
    Hello,
    
    We've reviewed your LinkedIn profile submission and provided feedback.
    
    Admin Reply: {submission.admin_reply}
    
    Original Message: {submission.message}
    LinkedIn URL: {submission.linkedin_url}
    
    Thank you for using our service.
    """
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[submission.email],
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Failed to send reply notification: {e}")
        return False
