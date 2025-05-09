import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { unifiedAuthService } from '../api/unifiedAuthService';

function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Check if token exists and role is admin
      setIsAuthenticated(!!token);
      setIsAdmin(userRole === 'admin');
      setIsLoading(false);
    };
    
    checkAdminAuth();
    
    // Listen for authentication changes
    window.addEventListener('authChange', checkAdminAuth);
    window.addEventListener('storage', checkAdminAuth);
    
    return () => {
      window.removeEventListener('authChange', checkAdminAuth);
      window.removeEventListener('storage', checkAdminAuth);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <LoadingSpinner size="large" text="Verifying admin credentials..." />
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated as admin, render the protected content
  return children;
}

export default AdminRoute;
