from rest_framework import permissions
from django.conf import settings
from django.contrib.auth import get_user_model  # Add this import

User = get_user_model()  # If needed

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow owners of an object or admins to view/edit it
    """
    def has_object_permission(self, request, view, obj):
        # Always allow admins (staff users or users with admin email)
        if request.user.is_staff or request.user.email == getattr(settings, 'ADMIN_EMAIL', None):
            return True
            
        # Check if object has a user field that matches the request user
        if hasattr(obj, 'user') and obj.user:
            return obj.user == request.user
            
        # Check if object has an email field that matches the request user
        if hasattr(obj, 'email'):
            return obj.email.lower() == request.user.email.lower()
            
        return False

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to allow access only to admin users
    """
    def has_permission(self, request, view):
        # Staff users are always admins
        if request.user.is_staff:
            return True
            
        # Check if user email matches admin email from settings
        return request.user.email == getattr(settings, 'ADMIN_EMAIL', None)
