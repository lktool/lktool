from django.apps import AppConfig

class AdminApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_api'
    
    def ready(self):
        """
        Initialize any setup needed for the admin_api app
        """
        pass
