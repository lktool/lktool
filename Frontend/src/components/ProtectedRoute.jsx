import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../api/authService';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if the user is authenticated by requesting their profile
        const response = await authService.getCurrentUser();
        setIsAuthenticated(true);
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    // You could render a loading spinner here
    return <div className="loading">Loading...</div>;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
