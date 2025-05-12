from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.db.models import Count, Avg, Q

from .models import ProfileAnalysis
from .serializers import ProfileAnalysisSerializer, SubmissionWithAnalysisSerializer
from contact.models import ContactSubmission
from contact.serializers import ContactSerializer
from users.authentication import AdminJWTAuthentication

class ProfileAnalysisCreateView(APIView):
    """API endpoint for creating a profile analysis"""
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def post(self, request):
        # Extract submission ID from request
        submission_id = request.data.get('submission_id')
        if not submission_id:
            return Response({'error': 'Submission ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Debug info
        print(f"ProfileAnalysisCreateView - user: {request.user}, submission_id: {submission_id}")
        
        # Check if submission exists
        submission = get_object_or_404(ContactSubmission, id=submission_id)
        
        # Check if analysis already exists
        if hasattr(submission, 'analysis'):
            return Response({'error': 'Analysis already exists for this submission'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare data for serializer
        data = request.data.copy()
        data['submission'] = submission_id
        data['created_by'] = getattr(request.user, 'id', 0)  # Handle admin user which has id=0
        
        # Create analysis
        serializer = ProfileAnalysisSerializer(data=data)
        if serializer.is_valid():
            analysis = serializer.save()
            
            # Mark submission as processed
            submission.is_processed = True
            submission.save(update_fields=['is_processed'])
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileAnalysisDetailView(APIView):
    """API endpoint for retrieving a profile analysis"""
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request, analysis_id):
        analysis = get_object_or_404(ProfileAnalysis, id=analysis_id)
        serializer = ProfileAnalysisSerializer(analysis)
        return Response(serializer.data)
    
    def put(self, request, analysis_id):
        analysis = get_object_or_404(ProfileAnalysis, id=analysis_id)
        serializer = ProfileAnalysisSerializer(analysis, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmissionAnalysisStatusView(APIView):
    """API endpoint to check analysis status for a submission"""
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request, submission_id):
        submission = get_object_or_404(ContactSubmission, id=submission_id)
        has_analysis = hasattr(submission, 'analysis')
        
        return Response({
            'submission_id': submission_id,
            'has_analysis': has_analysis,
            'is_processed': submission.is_processed,
            'analysis_id': submission.analysis.id if has_analysis else None
        })

class AdminDashboardStatsView(APIView):
    """API endpoint to get stats for admin dashboard"""
    permission_classes = [IsAdminUser]
    authentication_classes = [AdminJWTAuthentication]
    
    def get(self, request):
        # Get overall stats
        total_submissions = ContactSubmission.objects.count()
        processed_submissions = ContactSubmission.objects.filter(is_processed=True).count()
        pending_submissions = total_submissions - processed_submissions
        
        # Get recent submissions (last 30 days)
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        recent_submissions = ContactSubmission.objects.filter(created_at__gte=thirty_days_ago).count()
        
        # Get average analysis score
        analyses = ProfileAnalysis.objects.all()
        avg_score = analyses.aggregate(Avg('score'))['score__avg'] or 0
        
        # Risk level distribution
        risk_distribution = {
            'low': ProfileAnalysis.objects.filter(risk_level='low').count(),
            'medium': ProfileAnalysis.objects.filter(risk_level='medium').count(),
            'high': ProfileAnalysis.objects.filter(risk_level='high').count(),
        }
        
        return Response({
            'total_submissions': total_submissions,
            'processed_submissions': processed_submissions,
            'pending_submissions': pending_submissions,
            'recent_submissions': recent_submissions,
            'avg_score': round(avg_score, 1),
            'risk_distribution': risk_distribution
        })
