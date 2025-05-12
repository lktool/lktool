from django.db import models
from django.conf import settings
from contact.models import ContactSubmission

class ProfileAnalysis(models.Model):
    """Model to store LinkedIn profile analysis data"""
    
    # Link to the submission being analyzed
    submission = models.OneToOneField(
        ContactSubmission,
        on_delete=models.CASCADE,
        related_name='profile_analysis'
    )
    
    # Admin who performed the analysis
    analyzed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='analyses_performed'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Profile Basics
    connections = models.PositiveIntegerField(null=True, blank=True)
    has_verification_shield = models.BooleanField(default=False)
    account_type = models.CharField(max_length=20, default='normal')
    account_age_years = models.PositiveIntegerField(null=True, blank=True)
    last_updated = models.DateField(null=True, blank=True)
    has_custom_url = models.BooleanField(default=False)
    
    # Profile Quality
    has_profile_summary = models.BooleanField(default=False)
    has_professional_photo = models.BooleanField(default=True)
    has_old_photo = models.BooleanField(default=False)
    outdated_job_info = models.BooleanField(default=False)
    missing_about_or_education = models.BooleanField(default=False)
    profile_completeness = models.BooleanField(default=False)
    skills_endorsements_count = models.PositiveIntegerField(null=True, blank=True)
    has_recommendations = models.BooleanField(default=False)
    personalized_profile = models.BooleanField(default=False)
    
    # Activity Signals
    recent_activity = models.BooleanField(default=True)
    last_post_date = models.DateField(null=True, blank=True)
    engagement_with_content = models.BooleanField(default=False)
    engagement_history = models.BooleanField(default=False)
    post_history_older_than_year = models.BooleanField(default=False)
    
    # Outreach Suitability
    profile_updates = models.BooleanField(default=False)
    shared_interests = models.BooleanField(default=False)
    open_to_networking = models.BooleanField(default=False)
    industry_relevance = models.BooleanField(default=False)
    active_job_titles = models.BooleanField(default=False)
    
    # Risk Signals
    newly_created = models.BooleanField(default=False)
    sparse_job_history = models.BooleanField(default=False)
    default_profile_picture = models.BooleanField(default=False)
    low_connections = models.BooleanField(default=False)
    no_engagement_on_posts = models.BooleanField(default=False)
    
    # Analysis summary and score
    summary = models.TextField(blank=True)
    score = models.PositiveIntegerField(null=True, blank=True)
    risk_level = models.CharField(
        max_length=20, 
        choices=[
            ('low', 'Low Risk'),
            ('medium', 'Medium Risk'),
            ('high', 'High Risk'),
        ],
        default='medium'
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'LinkedIn Profile Analysis'
        verbose_name_plural = 'LinkedIn Profile Analyses'
    
    def __str__(self):
        return f"Analysis for {self.submission.email}"
