from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .admin_views import AdminSubmissionsView, AdminSubmissionDetailView, AdminProcessedSubmissionsView, AdminReplyView

urlpatterns = [
    path('submissions/', AdminSubmissionsView.as_view(), name='admin_submissions'),
    path('submissions/<int:submission_id>/', AdminSubmissionDetailView.as_view(), name='admin_submission_detail'),
    path('submissions/<int:submission_id>/reply/', csrf_exempt(AdminReplyView.as_view()), name='admin_reply'),
    path('processed/', AdminProcessedSubmissionsView.as_view(), name='admin_processed_submissions'),
    path('processed/<int:submission_id>/', AdminProcessedSubmissionsView.as_view(), name='admin_processed_submission_detail'),
]
