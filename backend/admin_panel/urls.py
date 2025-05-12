from django.urls import path
from .views import (
    ProfileAnalysisCreateView,
    ProfileAnalysisDetailView,
    SubmissionAnalysisStatusView,
    AdminDashboardStatsView
)

urlpatterns = [
    # Analysis endpoints
    path('analyses/', ProfileAnalysisCreateView.as_view(), name='profile_analysis_create'),
    path('analyses/<int:analysis_id>/', ProfileAnalysisDetailView.as_view(), name='profile_analysis_detail'),
    path('submissions/<int:submission_id>/analysis-status/', SubmissionAnalysisStatusView.as_view(), name='submission_analysis_status'),
    
    # Dashboard statistics
    path('dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
]
