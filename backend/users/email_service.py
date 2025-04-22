import logging
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

class EmailService:
    """Email service for handling all email communications with better error handling and logging"""
    
    @staticmethod
    def send_verification_email(user):
        """Send verification email with both HTML and plain text versions"""
        from .utils import generate_email_verification_token
        
        token = generate_email_verification_token(user)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_url = f"{frontend_url}/verify-email/{token}"
        
        # Context for email template
        context = {
            'user_email': user.email,
            'verification_url': verification_url,
            'site_name': 'Your App Name',
        }
        
        subject = 'Verify your email address'
        
        try:
            # HTML version
            html_content = render_to_string('users/email/verification_email.html', context)
            
            # Plain text version
            text_content = strip_tags(f"""
            Hello,
            
            Thank you for registering. Please verify your email by visiting:
            
            {verification_url}
            
            This link will expire in 24 hours.
            
            If you didn't register on our site, please ignore this email.
            """)
            
            # Create email message
            email = EmailMultiAlternatives(
                subject,
                text_content,
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email and return result
            sent = email.send(fail_silently=False)
            
            if sent:
                logger.info(f"Verification email sent successfully to: {user.email}")
            else:
                logger.error(f"Failed to send verification email to: {user.email}")
            
            return sent
            
        except Exception as e:
            logger.error(f"Error sending verification email to {user.email}: {str(e)}")
            
            # For debugging in development
            if settings.DEBUG:
                print("\n--------------------------------")
                print("VERIFICATION EMAIL (NOT SENT DUE TO ERROR)")
                print("--------------------------------")
                print(f"To: {user.email}")
                print(f"Subject: {subject}")
                print("Verification URL:")
                print(verification_url)
                print(f"Error: {str(e)}")
                print("--------------------------------\n")
            
            # Re-raise error if needed
            if getattr(settings, 'EMAIL_RAISE_ERRORS', False):
                raise
            
            return False
    
    # Add more email sending methods here...
