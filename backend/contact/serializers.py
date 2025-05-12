from rest_framework import serializers
from .models import ContactSubmission

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        # Exclude the analysis field from serialization
        fields = ['id', 'linkedin_url', 'message', 'email', 'created_at', 
                 'is_processed', 'admin_reply', 'admin_reply_date']
        read_only_fields = ['id', 'created_at', 'is_processed', 
                          'admin_reply', 'admin_reply_date']
        
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
