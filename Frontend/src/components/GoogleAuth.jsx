import { useEffect, useState } from 'react';
import { oauthConfig } from '../config/oauthConfig';
import { API_CONFIG, getApiUrl } from '../api/apiConfig';

/**
 * Google Authentication component with button
 */
function GoogleAuth({ onLoginStart }) {
  const [googleAuthUrl, setGoogleAuthUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Build the Google OAuth URL
    async function buildGoogleAuthUrl() {
      try {
        // Fetch the authentication URL from your backend (recommended approach)
        // This keeps your client ID and secret on the server side
        const response = await fetch(getApiUrl('/api/auth/google/get-auth-url'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            redirect_uri: `${getBaseUrl()}/auth/google/callback` // Removed hash
          })
        });
        
        if (!response.ok) throw new Error('Failed to get auth URL');
        const data = await response.json();
        
        setGoogleAuthUrl(data.auth_url);
      } catch (err) {
        console.error("Failed to build Google auth URL:", err);
        setError('Google sign-in is currently unavailable');
        
        // Fallback approach
        if (clientId) {
          const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
          url.searchParams.append('client_id', clientId);
          url.searchParams.append('response_type', 'code');
          url.searchParams.append('scope', 'email profile');
          url.searchParams.append('redirect_uri', `${getBaseUrl()}/auth/google/callback`); // Removed hash
          url.searchParams.append('prompt', 'select_account');
          
          setGoogleAuthUrl(url.toString());
          setError('');
        }
      }
    }
    
    buildGoogleAuthUrl();
  }, []);

  const handleGoogleLogin = () => {
    if (onLoginStart) onLoginStart();
    
    // Log what's happening
    console.log("Starting Google login with redirect URI:", oauthConfig.google.redirectUri);
    
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    } else {
      setError('Google authentication URL is not available');
    }
  };

  return (
    <div className="google-auth">
      <button 
        onClick={handleGoogleLogin}
        disabled={!googleAuthUrl}
        className="google-auth-button"
      >
        <img 
          src="/google-logo.svg" 
          alt="Google" 
          className="google-logo" 
        />
        Continue with Google
      </button>
      
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default GoogleAuth;
