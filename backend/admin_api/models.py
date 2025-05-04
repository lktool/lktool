from django.db import models
from django.conf import settings
from contact.models import ContactSubmission

class ProfileAnalysis(models.Model):
    """
    Model to store LinkedIn profile analysis data submitted by admins
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile_analyses'
    )
    submission = models.ForeignKey(
        ContactSubmission,
        on_delete=models.CASCADE,
        related_name='analyses'
    )
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Profile Analysis'
        verbose_name_plural = 'Profile Analyses'
        unique_together = ['user', 'submission']  # One analysis per submission-user pair

    def __str__(self):
        return f"Analysis for {self.submission} by Admin"
