from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserSubscription

class UserSubscriptionInline(admin.TabularInline):
    """Inline interface for user subscriptions"""
    model = UserSubscription
    extra = 0
    fields = ('tier', 'start_date', 'end_date', 'assigned_by', 'notes')
    readonly_fields = ('start_date',)
    # Fix the multiple foreign key issue by specifying the user field
    fk_name = 'user'
    
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

# Update the CustomUserAdmin to use 'email' for ordering instead of 'username'
class CustomUserAdmin(UserAdmin):
    # Update these fields to match your CustomUser model
    ordering = ('email',)  # Use email instead of username for ordering
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'role')
    search_fields = ('email', 'first_name', 'last_name')
    
    # Adjust fieldsets to match your CustomUser model
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'role', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role'),
        }),
    )
    
    # Add the subscription inline
    inlines = [UserSubscriptionInline]

# Register the CustomUser with the updated admin
admin.site.register(CustomUser, CustomUserAdmin)