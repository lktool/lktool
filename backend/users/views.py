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

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate token for the user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "User created successfully",
            "token": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

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
                    # Fallback to a default URL if FRONTEND_URL is not defined
                    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
                    reset_url = f"{frontend_url}/reset-password/{uid}/{token}"
                    
                    # Try to send the email
                    try:
                        send_mail(
                            'Password Reset Request',
                            f'Please click the following link to reset your password: {reset_url}',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                    except Exception as e:
                        # Log the error but don't expose it in the response
                        print(f"Email sending error: {str(e)}")
                        # For now, still return a success message since we don't want to
                        # reveal which emails exist in our system
                    
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
            print(f"Password reset error: {str(e)}")
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
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
