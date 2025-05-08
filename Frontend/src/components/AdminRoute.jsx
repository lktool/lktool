import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import jwt_decode from 'jwt-decode';  // You may need to install this package

function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin token exists and has admin role
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Decode the token to check for admin role
        const decoded = jwt_decode(adminToken);
        
        // Check if the token has admin role or user_type
        const isAdmin = (decoded.role === 'admin') || (decoded.user_type === 'admin');
        
        setIsAuthenticated(isAdmin);
      } catch (error) {
        console.error('Admin token validation error:', error);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAdminAuth();
    
    // Listen for token changes
    const handleStorageChange = (e) => {
      if (e.key === 'adminToken') {
        checkAdminAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <LoadingSpinner size="large" text="Verifying admin credentials..." />
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated as admin, render the protected content
  return children;
}

export default AdminRoute;
