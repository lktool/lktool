from django.urls import path
from .views import ContactFormView, UserSubmissionsView, UserAnalysesView

urlpatterns = [
    path('submit/', ContactFormView.as_view(), name='contact-submit'),
    path('user-submissions/', UserSubmissionsView.as_view(), name='user-submissions'),
    path('user-analyses/', UserAnalysesView.as_view(), name='user-analyses'),
]
