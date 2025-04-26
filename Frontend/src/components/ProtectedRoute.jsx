import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    
    // Optional: verify token on server if needed
    // For now, just check if it exists
    setIsAuthenticated(true);
    
    // Set user role if available (optional)
    const role = localStorage.getItem('userRole') || 'user';
    setUserRole(role);
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check role permissions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/not-found" />;
  }
  
  // User is authenticated and has permission
  return children;
}

export default ProtectedRoute;
