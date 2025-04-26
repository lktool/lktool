import json
import requests
import secrets
import string
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

# Set up logging
logger = logging.getLogger(__name__)

User = get_user_model()

def generate_random_password(length=12):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for i in range(length))

class GoogleAuthView(APIView):
    """
    Google Authentication View for handling token verification and user creation
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Get the Google ID token and action type from the request
        credential = request.data.get('credential')
        action_type = request.data.get('action', 'login')  # 'login' or 'signup'
        
        # Debug information
        logger.info(f"Google Auth request received from {request.META.get('HTTP_ORIGIN', 'unknown origin')}")
        logger.info(f"Action type: {action_type}")
        
        if not credential:
            logger.error("Google Auth error: No credential provided")
            return Response(
                {'error': 'Google credential is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the Google token
            logger.info(f"Verifying Google token (first 10 chars): {credential[:10]}...")
            google_response = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}'
            )
            
            if google_response.status_code != 200:
                logger.error(f"Google token verification failed with status {google_response.status_code}")
                # Log more detailed error info
                try:
                    error_data = google_response.json()
                    logger.error(f"Google error response: {error_data}")
                except:
                    logger.error(f"Google error raw response: {google_response.text}")
                    
                return Response(
                    {'error': 'Invalid Google credential'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            google_data = google_response.json()
            logger.info(f"Google token verified for email: {google_data.get('email', 'unknown')}")
            
            # Get the email from Google response
            email = google_data.get('email')
            if not email:
                logger.error("Email not found in Google account data")
                return Response(
                    {'error': 'Email not found in Google account'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user exists with this email
            user_exists = User.objects.filter(email=email).exists()
            logger.info(f"User exists check for {email}: {user_exists}")
            
            # Handle based on action type and whether user exists
            if action_type == 'login':
                if not user_exists:
                    logger.warning(f"Login attempt for non-existent user: {email}")
                    return Response(
                        {'error': 'No account exists with this email. Please sign up first.', 
                         'needs_signup': True},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Get the existing user
                user = User.objects.get(email=email)
                logger.info(f"User found for login: {user.id} ({email})")
                
            else:  # action_type == 'signup'
                if user_exists:
                    logger.warning(f"Signup attempt for existing user: {email}")
                    return Response(
                        {'error': 'An account already exists with this email. Please log in instead.',
                         'needs_login': True},
                        status=status.HTTP_409_CONFLICT
                    )
                
                # Create a new user with a randomly generated password
                random_password = generate_random_password()
                
                logger.info(f"Creating new user for: {email}")
                user = User.objects.create_user(
                    email=email,
                    password=random_password,  # Use our generated password
                    first_name=google_data.get('given_name', ''),
                    last_name=google_data.get('family_name', ''),
                    is_verified=True  # Google-authenticated users are auto-verified
                )
            
            # Generate JWT token for authentication
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Authentication successful for {email}, returning tokens")
            return Response({
                'token': str(refresh.access_token),
                'access': str(refresh.access_token),  # For consistency with other auth endpoints
                'refresh_token': str(refresh),
                'refresh': str(refresh),  # For consistency with other auth endpoints
                'is_new_user': action_type == 'signup',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
            
        except Exception as e:
            logger.exception(f"Google auth error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )