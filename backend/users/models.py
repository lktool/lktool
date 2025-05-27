from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    """
    Custom manager for CustomUser
    """
    def create_user(self, email, password=None, **extra_fields):
        """
        Create and return a 'CustomUser' with an email and password.
        """
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create and return a superuser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

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

# Add the subscription model
class UserSubscription(models.Model):
    """Model to track user subscription tiers and status"""
    SUBSCRIPTION_TIERS = (
        ('free', 'Free'),
        ('basic', 'Basic'),
        ('premium', 'Premium'),
    )
    
    user = models.OneToOneField('users.CustomUser', on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(max_length=10, choices=SUBSCRIPTION_TIERS, default='free')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    # Make assigned_by nullable
    assigned_by = models.ForeignKey('users.CustomUser', on_delete=models.SET_NULL, 
                                   null=True, blank=True, related_name='assigned_subscriptions')
    notes = models.TextField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'User Subscription'
        verbose_name_plural = 'User Subscriptions'
    
    def is_active(self):
        """Check if subscription is still active"""
        if self.tier == 'free':
            return True
        if self.end_date is None:  # Unlimited subscription
            return True
        return timezone.now() <= self.end_date
    
    def __str__(self):
        return f"{self.user.email}: {self.tier} ({'Active' if self.is_active() else 'Expired'})"
