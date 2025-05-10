from django.db import models
from django.contrib.auth import get_user_model
from contact.models import ContactSubmission

User = get_user_model()

# No models needed here - we'll use the User model directly
# And contact.models.ContactSubmission for submissions

class SubmissionAnalysis(models.Model):
    """
    Model for storing detailed LinkedIn profile analysis results
    """
    submission = models.OneToOneField(
        ContactSubmission, 
        on_delete=models.CASCADE,
        related_name='detailed_analysis'
    )
    strengths = models.JSONField(blank=True, null=True)
    weaknesses = models.JSONField(blank=True, null=True)
    recommendations = models.JSONField(blank=True, null=True)
    score = models.IntegerField(blank=True, null=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'LinkedIn Profile Analysis'
        verbose_name_plural = 'LinkedIn Profile Analyses'
    
    def __str__(self):
        return f"Analysis for {self.submission}"
