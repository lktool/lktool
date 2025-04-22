import logging
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_email_verification_token(user):
    """Generate a secure token for email verification"""
    signer = TimestampSigner()
    return signer.sign(user.email)

def verify_email_token(token, max_age=86400):  # Default: 24 hours expiry
    """Verify an email verification token"""
    signer = TimestampSigner()
    try:
        email = signer.unsign(token, max_age=max_age)
        return email
    except SignatureExpired:
        logger.warning(f"Email verification token expired: {token}")
        return None  # Token expired
    except BadSignature:
        logger.warning(f"Invalid email verification token: {token}")
        return False  # Token invalid

def send_verification_email(user):
    """Send verification email with both HTML and plain text versions"""
    token = generate_email_verification_token(user)
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    verification_url = f"{frontend_url}/verify-email/{token}"
    
    # Context for email template
    context = {
        'user_email': user.email,
        'verification_url': verification_url,
        'site_name': 'LK Toolkit',
    }
    
    subject = 'Verify your email address'
    
    try:
        # Try to render template, fall back to plain text if not found
        try:
            html_content = render_to_string('users/email/verification_email.html', context)
        except:
            # If template doesn't exist, use basic HTML
            html_content = f'''
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #328E6E;">Email Verification</h2>
                <p>Hello,</p>
                <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" style="background-color: #67AE6E; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                        Verify My Email
                    </a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                    {verification_url}
                </p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't register on our site, please ignore this email.</p>
            </div>
            '''
        
        # Plain text version
        text_content = strip_tags(f'''
        Hello,
        
        Thank you for registering. Please verify your email by visiting:
        
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't register on our site, please ignore this email.
        ''')
        
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
        
        # For debugging
        print("\n--------------------------------")
        print("VERIFICATION EMAIL (NOT SENT DUE TO ERROR)")
        print("--------------------------------")
        print(f"To: {user.email}")
        print(f"Subject: {subject}")
        print("Verification URL:")
        print(verification_url)
        print(f"Error: {str(e)}")
        print("--------------------------------\n")
        
        # Re-raise or return False
        return False
