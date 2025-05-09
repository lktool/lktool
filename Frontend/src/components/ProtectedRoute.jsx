import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { unifiedAuthService } from '../api/unifiedAuthService';
import LoadingSpinner from './LoadingSpinner';
import './ProtectedRoute.css';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token and role from localStorage
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // If we have both token and role, we're authenticated
        setIsAuthenticated(true);
        setUserRole(role);
      } catch (error) {
        console.error('Authentication verification failed:', error);
        setIsAuthenticated(false);
        unifiedAuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="large" text="Verifying authentication..." />
      </div>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    // Store redirect reason for login page
    localStorage.setItem('auth_redirect_reason', 'login_required');
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
