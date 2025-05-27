from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser, UserSubscription
from .authentication import AdminJWTAuthentication

class UserSubscriptionView(APIView):
    """API endpoint for admin users to manage subscriptions"""
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request):
        """Get list of all user subscriptions"""
        try:
            subscriptions = UserSubscription.objects.select_related('user').all()
            
            data = [{
                'id': sub.id,
                'email': sub.user.email,
                'tier': sub.tier,
                'start_date': sub.start_date.isoformat() if sub.start_date else None,
                'end_date': sub.end_date.isoformat() if sub.end_date else None,
                'is_active': sub.is_active() if hasattr(sub, 'is_active') else True
            } for sub in subscriptions]
            
            return Response(data)
        except Exception as e:
            return Response({
                'error': f"Failed to fetch subscriptions: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Assign or update a user's subscription"""
        email = request.data.get('email')
        tier = request.data.get('tier')
        days = request.data.get('valid_for_days')
        
        # Validate required fields
        if not email or not tier:
            return Response({
                'error': 'Email and tier are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate tier
        valid_tiers = [choice[0] for choice in UserSubscription.SUBSCRIPTION_TIERS]
        if tier not in valid_tiers:
            return Response({
                'error': f'Invalid tier. Must be one of: {", ".join(valid_tiers)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Find the user
            user = CustomUser.objects.get(email=email)
            
            # Calculate end date if days specified
            end_date = None
            if days:
                try:
                    days = int(days)
                    if days > 0:
                        end_date = timezone.now() + timedelta(days=days)
                except ValueError:
                    return Response({
                        'error': 'valid_for_days must be a positive number'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create or update subscription - don't set assigned_by field
            subscription, created = UserSubscription.objects.update_or_create(
                user=user,
                defaults={
                    'tier': tier,
                    'end_date': end_date,
                    # Remove assigned_by field which was causing the error
                }
            )
            
            action = 'created' if created else 'updated'
            
            return Response({
                'success': True,
                'message': f'Subscription {action} successfully',
                'subscription': {
                    'id': subscription.id,
                    'email': user.email,
                    'tier': subscription.tier,
                    'end_date': subscription.end_date.isoformat() if subscription.end_date else None
                }
            })
            
        except CustomUser.DoesNotExist:
            return Response({
                'error': f'User with email {email} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Failed to update subscription: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
