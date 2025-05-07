from django.urls import path
from .views import (
    AdminLoginView, FormSubmissionListView, UpdateSubmissionStatusView,
    AdminStatsView, SubmissionReplyView
)

urlpatterns = [
    path('login/', AdminLoginView.as_view(), name='admin_login'),
    path('submissions/', FormSubmissionListView.as_view(), name='admin_submissions'),
    path('submissions/<int:pk>/', UpdateSubmissionStatusView.as_view(), name='admin_update_submission'),
    path('submissions/<int:pk>/reply/', SubmissionReplyView.as_view(), name='admin_submission_reply'),
    path('stats/', AdminStatsView.as_view(), name='admin_stats'),
]
