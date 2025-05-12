from django.db import models
from django.conf import settings

class ContactSubmission(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='submissions'
    )
    linkedin_url = models.URLField(max_length=500)
    message = models.TextField(blank=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)
    admin_reply = models.TextField(blank=True, null=True)
    admin_reply_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Submission by {self.email} on {self.created_at.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-created_at']
