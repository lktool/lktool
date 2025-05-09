from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# No models needed here - we'll use the User model directly
# And contact.models.ContactSubmission for submissions
