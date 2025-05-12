import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
// Update import to use the new API structure
import { authService } from '../api';
import LoadingSpinner from './LoadingSpinner';

function PublicOnlyRoute({ children, adminRedirect = '/admin/dashboard', userRedirect = '/inputMain' }) {
  const [authStatus, setAuthStatus] = useState({ checking: true, isAuthenticated: false, isAdmin: false });
  
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      
      if (isAuthenticated) {
        const isAdmin = authService.isAdmin();
        const isValid = await authService.verifyToken();
        
        if (!isValid) {
          authService.logout();
          setAuthStatus({ checking: false, isAuthenticated: false, isAdmin: false });
        } else {
          setAuthStatus({ checking: false, isAuthenticated: true, isAdmin });
        }
      } else {
        setAuthStatus({ checking: false, isAuthenticated: false, isAdmin: false });
      }
    };
    
    checkAuth();
    
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);
  
  if (authStatus.checking) {
    return <LoadingSpinner />;
  }
  
  // If authenticated, redirect to appropriate dashboard
  if (authStatus.isAuthenticated) {
    if (authStatus.isAdmin) {
      return <Navigate to={adminRedirect} replace />;
    } else {
      return <Navigate to={userRedirect} replace />;
    }
  }
  
  // If not authenticated, render the public route
  return children;
}

export default PublicOnlyRoute;
