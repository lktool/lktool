from django.db import models
from django.conf import settings
from contact.models import ContactSubmission

class ContactSubmission(models.Model):
    """
    Model to store LinkedIn profile submissions from users
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    linkedin_url = models.URLField(max_length=255)
    message = models.TextField(null=True, blank=True)
    analysis = models.JSONField(null=True, blank=True)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'LinkedIn Profile Submission'
        verbose_name_plural = 'LinkedIn Profile Submissions'
    
    def __str__(self):
        return f"{self.user.username}'s submission - {self.created_at.strftime('%Y-%m-%d')}"

class SubmissionAnalysis(models.Model):
    """
    Model to store additional analysis data linked to existing submissions
    """
    submission = models.OneToOneField(
        ContactSubmission,
        on_delete=models.CASCADE,
        related_name='detailed_analysis'
    )
    strengths = models.JSONField(null=True, blank=True)
    weaknesses = models.JSONField(null=True, blank=True)
    recommendations = models.JSONField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'LinkedIn Profile Analysis'
        verbose_name_plural = 'LinkedIn Profile Analyses'
    
    def __str__(self):
        return f"Analysis for {self.submission.email}'s submission"
