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

class AdminAnalysisSerializer(serializers.Serializer):
    """Serializer for LinkedIn profile analysis data"""
    connections = serializers.IntegerField(required=False, allow_null=True)
    hasVerificationShield = serializers.BooleanField(default=False)
    accountType = serializers.CharField(default='normal')
    accountAgeYears = serializers.FloatField(required=False, allow_null=True)
    hasCustomURL = serializers.BooleanField(default=False)
    hasProfileSummary = serializers.BooleanField(default=False)
    hasProfessionalPhoto = serializers.BooleanField(default=True)
    hasOldPhoto = serializers.BooleanField(default=False)
    outdatedJobInfo = serializers.BooleanField(default=False)
    missingAboutOrEducation = serializers.BooleanField(default=False)
    profileCompleteness = serializers.BooleanField(default=False)
    skillsEndorsementsCount = serializers.IntegerField(required=False, allow_null=True)
    hasRecommendations = serializers.BooleanField(default=False)
    personalizedProfile = serializers.BooleanField(default=False)
    recentActivity = serializers.BooleanField(default=True)
    engagementWithContent = serializers.BooleanField(default=False)
    engagementHistory = serializers.BooleanField(default=False)
    postHistoryOlderThanYear = serializers.BooleanField(default=False)
    score = serializers.IntegerField(required=True)
    risk_level = serializers.CharField(required=True)
    summary = serializers.CharField(required=True)
