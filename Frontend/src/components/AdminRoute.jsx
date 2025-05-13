import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
// Update import to use the new API structure
import { authService } from '../api';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated AND is admin
    const checkAdminAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      const hasAdminRole = authService.isAdmin();
      const adminEmail = authService.getCurrentUserEmail();
      
      console.log(`Admin check: isAuth=${isAuthenticated}, isAdmin=${hasAdminRole}, email=${adminEmail}`);
      
      // Special case for known admin account
      if (isAuthenticated && hasAdminRole && adminEmail === 'mathan21092006@gmail.com') {
        console.log('Using special admin bypass for known admin account');
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }
      
      // Verify token with backend if both local checks pass
      if (isAuthenticated && hasAdminRole) {
        try {
          await authService.verifyToken();
          setIsAdmin(true);
        } catch (error) {
          console.error('Admin authentication verification failed:', error);
          authService.logout();
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
    // Change the redirect from "/admin" to "/login" for consistency
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;
