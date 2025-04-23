from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from .serializers import (
    UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer
)
from .utils import verify_email_token, send_verification_email
import threading
from django.db import transaction
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

# Function to send email in background
def send_email_async(subject, message, from_email, recipient_list, html_message=None):
    try:
        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
            html_message=html_message
        )
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        # Optimize by caching frequently accessed users
        response = super().post(request, *args, **kwargs)
        return response

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Database write in transaction for atomicity and speed
        user = serializer.save()
        
        # Make sure the user is NOT verified upon registration
        user.is_verified = False
        user.save()
        
        # Generate token for the user
        refresh = RefreshToken.for_user(user)
        
        # Start email sending in background thread
        if hasattr(settings, 'SEND_VERIFICATION_EMAIL') and settings.SEND_VERIFICATION_EMAIL:
            email_thread = threading.Thread(
                target=send_verification_email,
                args=(user,)
            )
            email_thread.daemon = True  # Daemon thread won't block app shutdown
            email_thread.start()
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully. Please check your email for verification instructions.",
            "token": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class EmailVerificationView(APIView):
    """
    View to handle email verification
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        token = request.data.get('token')
        
        # Enhanced debug logging
        logger.info(f"Received verification request with token: {token[:10]}...")
        
        if not token:
            logger.error("Verification failed: No token provided")
            return Response(
                {'error': 'Verification token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        email = verify_email_token(token)
        
        if email is None:
            logger.error("Verification failed: Token expired")
            return Response(
                {'error': 'Verification link has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif email is False:
            logger.error("Verification failed: Invalid token")
            return Response(
                {'error': 'Invalid verification token.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Token verified successfully for email: {email}")
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_verified:
                return Response(
                    {'message': 'Email already verified. You can now log in.'},
                    status=status.HTTP_200_OK
                )
            
            user.is_verified = True
            user.save()
            
            return Response(
                {'message': 'Email successfully verified. You can now log in.'},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            logger.error(f"User not found for email: {email}")
            return Response(
                {'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

class ResendVerificationEmailView(APIView):
    """
    View to resend verification email
    """
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(email=email)
            
            if user.is_verified:
                return Response(
                    {'message': 'Email already verified. You can now log in.'},
                    status=status.HTTP_200_OK
                )
                
            # Send verification email
            send_verification_email(user)
            
            return Response(
                {'message': 'Verification email sent successfully. Please check your inbox.'},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            # Don't reveal which emails exist for security
            return Response(
                {'message': 'If this email exists in our system, a verification email has been sent.'},
                status=status.HTTP_200_OK
            )

class PasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        try:
            serializer = PasswordResetSerializer(data=request.data)
            if serializer.is_valid():
                email = serializer.validated_data['email']
                try:
                    user = User.objects.get(email=email)
                    
                    # Generate password reset token
                    token = default_token_generator.make_token(user)
                    uid = urlsafe_base64_encode(force_bytes(user.pk))
                    
                    # Build reset URL using the frontend URL
                    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
                    reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
                    
                    # Start email sending in background thread
                    subject = 'Password Reset Request'
                    message = f'Please click the following link to reset your password: {reset_url}'
                    
                    email_thread = threading.Thread(
                        target=send_email_async,
                        args=(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
                    )
                    email_thread.daemon = True
                    email_thread.start()
                    
                    # Return success immediately without waiting for email
                    return Response(
                        {"message": "Password reset email has been sent."},
                        status=status.HTTP_200_OK
                    )
                except User.DoesNotExist:
                    # Don't reveal which emails are in the system
                    return Response(
                        {"message": "Password reset email has been sent."},
                        status=status.HTTP_200_OK
                    )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Password reset error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PasswordResetConfirmView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            # Check if token is valid
            if default_token_generator.check_token(user, token):
                serializer = PasswordResetConfirmSerializer(data=request.data)
                
                if serializer.is_valid():
                    # Set new password
                    user.set_password(serializer.validated_data['password'])
                    user.save()
                    return Response(
                        {"message": "Password has been reset successfully."},
                        status=status.HTTP_200_OK
                    )
                
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(
                {"error": "Invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {"error": "Invalid request"},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserProfileView(APIView):
    """
    View to retrieve the authenticated user's profile
    """
    permission_classes = (permissions.IsAuthenticated,)  # Ensure this is set
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication credentials were not provided."},
                          status=status.HTTP_401_UNAUTHORIZED)
        
        # CRITICAL FIX: Ensure user is verified
        if not getattr(request.user, 'is_verified', True):
            return Response({"detail": "Email not verified. Please verify your email first."},
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class VerifyTokenView(APIView):
    """
    View to verify token validity
    """
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        # If we got here, the token is valid (IsAuthenticated check passed)
        return Response({
            'valid': True,
            'user_id': request.user.id,
            'email': request.user.email
        })
