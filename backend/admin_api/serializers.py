from rest_framework import serializers
from users.models import CustomUser

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'is_verified']
