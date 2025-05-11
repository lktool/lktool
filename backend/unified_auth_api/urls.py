from django.urls import path
from .views import (
    UnifiedLoginView, 
    UserRegistrationView,
    TokenRefreshView,
    EmailVerificationView,
    ResendVerificationView,
    PasswordResetView,
    PasswordResetConfirmView,
    UserProfileView,
    GoogleAuthView  # Import from views.py only
)

urlpatterns = [
    path('login/', UnifiedLoginView.as_view(), name='unified-login'),
    path('signup/', UserRegistrationView.as_view(), name='user-registration'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('verify-email/', EmailVerificationView.as_view(), name='email-verification'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('password-reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]

