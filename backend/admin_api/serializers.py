from rest_framework import serializers
from django.contrib.auth import get_user_model
from contact.models import ContactSubmission
from .models import ProfileAnalysis

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username']

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ['id', 'email', 'linkedin_url', 'message', 'created_at']

class ProfileAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfileAnalysis
        fields = ['id', 'user', 'submission', 'data', 'created_at']
        
    def validate(self, attrs):
        # Ensure user exists
        if not User.objects.filter(id=attrs['user'].id).exists():
            raise serializers.ValidationError({"user": "User does not exist"})
            
        # Ensure submission exists
        if not ContactSubmission.objects.filter(id=attrs['submission'].id).exists():
            raise serializers.ValidationError({"submission": "Submission does not exist"})
            
        return attrs
