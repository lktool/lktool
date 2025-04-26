import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../api/authService';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // CRITICAL FIX: Force server validation of token instead of just checking local storage
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Make an actual API call to verify the token with the server
        const response = await authService.getCurrentUser();
        if (response && response.data) {
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } else {
          // If no data returned, token might be invalid
          setIsAuthenticated(false);
          authService.logout(); // Clear any invalid tokens
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
        // Any error means the token is invalid or expired
        setIsAuthenticated(false);
        authService.logout(); // Clear invalid tokens
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
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
