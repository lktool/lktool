import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';
import axios from 'axios';
import { API_CONFIG } from '../api/apiConfig';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated AND is admin
    const checkAdminAuth = async () => {
      const isAuthenticated = unifiedAuthService.isAuthenticated();
      const hasAdminRole = unifiedAuthService.isAdmin();
      
      // Verify token with backend if both local checks pass
      if (isAuthenticated && hasAdminRole) {
        try {
          await unifiedAuthService.verifyToken();
          setIsAdmin(true);
        } catch (error) {
          console.error('Admin authentication verification failed:', error);
          unifiedAuthService.logout();
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };
    
    checkAdminAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAdminAuth();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default AdminRoute;
