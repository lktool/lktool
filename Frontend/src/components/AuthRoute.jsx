import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';
import LoadingSpinner from './LoadingSpinner';

function AuthRoute({ children, requireAdmin = false, redirectTo = "/login" }) {
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = unifiedAuthService.isAuthenticated();
      
      if (!isAuthenticated) {
        setCanAccess(false);
        setIsLoading(false);
        return;
      }
      
      // If admin access is required, check role
      if (requireAdmin) {
        const isAdmin = unifiedAuthService.isAdmin();
        if (!isAdmin) {
          setCanAccess(false);
          setIsLoading(false);
          return;
        }
      }
      
      // Verify token with backend
      try {
        const isTokenValid = await unifiedAuthService.verifyToken();
        setCanAccess(isTokenValid);
        if (!isTokenValid) {
          unifiedAuthService.logout();
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        unifiedAuthService.logout();
        setCanAccess(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [requireAdmin]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!canAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default AuthRoute;
