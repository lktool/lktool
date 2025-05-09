from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserSubmissionViewSet,
    AdminSubmissionViewSet,
    AnalysisViewSet
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
    
    # Include router URLs
    path('', include(router.urls)),
]
