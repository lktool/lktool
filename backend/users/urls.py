from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView,
    PasswordResetView, PasswordResetConfirmView,
    UserProfileView
)
from .google_auth import GoogleAuthView

urlpatterns = [
    path('auth/signup/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),  # Make sure this endpoint works
    path('auth/password-reset/', PasswordResetView.as_view(), name='password_reset'),
    path('auth/password-reset/<str:uidb64>/<str:token>/', 
         PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/user/', UserProfileView.as_view(), name='user_profile'),
    path('auth/google/', GoogleAuthView.as_view(), name='google_auth'),
]
