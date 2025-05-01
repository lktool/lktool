import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const checkAdminAuth = () => {
      const isAdmin = adminService.isAuthenticated();
      setIsAuthenticated(isAdmin);
      setIsLoading(false);
    };
    
    checkAdminAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <LoadingSpinner size="large" text="Verifying admin credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default AdminRoute;
