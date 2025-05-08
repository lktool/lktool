from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        
        # Add role claim - used to identify admin vs regular users
        token['role'] = 'user'  # Default role is user
        
        # Check if this matches admin credentials from settings
        from django.conf import settings
        if user.email == settings.ADMIN_EMAIL:
            token['role'] = 'admin'
            
        return token
    
    def validate(self, attrs):
        # Get the email and normalize it for consistency
        if 'email' in attrs:
            attrs['email'] = attrs['email'].lower().strip()
        
        try:
            # First, validate credentials using parent's validate method
            data = super().validate(attrs)
            
            # Check if user email is verified
            if not self.user.is_verified:
                raise serializers.ValidationError(
                    {"email": ["Email not verified. Please check your inbox for the verification link."]}
                )
            
            return data
            
        except serializers.ValidationError as e:
            # Enhance error message if it's about incorrect credentials
            if hasattr(e, 'detail') and 'No active account found with the given credentials' in str(e.detail):
                raise serializers.ValidationError(
                    {"email": ["No account found with this email and password combination."]}
                )
            raise

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password2')
    
    def validate(self, attrs):
        if attrs['password'] != attrs.get('password2'):
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2', None)  # Remove password2 field
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            is_verified=False  # Explicitly set as not verified
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'is_verified')

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
