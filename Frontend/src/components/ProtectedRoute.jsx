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
        // Thoroughly verify token is valid by checking with the server
        const isValid = await authService.checkTokenValidity();
        
        if (isValid) {
          // Only if token is valid, fetch user profile
          const response = await authService.getCurrentUser();
          setIsAuthenticated(true);
          setUserRole(response.data.role);
        } else {
          // Clear invalid tokens
          authService.logout();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear invalid token
        authService.logout();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #67AE6E',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated, redirect to login with a reason
  if (!isAuthenticated) {
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
