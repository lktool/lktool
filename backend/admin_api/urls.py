from django.urls import path
from . import views

urlpatterns = [
    path('submissions/', views.FormSubmissionListView.as_view(), name='admin_submissions_list'),
    path('submissions/<int:pk>/', views.FormSubmissionDetailView.as_view(), name='admin_submission_detail'),
    path('stats/', views.admin_stats, name='admin_stats'),
]
