import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
// Update import to use the new API structure
import { authService } from '../api';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check auth status via token in localStorage
        if (authService.isAuthenticated()) {
          // Verify the token
          const isTokenValid = await authService.verifyToken();
          setIsAuthenticated(isTokenValid);
          
          if (!isTokenValid) {
            authService.logout();
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    
    // Add listener for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  if (isAuthenticated === null) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default ProtectedRoute;
