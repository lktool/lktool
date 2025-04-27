from django.urls import path
from .views import ContactFormView, test_email_config

urlpatterns = [
    path('submit/', ContactFormView.as_view(), name='contact-form-submit'),
    path('test-email/', test_email_config, name='test-email-config'),
]
