import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api';

// Create context
const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    isLoading: true,
    email: null,
    role: null
  });
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      // Skip if not authenticated
      if (!authService.isAuthenticated()) {
        setUser(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false
        }));
        return;
      }
      
      try {
        // Fetch user profile
        const profileResponse = await authService.getProfile();
        
        if (!profileResponse.success) {
          throw new Error('Failed to fetch profile');
        }
        
        setUser({
          isAuthenticated: true,
          isLoading: false,
          email: profileResponse.profile.email,
          role: profileResponse.profile.role
        });
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Clear auth on error
        authService.logout();
        setUser({
          isAuthenticated: false,
          isLoading: false,
          email: null,
          role: null
        });
      }
    };
    
    fetchUserData();
    
    // Setup listener for auth changes
    const handleAuthChange = () => fetchUserData();
    window.addEventListener('authChange', handleAuthChange);
    
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);
  
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

export default UserContext;
