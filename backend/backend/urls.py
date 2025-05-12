"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from users.views import GoogleAuthView  # Import the view directly
from contact.admin_views import AdminSubmissionsView, AdminSubmissionDetailView

urlpatterns = [
    # Django admin site
    path("django-admin/", admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('users.urls')),
    path('api/contact/', include('contact.urls')),
    
    # Admin API endpoints - Include admin_panel URLs
    path('api/admin/', include('admin_panel.urls')),
    path('api/admin/submissions/', AdminSubmissionsView.as_view(), name='admin_submissions'),
    path('api/admin/submissions/<int:submission_id>/', AdminSubmissionDetailView.as_view(), name='admin_submission_detail'),
    
    # Direct routes for Google auth (accessible from both paths)
 #   path('auth/google/', GoogleAuthView.as_view(), name='direct_google_auth'),
 #   path('google/', GoogleAuthView.as_view(), name='root_google_auth'),
    
    # Add one more route with api prefix to match our updated frontend
    path('api/auth/google/', GoogleAuthView.as_view(), name='api_google_auth'),
    
    # SPA fallback - handle all other routes with React app
    re_path(
        r'^(?!django-admin/|api/|static/|media/|auth/|google/).*$',
        TemplateView.as_view(template_name="index.html"),
        name="spa-fallback"
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
