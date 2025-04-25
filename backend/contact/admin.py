from django.contrib import admin
from .models import ContactSubmission

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ('email', 'linkedin_url', 'created_at', 'is_processed')
    list_filter = ('is_processed', 'created_at')
    search_fields = ('email', 'message', 'linkedin_url')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        (None, {
            'fields': ('email', 'linkedin_url')
        }),
        ('Message Content', {
            'fields': ('message',)
        }),
        ('Status Information', {
            'fields': ('is_processed', 'created_at')
        }),
    )
