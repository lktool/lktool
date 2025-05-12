from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    RegisterView,
    ProfileView,
    VerifyEmailView,
    GoogleAuthView,
)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', RegisterView.as_view(), name='register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('google/', GoogleAuthView.as_view(), name='google_auth'),
]
