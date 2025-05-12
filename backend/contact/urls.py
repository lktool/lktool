from django.urls import path
from .views import SubmitFormView, UserSubmissionsView, ContactMessageView, AdminReplyView

urlpatterns = [
    # User-facing endpoints
    path('submit/', SubmitFormView.as_view(), name='submit_contact'),
    path('user-submissions/', UserSubmissionsView.as_view(), name='user_submissions'),
    path('message/', ContactMessageView.as_view(), name='contact_message'),
    
    # Admin reply endpoint
    path('submissions/<int:submission_id>/reply/', AdminReplyView.as_view(), name='admin_reply'),
]
