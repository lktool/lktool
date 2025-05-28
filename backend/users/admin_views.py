from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime
import traceback
from .models import UserSubscription
from .authentication import AdminJWTAuthentication

User = get_user_model()

class AdminUserSubscriptionView(APIView):
    """Admin API endpoint for managing user subscriptions"""
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]

    def post(self, request):
        try:
            email = request.data.get('email')
            tier = request.data.get('tier')
            valid_for_days = request.data.get('valid_for_days')
            
            # Validate required fields
            if not email or not tier:
                return Response({
                    'error': 'Email and tier are required'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Convert valid_for_days to integer
            try:
                valid_for_days = int(valid_for_days) if valid_for_days else 30
            except ValueError:
                valid_for_days = 30
                
            # Validate subscription tier
            valid_tiers = ['free', 'basic', 'premium', 'premium_elite']
            if tier not in valid_tiers:
                return Response({
                    'error': f'Invalid tier. Must be one of: {", ".join(valid_tiers)}'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Find user by email
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'error': f'User with email {email} not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Calculate end date
            end_date = None
            if tier != 'free' and valid_for_days > 0:
                end_date = timezone.now() + datetime.timedelta(days=valid_for_days)
            
            # Create or update subscription
            subscription, created = UserSubscription.objects.update_or_create(
                user=user,
                defaults={
                    'tier': tier,
                    'end_date': end_date,
                    'is_active': True
                }
            )
            
            return Response({
                'message': f'Subscription updated for {email}',
                'tier': subscription.tier,
                'end_date': subscription.end_date.isoformat() if subscription.end_date else None,
                'is_active': subscription.is_active,
                'created': created
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Print full exception for debugging
            print(f"Error updating subscription: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': f'Failed to update subscription: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
