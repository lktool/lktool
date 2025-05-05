import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

function AdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkCompleted, setCheckCompleted] = useState(false);

  useEffect(() => {
    // Check if admin is authenticated
    const checkAdminAuth = () => {
      // IMPORTANT: Get the admin token (not regular user token!)
      const adminToken = localStorage.getItem('adminToken');
      console.log("AdminRoute: Checking admin authentication with token:", adminToken ? "exists" : "missing");
      setIsAuthenticated(!!adminToken);
      setIsLoading(false);
      setCheckCompleted(true);
    };
    
    checkAdminAuth();
    
    // Add listener to detect token changes
    const handleStorageChange = (e) => {
      if (e.key === 'adminToken') {
        checkAdminAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Don't redirect until we've completed the check
  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <LoadingSpinner size="large" text="Verifying admin credentials..." />
      </div>
    );
  }

  // Only redirect if we've completed the check and user isn't authenticated
  if (checkCompleted && !isAuthenticated) {
    console.log("AdminRoute: Not authenticated, redirecting to admin login");
    return <Navigate to="/admin" replace />;
  }

  // If authenticated, render the protected content
  return children;
}

export default AdminRoute;
