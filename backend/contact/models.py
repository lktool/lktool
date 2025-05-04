from django.db import models
from django.conf import settings

class ContactSubmission(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='contact_submissions'
    )
    linkedin_url = models.URLField(max_length=255)
    message = models.TextField()
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)
    analysis = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Contact from {self.email} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['-created_at']
