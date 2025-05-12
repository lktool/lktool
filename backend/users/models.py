from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

from .managers import CustomUserManager

class CustomUser(AbstractUser):
    """
    Custom User model that uses email as unique identifier instead of username
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'Regular User'),
    ]
    
    username = None  # Remove username field
    email = models.EmailField(_('email address'), unique=True)
    email_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    google_id = models.CharField(max_length=255, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()
    
    def __str__(self):
        return self.email
        
    def is_admin_user(self):
        return self.role == 'admin' or self.is_staff or self.is_superuser
