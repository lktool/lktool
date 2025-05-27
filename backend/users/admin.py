from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserSubscription

class UserSubscriptionInline(admin.TabularInline):
    """Inline interface for user subscriptions"""
    model = UserSubscription
    extra = 0
    fields = ('tier', 'start_date', 'end_date', 'assigned_by', 'notes')
    readonly_fields = ('start_date',)
    
    def get_queryset(self, request):
        """Only show subscriptions for this user"""
        qs = super().get_queryset(request)
        return qs
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Set the current user as the assigned_by field"""
        if db_field.name == "assigned_by":
            kwargs["initial"] = request.user.id
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    """Admin interface for user subscriptions"""
    list_display = ('user', 'tier', 'start_date', 'end_date', 'assigned_by', 'is_active')
    list_filter = ('tier', 'start_date')
    search_fields = ('user__email', 'assigned_by__email')
    date_hierarchy = 'start_date'
    
    def is_active(self, obj):
        return obj.is_active()
    is_active.boolean = True
    is_active.short_description = "Active"

# Add the inline to the user admin
class CustomUserAdmin(UserAdmin):
    # ...existing code...
    
    # Add the subscription inline
    inlines = [UserSubscriptionInline]
    
# Admin site registration
admin.site.register(CustomUser, CustomUserAdmin)