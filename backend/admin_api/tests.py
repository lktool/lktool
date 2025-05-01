from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.conf import settings

class AdminAPITests(TestCase):
    """
    Tests for Admin API endpoints
    """
    def setUp(self):
        self.client = APIClient()
        
    def test_admin_login_valid_credentials(self):
        """Test admin login with valid credentials"""
        url = reverse('admin_login')
        data = {
            'email': settings.ADMIN_EMAIL,
            'password': settings.ADMIN_PASSWORD
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        url = reverse('admin_login')
        data = {
            'email': 'wrong@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
