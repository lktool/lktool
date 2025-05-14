from django.db import models
from django.utils import timezone
from django.conf import settings

class ContactSubmission(models.Model):
    # Basic fields
    email = models.EmailField()
    linkedin_url = models.URLField()
    message = models.TextField(blank=True)
    
    # Status fields
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    # Admin response fields
    admin_reply = models.TextField(blank=True, null=True)
    admin_reply_date = models.DateTimeField(null=True, blank=True)
    
    # Foreign key to user if authenticated (optional)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='submissions'
    )
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Submission by {self.email} on {self.created_at}"
