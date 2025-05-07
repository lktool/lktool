from rest_framework import serializers
from contact.models import ContactSubmission

class AdminContactSerializer(serializers.ModelSerializer):
    """
    Extended serializer for admin use with writable analysis field
    """
    class Meta:
        model = ContactSubmission
        fields = ['id', 'user', 'email', 'linkedin_url', 'message', 
                 'created_at', 'is_processed', 'analysis']
        read_only_fields = ['id', 'user', 'email', 'linkedin_url', 
                          'message', 'created_at']
