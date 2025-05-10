from rest_framework.permissions import BasePermission

class IsAdminUserCustom(BasePermission):
    def has_permission(self, request, view):
        return request.auth and request.auth.get("role") == "admin"

class IsRegularUserCustom(BasePermission):
    def has_permission(self, request, view):
        return request.auth and request.auth.get("role") == "user"
