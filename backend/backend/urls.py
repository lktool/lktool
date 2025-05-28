"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from users.views import GoogleAuthView  # Import the view directly

urlpatterns = [
    # Django admin site
    path("django-admin/", admin.site.urls),
    
    # API endpoints with /api prefix
    path('api/auth/', include('users.urls')),
    path('api/contact/', include('contact.urls')),
    
    # Admin API endpoints - fix the configuration to use the dedicated files
    path('api/admin/', include('admin_panel.urls')),
    path('api/admin/', include('contact.admin_urls')),  # Use admin_urls.py instead of direct views
    
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
