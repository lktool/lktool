from rest_framework import serializers
from .models import ContactSubmission

class ContactSerializer(serializers.ModelSerializer):
    # Add safe access to analysis field with a default
    analysis = serializers.JSONField(required=False, allow_null=True)
    
    class Meta:
        model = ContactSubmission
        fields = ['id', 'linkedin_url', 'message', 'email', 'is_processed', 
                 'created_at', 'admin_reply', 'admin_reply_date', 'analysis']
        
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

    def to_representation(self, instance):
        # Add error handling when getting analysis data
        representation = super().to_representation(instance)
        try:
            # If analysis access fails, provide a safe default
            if 'analysis' in representation and representation['analysis'] is None:
                representation['analysis'] = {}
        except Exception as e:
            print(f"Error processing analysis field: {str(e)}")
            representation['analysis'] = {}
        return representation
