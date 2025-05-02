from django.urls import path
from .views import ContactFormView, test_email

urlpatterns = [
    path('submit/', ContactFormView.as_view(), name='contact-form-submit'),
    path('test-email/', test_email, name='test-email'),
]
