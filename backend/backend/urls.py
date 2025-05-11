"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from unified_auth_api.views import GoogleAuthView  # Import the view directly

urlpatterns = [
    # Django admin site (renamed to avoid conflict)
    path("django-admin/", admin.site.urls),
    path('api/auth/', include('unified_auth_api.urls')),

    path('api/contact/', include('contact.urls')),

    # Direct access route for Google authentication
    path('auth/google/', GoogleAuthView.as_view(), name='direct_google_auth'),

    re_path(
        r'^(?!django-admin/|api/|static/|media/|auth/).*$',
        TemplateView.as_view(template_name="index.html"),
        name="spa-fallback"
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
