from rest_framework import serializers
from contact.models import ContactSubmission

class AdminContactSerializer(serializers.ModelSerializer):
    """
    Serializer for admin use with basic fields
    """
    class Meta:
        model = ContactSubmission
        fields = ['id', 'user', 'email', 'linkedin_url', 'message', 
                 'created_at', 'is_processed']
        read_only_fields = ['id', 'user', 'email', 'linkedin_url', 
                          'message', 'created_at']
