import json
import requests
import secrets
import string
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

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
        
        if not credential:
            return Response(
                {'error': 'Google credential is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify the Google token
            google_response = requests.get(
                f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}'
            )
            
            if google_response.status_code != 200:
                return Response(
                    {'error': 'Invalid Google credential'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            google_data = google_response.json()
            
            # Get the email from Google response
            email = google_data.get('email')
            if not email:
                return Response(
                    {'error': 'Email not found in Google account'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user exists with this email
            user_exists = User.objects.filter(email=email).exists()
            
            # Handle based on action type and whether user exists
            if action_type == 'login':
                if not user_exists:
                    return Response(
                        {'error': 'No account exists with this email. Please sign up first.', 
                         'needs_signup': True},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Get the existing user
                user = User.objects.get(email=email)
                
            else:  # action_type == 'signup'
                if user_exists:
                    return Response(
                        {'error': 'An account already exists with this email. Please log in instead.',
                         'needs_login': True},
                        status=status.HTTP_409_CONFLICT
                    )
                
                # Create a new user with a randomly generated password
                random_password = generate_random_password()
                
                user = User.objects.create_user(
                    email=email,
                    password=random_password,  # Use our generated password
                    first_name=google_data.get('given_name', ''),
                    last_name=google_data.get('family_name', '')
                )
            
            # Generate JWT token for authentication
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'token': str(refresh.access_token),
                'refresh_token': str(refresh),
                'is_new_user': action_type == 'signup',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
            })
            
        except Exception as e:
            print(f"Google auth error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )