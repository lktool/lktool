"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from users.views import GoogleAuthView  # Import the view directly
from contact.admin_views import AdminSubmissionsView, AdminSubmissionDetailView, AdminProcessedSubmissionsView

urlpatterns = [
    # Django admin site
    path("django-admin/", admin.site.urls),
    
    # API endpoints with /api prefix
    path('api/auth/', include('users.urls')),
    path('api/contact/', include('contact.urls')),
    
    # Admin API endpoints
    path('api/admin/', include('admin_panel.urls')),
    path('api/admin/submissions/', AdminSubmissionsView.as_view(), name='admin_submissions'),
    path('api/admin/submissions/<int:submission_id>/', AdminSubmissionDetailView.as_view(), name='admin_submission_detail'),
    path('api/admin/processed/', AdminProcessedSubmissionsView.as_view(), name='admin_processed_submissions'),
    path('api/admin/processed/<int:submission_id>/', AdminProcessedSubmissionsView.as_view(), name='admin_delete_submission'),
    
    # IMPORTANT: Add legacy auth routes for compatibility with frontend
    path('auth/', include('users.urls')),  # This will handle /auth/signup/ as well
    
    # Consolidated Google auth routes
    path('google/', GoogleAuthView.as_view(), name='root_google_auth'),
    
    # SPA fallback - handle all other routes with React app
    re_path(
        r'^(?!django-admin/|api/|static/|media/|auth/|google/).*$',
        TemplateView.as_view(template_name="index.html"),
        name="spa-fallback"
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
