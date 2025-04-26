import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GOOGLE_OAUTH_CONFIG } from '../config/oauthConfig';

function GoogleAuthCallback() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleCallback() {
      try {
        setLoading(true);
        
        // Get the code from the URL query parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        
        if (!code) {
          setError('Authentication failed: No code received from Google');
          return;
        }
        
        // Log for debugging
        console.log("Received OAuth code:", code);
        
        // Use the exact redirect URI that matches Google Cloud Console
        const redirectUri = GOOGLE_OAUTH_CONFIG.REDIRECT_URI;
        console.log("Using redirect URI:", redirectUri);
        
        // Send the code to your backend to exchange for tokens
        const response = await axios.post(
          'https://lktool.onrender.com/api/auth/google/', 
          { 
            code,
            redirect_uri: redirectUri
          }
        );
        
        if (response.data && response.data.access) {
          // Store the tokens
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('refreshToken', response.data.refresh);
          
          // Redirect to the main page
          navigate('/inputMain');
        } else {
          setError('Authentication failed: Invalid response from server');
        }
      } catch (err) {
        console.error("Google Auth Callback Error:", err);
        
        // Detailed error logging
        if (err.response) {
          console.error("Response data:", err.response.data);
          console.error("Response status:", err.response.status);
          
          // Set user-friendly error message
          if (err.response.data && err.response.data.error) {
            setError(`Authentication failed: ${err.response.data.error}`);
          } else {
            setError(`Authentication failed: Server error (${err.response.status})`);
          }
        } else {
          setError('Authentication failed: Network error');
        }
      } finally {
        setLoading(false);
      }
    }
    
    handleCallback();
  }, [location, navigate]);
  
  // Simple loading and error UI
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      {loading ? (
        <div>
          <h2>Completing authentication...</h2>
          <p>Please wait while we log you in.</p>
        </div>
      ) : error ? (
        <div>
          <h2>Authentication Error</h2>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      ) : (
        <div>
          <h2>Success!</h2>
          <p>You've been authenticated. Redirecting...</p>
        </div>
      )}
    </div>
  );
}

export default GoogleAuthCallback;