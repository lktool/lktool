"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include('users.urls')),
    path('api/contact/', include('contact.urls')),
    path('api/admin/', include('admin_api.urls')),  # Add the admin API URLs
    
    # Catch‑all: serve React's index.html for any non-API, non-admin, non‑static, non‑media path
    re_path(
        r'^(?!admin/|api/|static/|media/).*$',
        TemplateView.as_view(template_name="index.html"),
        name="spa-fallback"
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
