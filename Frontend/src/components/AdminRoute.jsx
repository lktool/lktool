import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const checkAdminAuth = () => {
      // IMPORTANT: Get the admin token (not regular user token!)
      const adminToken = localStorage.getItem('adminToken');
      setIsAuthenticated(!!adminToken);
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

  // If not authenticated as admin, redirect to admin login page
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated, render the protected content
  return children;
}

export default AdminRoute;
