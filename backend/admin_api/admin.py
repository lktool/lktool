from django.contrib import admin
from .models import ProfileAnalysis

@admin.register(ProfileAnalysis)
class ProfileAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'submission', 'created_at')
    search_fields = ('user__email', 'submission__email')
    list_filter = ('created_at',)
    date_hierarchy = 'created_at'
