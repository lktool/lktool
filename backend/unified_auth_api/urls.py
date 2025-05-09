from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# Import views directly, don't import from views to avoid circular imports
from .views import (
    CustomTokenObtainPairView,
    UserSubmissionViewSet,
    AdminSubmissionViewSet,
    AnalysisViewSet,
    RegisterUserView,
    UserProfileView,
    GoogleAuthView
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'submissions', UserSubmissionViewSet, basename='unified-user-submission')
router.register(r'admin/submissions', AdminSubmissionViewSet, basename='unified-admin-submission')
router.register(r'admin/analyses', AnalysisViewSet, basename='submission-analysis')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='unified_token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='unified_token_refresh'),
    path('auth/register/', RegisterUserView.as_view(), name='unified_register'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Google Auth
    path('auth/google/', GoogleAuthView.as_view(), name='google_auth'),
    
    # Include router URLs
    path('', include(router.urls)),
]
