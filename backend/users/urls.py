from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView,
    PasswordResetView, PasswordResetConfirmView,
    UserProfileView, EmailVerificationView, ResendVerificationEmailView,
    VerifyTokenView, CheckEmailStatusView  # Add it to the imports
)
from .google_auth import GoogleAuthView
from .oauth_redirect import google_oauth_redirect

urlpatterns = [
    path('auth/signup/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('auth/password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('auth/password-reset/<str:uidb64>/<str:token>/', 
         PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/user/', UserProfileView.as_view(), name='user_profile'),
    path('auth/google/', GoogleAuthView.as_view(), name='google_auth'),
    path('auth/verify-email/', EmailVerificationView.as_view(), name='verify_email'),
    path('auth/resend-verification/', ResendVerificationEmailView.as_view(), name='resend_verification'),
    path('auth/verify-token/', VerifyTokenView.as_view(), name='verify_token'),

    # Add this new pattern to handle OAuth redirects
    path('auth/google/callback/', google_oauth_redirect, name='google_oauth_redirect'),
]
