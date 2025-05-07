from django.urls import path
from .views import (
    AdminLoginView,
    FormSubmissionListView,
    UpdateSubmissionStatusView,
    AdminStatsView,
    UserListView,
    UserSubmissionsView,  # Make sure this matches your view class name
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('submissions/', FormSubmissionListView.as_view(), name='admin_submissions'),
    path('submissions/<int:pk>/', UpdateSubmissionStatusView.as_view(), name='admin_update_submission'),
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
    path('users/', UserListView.as_view(), name='admin_user_list'),  # Use ONLY this view
    path('users/<int:user_id>/submissions/', UserSubmissionsView.as_view(), name='admin_user_submissions'),
]
