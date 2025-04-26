/**
 * OAuth Configuration settings
 */

// The redirect URI that matches what's configured in Google Cloud Console
export const GOOGLE_OAUTH_CONFIG = {
  // This must match exactly what's in Google Cloud Console
  REDIRECT_URI: 'https://lktools.onrender.com/#/auth/google/callback',
  
  // Get the appropriate redirect URI based on environment
  getRedirectUri: () => {
    // When in production, use the exact URL
    if (process.env.NODE_ENV === 'production') {
      return 'https://lktools.onrender.com/#/auth/google/callback';
    }
    
    // In development, use the localhost version
    return `${window.location.origin}/#/auth/google/callback`;
  }
};
