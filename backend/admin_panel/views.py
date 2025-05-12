from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import ProfileAnalysis
from .serializers import ProfileAnalysisSerializer
from contact.models import ContactSubmission
from contact.serializers import ContactSerializer

class ProfileAnalysisCreateView(APIView):
    """API endpoint for admins to create profile analysis"""
    permission_classes = [IsAdminUser]
    
    @transaction.atomic
    def post(self, request):
        serializer = ProfileAnalysisSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            analysis = serializer.save()
            
            # Return the created analysis
            return Response(
                ProfileAnalysisSerializer(analysis).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileAnalysisDetailView(APIView):
    """API endpoint for admins to retrieve, update, or delete profile analysis"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, analysis_id):
        analysis = get_object_or_404(ProfileAnalysis, id=analysis_id)
        serializer = ProfileAnalysisSerializer(analysis)
        return Response(serializer.data)
    
    def put(self, request, analysis_id):
        analysis = get_object_or_404(ProfileAnalysis, id=analysis_id)
        serializer = ProfileAnalysisSerializer(
            analysis, 
            data=request.data,
            context={'request': request},
            partial=True
        )
        
        if serializer.is_valid():
            analysis = serializer.save()
            return Response(ProfileAnalysisSerializer(analysis).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, analysis_id):
        analysis = get_object_or_404(ProfileAnalysis, id=analysis_id)
        analysis.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class SubmissionAnalysisStatusView(APIView):
    """API endpoint for admins to check if a submission has been analyzed"""
    permission_classes = [IsAdminUser]
    
    def get(self, request, submission_id):
        submission = get_object_or_404(ContactSubmission, id=submission_id)
        
        try:
            analysis = ProfileAnalysis.objects.get(submission=submission)
            return Response({
                'has_analysis': True,
                'analysis_id': analysis.id
            })
        except ProfileAnalysis.DoesNotExist:
            return Response({
                'has_analysis': False
            })

class AdminDashboardStatsView(APIView):
    """API endpoint for admin dashboard statistics"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Count submissions by status
        total_submissions = ContactSubmission.objects.count()
        processed_submissions = ContactSubmission.objects.filter(is_processed=True).count()
        pending_submissions = total_submissions - processed_submissions
        
        # Count analyzed submissions
        analyzed_submissions = ProfileAnalysis.objects.count()
        
        # Calculate risk distribution
        low_risk = ProfileAnalysis.objects.filter(risk_level='low').count()
        medium_risk = ProfileAnalysis.objects.filter(risk_level='medium').count()
        high_risk = ProfileAnalysis.objects.filter(risk_level='high').count()
        
        return Response({
            'total_submissions': total_submissions,
            'processed_submissions': processed_submissions,
            'pending_submissions': pending_submissions,
            'analyzed_submissions': analyzed_submissions,
            'risk_distribution': {
                'low': low_risk,
                'medium': medium_risk,
                'high': high_risk
            }
        })
