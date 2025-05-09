import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { unifiedAuthService } from '../api/unifiedAuthService';

function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      // Use the unified auth service to directly check admin status
      const authenticated = unifiedAuthService.isAuthenticated();
      const adminRole = unifiedAuthService.isAdmin();
      
      setIsAdmin(authenticated && adminRole);
      setIsLoading(false);
    };
    
    checkAdminAuth();
    
    // Listen for auth changes
    const handleAuthChange = () => {
      checkAdminAuth();
    };
    
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <LoadingSpinner size="large" text="Verifying admin credentials..." />
      </div>
    );
  }

  // Redirect to admin login if not authenticated as admin
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated as admin, render the protected content
  return children;
}

export default AdminRoute;
