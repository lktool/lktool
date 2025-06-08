from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils import timezone

import logging
from .serializers import UserSerializer, RegisterSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer
from .models import UserSubscription  # Import the UserSubscription model

User = get_user_model()
logger = logging.getLogger(__name__)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"detail": "Email and password required."}, status=400)

        # Special case for admin credentials in settings
        if hasattr(settings, 'ADMIN_EMAIL') and hasattr(settings, 'ADMIN_PASSWORD'):
            if email == settings.ADMIN_EMAIL and password == settings.ADMIN_PASSWORD:
                refresh = RefreshToken()
                refresh["email"] = email
                refresh["role"] = "admin"
                return Response({
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "role": "admin",
                    "email": email,
                    "user_id": "admin"
                })

        user = authenticate(request, email=email, password=password)
        if user is not None:
            # Check if email is verified
            if hasattr(user, 'email_verified') and not user.email_verified:
                return Response({
                    "detail": "Email not verified. Please verify your email first."
                }, status=401)
                
            refresh = RefreshToken.for_user(user)
            refresh["email"] = user.email
            refresh["role"] = user.role
            refresh["user_id"] = user.id
            
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": user.role,
                "email": user.email,
                "user_id": user.id
            })

        return Response({"detail": "Invalid credentials."}, status=401)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            try:
                user.email_verified = False
                user.save()
            except Exception as e:
                print(f"Warning: Could not set email_verified: {e}")
            
            # Generate verification token
            uid = urlsafe_base64_encode(force_str(user.pk).encode())
            token = default_token_generator.make_token(user)
            
            # Build verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{uid}-{token}"
            
            # Send verification email
            try:
                send_mail(
                    'Verify Your Email',
                    f'Please click the link to verify your email: {verification_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send verification email: {str(e)}")
            
            return Response({
                "message": "Registration successful! Please check your email to verify your account."
            }, status=201)
            
        return Response(serializer.errors, status=400)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response({"detail": "No verification token provided."}, status=400)
        
        try:
            uid, token_key = token.split('-', 1)
            user_id = force_str(urlsafe_base64_decode(uid))
            user = get_object_or_404(User, pk=user_id)
            
            if default_token_generator.check_token(user, token_key):
                user.email_verified = True
                user.save()
                return Response({"detail": "Email verified successfully."}, status=200)
            else:
                return Response({"detail": "Invalid or expired verification token."}, status=400)
                
        except Exception as e:
            logger.error(f"Email verification error: {str(e)}")
            return Response({"detail": "Invalid verification token format."}, status=400)

"""
class PasswordResetView(APIView):
    """
    API endpoint for requesting a password reset email
    """
    permission_classes = [AllowAny]  # Important - this should be open to anonymous users
    
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required."}, status=400)
        
        try:
            user = User.objects.get(email=email)
            
            # Generate token and uid for password reset
            uid = urlsafe_base64_encode(force_str(user.pk).encode())
            token = default_token_generator.make_token(user)
            
            # Build reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            
            # Send email
            subject = "Password Reset Request"
            message = f"""
            You requested a password reset for your account.
            Please click the link below to reset your password:
            
            {reset_url}
            
            If you didn't request this, you can safely ignore this email.
            """
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({"detail": "Password reset email sent."}, status=200)
            
        except User.DoesNotExist:
            # Don't reveal that the user doesn't exist for security
            return Response({"detail": "Password reset email sent if account exists."}, status=200)
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response({"detail": "Error sending password reset email."}, status=500)

class PasswordResetConfirmView(APIView):
    """
    API endpoint to confirm password reset and set new password
    """
    permission_classes = [AllowAny]
    
    def post(self, request, uidb64, token):
        try:
            # Get user from uid
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # Validate token
            if not default_token_generator.check_token(user, token):
                return Response({"detail": "Invalid or expired token."}, status=400)
            
            # Get passwords from request
            password = request.data.get('password')
            password2 = request.data.get('password2')
            
            # Validate passwords
            if not password or not password2:
                return Response({"detail": "Both password fields are required."}, status=400)
                
            if password != password2:
                return Response({"detail": "Passwords don't match."}, status=400)
            
            # Set new password
            user.set_password(password)
            user.save()
            
            return Response({"detail": "Password has been reset successfully."}, status=200)
            
        except User.DoesNotExist:
            return Response({"detail": "Invalid reset link."}, status=400)
        except Exception as e:
            logger.error(f"Password reset confirm error: {str(e)}")
            return Response({"detail": "Error resetting password."}, status=500)
"""

class UserSubscriptionView(APIView):
    """API endpoint for users to check their subscription tier"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        import traceback
        
        try:
            # Enhanced debugging for subscription issues
            print(f"DEBUG: Fetching subscription for user: {user.email} (id: {user.id})")
            
            # Try to get user subscription with a direct query
            subscription = UserSubscription.objects.filter(user=user).first()
            
            if subscription:
                print(f"DEBUG: Found subscription in DB: tier={subscription.tier}, end_date={subscription.end_date}")
                
                # Always normalize the tier to lowercase for consistency
                tier = subscription.tier.lower() if subscription.tier else 'free'
                
                # Check if subscription has expired
                if subscription.end_date and subscription.end_date < timezone.now():
                    print(f"DEBUG: Subscription expired: {subscription.end_date} < {timezone.now()}")
                    return Response({
                        'tier': 'free',
                        'message': 'Your subscription has expired',
                        'debug_info': 'Subscription exists but has expired'
                    })
                
                print(f"DEBUG: Returning active subscription with tier: {tier}")
                return Response({
                    'tier': tier,
                    'end_date': subscription.end_date,
                    'subscription_id': subscription.id
                })
            else:
                print(f"DEBUG: No subscription found in DB for user: {user.email}")
                # Default to free tier if no subscription exists
                return Response({
                    'tier': 'free',
                    'debug_info': 'No subscription record found'
                })
        except Exception as e:
            print(f"ERROR: Exception in UserSubscriptionView: {str(e)}")
            print(f"ERROR: {traceback.format_exc()}")
            return Response({
                'tier': 'free',
                'error': str(e),
                'debug_info': 'Exception occurred during subscription lookup'
            })
