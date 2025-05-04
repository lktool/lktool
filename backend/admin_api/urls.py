from django.urls import path
from .views import (
    AdminLoginView, FormSubmissionListView, UpdateSubmissionStatusView, 
    AdminStatsView, UserListView, UserSubmissionsView
)

urlpatterns = [
    # Core admin endpoints
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('submissions/', FormSubmissionListView.as_view(), name='admin_submissions'),
    path('submissions/<int:pk>/', UpdateSubmissionStatusView.as_view(), name='admin_update_submission'),
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
    
    # New endpoints for LinkedIn Analyzer
    path('users/', UserListView.as_view(), name='admin_users'),
    path('users/<int:user_id>/submissions/', UserSubmissionsView.as_view(), name='admin_user_submissions'),
    # Note: 'analyzer/' endpoint will use the POST method on submissions/ endpoint
]
