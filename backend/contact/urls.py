from django.urls import path
from .views import ContactFormView, UserSubmissionsView

urlpatterns = [
    path('submit/', ContactFormView.as_view(), name='contact-submit'),
    path('user-submissions/', UserSubmissionsView.as_view(), name='user-submissions'),
]
