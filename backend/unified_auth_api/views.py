from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail

import google.auth
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import json
import logging
from datetime import datetime

from .permissions import IsAdminUserCustom, IsRegularUserCustom

User = get_user_model()
logger = logging.getLogger(__name__)

class UnifiedLoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"detail": "Email and password required."}, status=400)

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

        user = authenticate(request, username=email, password=password)
        if user is not None:
            # Check if email is verified
            if hasattr(user, 'email_verified') and not user.email_verified:
                return Response({
                    "detail": "Email not verified. Please verify your email first."
                }, status=401)
                
            refresh = RefreshToken.for_user(user)
            refresh["email"] = user.email
            refresh["role"] = "user"
            refresh["user_id"] = user.id
            
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": "user",
                "email": user.email,
                "user_id": user.id
            })

        return Response({"detail": "Invalid credentials."}, status=401)


class UserRegistrationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        password2 = request.data.get("password2")
        
        # Validate inputs
        if not email:
            return Response({"email": ["This field is required."]}, status=400)
        if not password:
            return Response({"password": ["This field is required."]}, status=400)
        if not password2:
            return Response({"password2": ["This field is required."]}, status=400)
        if password != password2:
            return Response({"password2": ["Passwords do not match."]}, status=400)
        if len(password) < 8:
            return Response({"password": ["Password must be at least 8 characters long."]}, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({"email": ["User with this email already exists."]}, status=400)
        
        # Create new user
        try:
            # Create user first - REMOVED username parameter that was causing the error
            user = User.objects.create_user(email=email, password=password)
            
            # Add email_verified field if it exists on the model
            try:
                user.email_verified = False
                user.save()
            except Exception as field_error:
                logger.warning(f"Could not set email_verified field: {str(field_error)}")
            
            # Generate verification token
            uid = urlsafe_base64_encode(force_str(user.pk).encode())
            token = default_token_generator.make_token(user)
            
            # Try to send verification email, but don't fail registration if email fails
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{uid}-{token}"
            try:
                send_mail(
                    'Verify your email',
                    f'Please click the link to verify your email: {verification_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=True,  # Don't let email failure stop registration
                )
            except Exception as email_error:
                logger.error(f"Failed to send verification email: {str(email_error)}")
            
            # Return success even if email fails
            return Response({
                "message": "User registered successfully. Please check your email to verify your account."
            }, status=201)
            
        except Exception as e:
            # Log the full error with traceback
            logger.exception(f"Registration error for {email}: {str(e)}")
            return Response({"error": "Registration failed. Please try again."}, status=500)


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    
    def options(self, request, *args, **kwargs):
        """Handle preflight OPTIONS requests correctly"""
        response = Response()
        
        # Get the origin from the request header
        origin = request.META.get('HTTP_ORIGIN')
        
        # Allow specific origins or use a wildcard in development
        response["Access-Control-Allow-Origin"] = origin or '*'
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        
        # Make sure to include all needed headers explicitly
        response["Access-Control-Allow-Headers"] = "Content-Type, Accept, Authorization, X-Requested-With"
        response["Access-Control-Allow-Credentials"] = "true"
        response["Access-Control-Max-Age"] = "86400"  # Cache preflight for 24 hours
        
        # Log for debugging
        logger.info(f"Handling OPTIONS request from {origin}")
        
        return response
    
    def post(self, request):
        # Add CORS headers to all responses
        response = Response()
        
        origin = request.META.get('HTTP_ORIGIN')
        response["Access-Control-Allow-Origin"] = origin or '*'
        response["Access-Control-Allow-Credentials"] = "true"
        
        # Log the request info for debugging
        logger.info(f"Google Auth request received. Origin: {request.META.get('HTTP_ORIGIN', 'unknown')}")
        logger.info(f"Request body keys: {request.data.keys()}")
        
        credential = request.data.get('credential')
        action = request.data.get('action', 'login')  # Default to login
        
        if not credential:
            logger.error("Missing credential in request")
            response.data = {"error": "Google credential is required"}
            response.status_code = 400
            return response
        
        try:
            # Process the credential
            client_id = settings.GOOGLE_OAUTH_CLIENT_ID
            idinfo = id_token.verify_oauth2_token(
                credential, google_requests.Request(), client_id)
                
            # Check issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                response.data = {"error": "Wrong issuer"}
                response.status_code = 400
                return response
                
            # Get user info from token
            google_id = idinfo['sub']
            email = idinfo['email']
            email_verified = idinfo['email_verified']
            
            if not email_verified:
                response.data = {"error": "Google email not verified"}
                response.status_code = 400
                return response
                
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                # Existing user - login flow
                if action == 'signup':
                    response.data = {
                        "error": "User already exists with this email", 
                        "needs_login": True
                    }
                    response.status_code = 409
                    return response
                    
                # Create tokens for existing user
                refresh = RefreshToken.for_user(user)
                refresh["email"] = user.email
                refresh["role"] = "admin" if user.is_staff else "user"
                refresh["user_id"] = user.id
                
                response.data = {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "email": user.email,
                    "role": "admin" if user.is_staff else "user",
                    "user_id": user.id,
                    "is_new_user": False
                }
                response.status_code = 200
                return response
                
            except User.DoesNotExist:
                # New user - signup flow
                if action == 'login':
                    response.data = {
                        "error": "User doesn't exist with this email", 
                        "needs_signup": True
                    }
                    response.status_code = 404
                    return response
                
                # Create new user from Google credentials
                user = User.objects.create_user(
                    username=email,
                    email=email,
                    password=None  # No password for Google OAuth users
                )
                user.email_verified = True  # Google emails are pre-verified
                user.save()
                
                # Create tokens for new user
                refresh = RefreshToken.for_user(user)
                refresh["email"] = user.email
                refresh["role"] = "user"
                refresh["user_id"] = user.id
                
                response.data = {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "email": user.email,
                    "role": "user",
                    "user_id": user.id,
                    "is_new_user": True
                }
                response.status_code = 200
                return response
                
        except ValueError as e:
            # Invalid token
            logger.error(f"Google auth error: {str(e)}")
            response.data = {"error": "Invalid token"}
            response.status_code = 400
            return response
        except Exception as e:
            logger.exception(f"Google auth error: {str(e)}")
            response.data = {"error": "Authentication failed"}
            response.status_code = 500
            return response


class TokenRefreshView(BaseTokenRefreshView):
    """
    Extension of the default token refresh view to add custom claims
    """
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200 and 'access' in response.data:
            # Get the email from the refresh token
            try:
                refresh_token = request.data.get('refresh')
                token = RefreshToken(refresh_token)
                email = token.payload.get('email')
                role = token.payload.get('role')
                user_id = token.payload.get('user_id')
                
                # Add custom claims to the response
                if email:
                    response.data['email'] = email
                if role:
                    response.data['role'] = role
                if user_id:
                    response.data['user_id'] = user_id
            except Exception as e:
                logger.error(f"Error adding custom claims to refresh response: {str(e)}")
                
        return response


class EmailVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response({"detail": "No verification token provided."}, status=400)
        
        try:
            # Decode token
            uid, token_key = token.split('-', 1)
            user_id = force_str(urlsafe_base64_decode(uid))
            user = get_object_or_404(User, pk=user_id)
            
            # Verify token
            if default_token_generator.check_token(user, token_key):
                user.email_verified = True
                user.save()
                return Response({"detail": "Email verified successfully."}, status=200)
            else:
                return Response({"detail": "Invalid or expired verification token."}, status=400)
        except Exception as e:
            logger.error(f"Email verification error: {str(e)}")
            return Response({"detail": "Invalid verification token format."}, status=400)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"detail": "Email is required."}, status=400)
            
        try:
            user = User.objects.get(email=email)
            
            # Check if email is already verified
            if hasattr(user, 'email_verified') and user.email_verified:
                return Response({
                    "detail": "Email is already verified. You can login now."
                }, status=400)
                
            # Generate new verification token
            uid = urlsafe_base64_encode(force_str(user.pk).encode())
            token = default_token_generator.make_token(user)
            
            # Send verification email
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
            send_mail(
                'Verify your email',
                f'Please click the link to verify your email: {verification_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                "detail": "Verification email sent successfully."
            }, status=200)
            
        except User.DoesNotExist:
            return Response({
                "detail": "No user found with this email address."
            }, status=404)
        except Exception as e:
            logger.error(f"Resend verification error: {str(e)}")
            return Response({
                "detail": "Failed to send verification email. Please try again later."
            }, status=500)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"detail": "Email is required."}, status=400)
            
        try:
            user = User.objects.get(email=email)
            
            # Generate password reset token
            uid = urlsafe_base64_encode(force_str(user.pk).encode())
            token = default_token_generator.make_token(user)
            
            # Send password reset email
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            send_mail(
                'Password Reset Request',
                f'Please click the link to reset your password: {reset_url}\n'
                f'If you did not request a password reset, please ignore this email.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
            return Response({
                "detail": "Password reset email has been sent if the email exists in our system."
            }, status=200)
            
        except User.DoesNotExist:
            # For security reasons, don't reveal that the user doesn't exist
            return Response({
                "detail": "Password reset email has been sent if the email exists in our system."
            }, status=200)
        except Exception as e:
            logger.error(f"Password reset error: {str(e)}")
            return Response({
                "detail": "Failed to send password reset email. Please try again later."
            }, status=500)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request, uidb64, token):
        password = request.data.get('password')
        password2 = request.data.get('password2')
        
        # Validate inputs
        if not password:
            return Response({"password": ["This field is required."]}, status=400)
        if not password2:
            return Response({"password2": ["This field is required."]}, status=400)
        if password != password2:
            return Response({"password2": ["Passwords do not match."]}, status=400)
        if len(password) < 8:
            return Response({"password": ["Password must be at least 8 characters long."]}, status=400)
            
        try:
            # Decode the user id
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # Check if token is valid
            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({
                    "detail": "Password has been reset successfully."
                }, status=200)
            else:
                return Response({
                    "detail": "The password reset link is invalid or has expired."
                }, status=400)
                
        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            logger.error(f"Password reset confirm error: {str(e)}")
            return Response({
                "detail": "The password reset link is invalid or has expired."
            }, status=400)
        except Exception as e:
            logger.error(f"Password reset confirm error: {str(e)}")
            return Response({
                "detail": "Failed to reset password. Please try again later."
            }, status=500)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile info"""
        user_data = {}
        
        # If it's the admin (with special token)
        if request.auth.get("role") == "admin" and request.auth.get("email") == settings.ADMIN_EMAIL:
            user_data = {
                "email": settings.ADMIN_EMAIL,
                "role": "admin",
                "is_staff": True,
                "id": "admin"
            }
        # Regular user
        elif request.user and request.user.is_authenticated:
            user = request.user
            user_data = {
                "email": user.email,
                "role": "admin" if user.is_staff else "user",
                "is_staff": user.is_staff,
                "id": user.id,
                "date_joined": user.date_joined.isoformat() if hasattr(user, 'date_joined') else None,
                "last_login": user.last_login.isoformat() if user.last_login else None,
            }
        
        return Response(user_data)
