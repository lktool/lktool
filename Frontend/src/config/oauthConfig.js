// config/oauthConfig.js

// Get the base URL from environment or use the current host
const getBaseUrl = () => {
  // For production
  if (import.meta.env.VITE_APP_ENV === 'production') {
    return 'https://lktools.onrender.com';
  }
  
  // For development, use the current host with the correct port
  return window.location.origin;
};

// OAuth configuration object
export const oauthConfig = {
  google: {
    // This must match exactly what's configured in Google Cloud Console
    redirectUri: `${getBaseUrl()}/auth/google/callback`, // Removed hash
    
    // For debugging
    getRedirectInfo: () => ({
      configuredUri: `${getBaseUrl()}/auth/google/callback`, // Removed hash
      currentHost: window.location.origin,
      fullPath: `${window.location.origin}/auth/google/callback` // Removed hash
    })
  }
};

// Export the Google OAuth config separately for Login.jsx
export const GOOGLE_OAUTH_CONFIG = {
  redirectUri: `${getBaseUrl()}/auth/google/callback`, // Removed hash
  
  // ...existing code...
  
  // Helper to build the full OAuth URL
  getAuthUrl: () => {
    // ...existing code...
    const redirectUri = encodeURIComponent(`${getBaseUrl()}/auth/google/callback`); // Removed hash
    // ...existing code...
  }
};