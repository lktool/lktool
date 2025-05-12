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

class ContactFormSerializer(serializers.ModelSerializer):
    """Serializer for generic contact form submissions"""
    class Meta:
        model = ContactSubmission
        fields = ['name', 'email', 'subject', 'message', 'message_type']
        
    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        return value.lower()
        
    def validate_message(self, value):
        if not value:
            raise serializers.ValidationError("Message is required.")
        if len(value) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value

# Add the missing serializer used in admin_views.py
class ContactSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for admin view of submissions with all details"""
    class Meta:
        model = ContactSubmission
        fields = '__all__'
    
    def to_representation(self, instance):
        """Handle the case where related data might be missing"""
        data = super().to_representation(instance)
        
        # Safely handle user relation if it exists
        if instance.user:
            try:
                data['user_email'] = instance.user.email
            except:
                data['user_email'] = None
                
        # Safely handle admin_reply fields
        if not instance.admin_reply:
            data['admin_reply'] = None
            data['admin_reply_date'] = None
            
        return data
