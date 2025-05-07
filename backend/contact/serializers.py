from rest_framework import serializers
from .models import ContactSubmission

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ['id', 'linkedin_url', 'message', 'email', 'is_processed', 
                 'created_at', 'admin_reply', 'admin_reply_date']
        
    def validate_linkedin_url(self, value):
        if not value:
            raise serializers.ValidationError("LinkedIn URL is required.")
        if "linkedin.com" not in value:
            raise serializers.ValidationError("Please enter a valid LinkedIn URL.")
        return value
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        # Normalize email to lowercase for consistency
        return value.lower()
