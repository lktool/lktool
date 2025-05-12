from rest_framework import serializers
from .models import ProfileAnalysis
from contact.models import ContactSubmission

class ProfileAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for LinkedIn profile analysis data"""
    
    submission_id = serializers.IntegerField(write_only=True)
    submission_email = serializers.CharField(source='submission.email', read_only=True)
    submission_url = serializers.CharField(source='submission.linkedin_url', read_only=True)
    submission_date = serializers.DateTimeField(source='submission.created_at', read_only=True)
    
    class Meta:
        model = ProfileAnalysis
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'analyzed_by']
    
    def create(self, validated_data):
        # Extract submission_id from validated data
        submission_id = validated_data.pop('submission_id')
        
        # Get the submission object
        try:
            submission = ContactSubmission.objects.get(id=submission_id)
        except ContactSubmission.DoesNotExist:
            raise serializers.ValidationError({"submission_id": "Submission not found"})
        
        # Get the current user from the context
        user = self.context['request'].user
        
        # Create the analysis
        analysis = ProfileAnalysis.objects.create(
            submission=submission,
            analyzed_by=user,
            **validated_data
        )
        
        # Mark the submission as processed
        submission.is_processed = True
        submission.save(update_fields=['is_processed'])
        
        return analysis

class SubmissionWithAnalysisSerializer(serializers.ModelSerializer):
    analysis = ProfileAnalysisSerializer(read_only=True)
    
    class Meta:
        model = ContactSubmission
        fields = (
            'id', 'email', 'linkedin_url', 'message', 
            'is_processed', 'created_at', 'admin_reply',
            'admin_reply_date', 'analysis'
        )
