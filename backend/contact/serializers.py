from rest_framework import serializers
from .models import ContactSubmission

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ['linkedin_url', 'message', 'email']
        
    def validate_linkedin_url(self, value):
        if not value:
            raise serializers.ValidationError("LinkedIn URL is required.")
        if "linkedin.com" not in value:
            raise serializers.ValidationError("Please enter a valid LinkedIn URL.")
        return value
    
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        return value
