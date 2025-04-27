"""
Email service module for the contact app.
Provides reusable functions for sending notification emails.
"""
import logging
import threading
import traceback
from django.core.mail import EmailMessage
from django.conf import settings

logger = logging.getLogger(__name__)

def send_notification_email(
    user_email,
    url,
    message,
    recipient_email=None,
    subject="New Message from Website User"
):
    """
    Sends an email notification to admin when a user submits a form.
    
    Args:
        user_email (str): The email address provided by the user (used as reply-to)
        url (str): The URL provided by the user
        message (str): The message provided by the user
        recipient_email (str): Email address to send the notification to (defaults to ADMIN_EMAIL)
        subject (str): Email subject line
    """
    # Validate inputs
    if not user_email:
        logger.error("Cannot send notification: user_email cannot be empty")
        return False
    
    # Use ADMIN_EMAIL from settings if no recipient provided
    if recipient_email is None:
        recipient_email = getattr(settings, 'ADMIN_EMAIL', 'mathan21092006@gmail.com')
    
    # From email should be the app's default sending email
    from_email = settings.DEFAULT_FROM_EMAIL
    
    # Create HTML message with good formatting
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
    
    # Plain text version
    plain_message = f"""
    New Form Submission
    
    From: {user_email}
    URL: {url}
    
    Message:
    {message}
    
    This message was submitted via the form on your website.
    """
    
    # Use threading to avoid blocking the request
    thread = threading.Thread(
        target=_send_email_async,
        args=(subject, plain_message, from_email, [recipient_email], user_email, html_message)
    )
    thread.daemon = True
    thread.start()
    
    return True

def _send_email_async(subject, message, from_email, recipient_list, reply_to, html_message=None):
    """
    Internal function to send emails asynchronously with error handling.
    """
    try:
        logger.info(f"Sending notification email to: {recipient_list}")
        
        email = EmailMessage(
            subject=subject,
            body=html_message if html_message else message,
            from_email=from_email,
            to=recipient_list,
            reply_to=[reply_to]
        )
        
        if html_message:
            email.content_subtype = "html"
        
        email.send(fail_silently=False)
        
        logger.info(f"Notification email sent successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to send notification email: {str(e)}")
        
        # Print detailed error for debugging
        if settings.DEBUG:
            print("\n--------------------------------")
            print("NOTIFICATION EMAIL SENDING ERROR")
            print("--------------------------------")
            print(f"To: {recipient_list}")
            print(f"From: {from_email}")
            print(f"Reply-To: {reply_to}")
            print(f"Error: {str(e)}")
            print(traceback.format_exc())
            print("--------------------------------\n")
            
        return False
