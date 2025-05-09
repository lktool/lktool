from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from contact.models import ContactSubmission
from .models import SubmissionAnalysis

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that includes user role information"""
    
    def validate(self, attrs):
        # Get the token
        data = super().validate(attrs)
        
        # Add extra role info to the response
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        
        # Determine if user is an admin
        from django.conf import settings
        is_admin = self.user.is_staff or self.user.email == getattr(settings, 'ADMIN_EMAIL', None)
        
        data['is_staff'] = is_admin
        data['role'] = 'admin' if is_admin else 'user'
        
        return data

class UserSerializer(serializers.ModelSerializer):
    """User information serializer"""
    class Meta:
        model = User
        fields = ('id', 'email', 'is_staff')
        read_only_fields = ('is_staff',)

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password2')
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user

class SubmissionSerializer(serializers.ModelSerializer):
    """Serializer for user's submissions"""
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactSubmission
        fields = ('id', 'linkedin_url', 'message', 'email', 'is_processed', 
                 'created_at', 'user_email', 'admin_reply', 'admin_reply_date')
        read_only_fields = ('is_processed', 'admin_reply', 'admin_reply_date')
    
    def get_user_email(self, obj):
        if obj.user:
            return obj.user.email
        return obj.email
        
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            validated_data['email'] = request.user.email
        return super().create(validated_data)

class UserSubmissionDetailSerializer(serializers.ModelSerializer):
    """Serializer for user's individual submission details"""
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactSubmission
        fields = ('id', 'linkedin_url', 'message', 'email', 'is_processed', 
                 'created_at', 'user_email', 'admin_reply', 'admin_reply_date')
        read_only_fields = ('is_processed', 'admin_reply', 'admin_reply_date')
    
    def get_user_email(self, obj):
        if obj.user:
            return obj.user.email
        return obj.email
        
    def to_representation(self, instance):
        """Only include admin_reply if submission is processed"""
        representation = super().to_representation(instance)
        
        # If not processed, don't include admin reply
        if not instance.is_processed:
            representation.pop('admin_reply', None)
            
        return representation

class AdminSubmissionSerializer(serializers.ModelSerializer):
    """Admin serializer with full access"""
    user_email = serializers.SerializerMethodField()
    
    class Meta:
        model = ContactSubmission
        fields = '__all__'
    
    def get_user_email(self, obj):
        if obj.user:
            return obj.user.email
        return obj.email

class AnalysisSerializer(serializers.ModelSerializer):
    """Serializer for detailed submission analysis"""
    class Meta:
        model = SubmissionAnalysis
        fields = ('id', 'submission', 'strengths', 'weaknesses', 
                 'recommendations', 'score', 'analyzed_at')
        read_only_fields = ('analyzed_at',)
