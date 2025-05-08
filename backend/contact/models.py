from django.db import models
from django.conf import settings

class ContactSubmission(models.Model):
    # User field already exists in DB, so keep this definition as-is
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
    analysis = models.JSONField(blank=True, null=True)  # Keep this field to match migrations
    admin_reply = models.TextField(blank=True, null=True)
    admin_reply_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Contact from {self.email} on {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
    class Meta:
        ordering = ['-created_at']
