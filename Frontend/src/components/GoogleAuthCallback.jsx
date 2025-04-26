import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Function to extract id token from URL hash
    const getTokenFromHash = () => {
      // Remove the pound sign
      const hash = window.location.hash.substring(1);
      
      // Parse the URL parameters
      const params = new URLSearchParams(hash);
      
      // Get the id token (changed from access_token to id_token)
      return params.get('id_token');
    };
    
    // Try to get the token
    const token = getTokenFromHash();
    console.log("Google Auth Callback - token present:", !!token);
    
    if (token) {
      // Store the token in localStorage so the opener window can access it
      localStorage.setItem('google_token', token);
      
      // Show success message
      console.log('Successfully authenticated with Google');
      
      // Navigate to the main page or close this window
      // If this window was opened by another window, close it
      if (window.opener) {
        // Let the opener know we succeeded
        try {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', token }, '*');
        } catch (e) {
          console.error("Error posting message to opener:", e);
        }
        window.close();
      } else {
        navigate('/inputMain');
      }
    } else {
      // Show error
      const errorMsg = 'No ID token found in URL. Authentication failed.';
      console.error(errorMsg);
      setError(errorMsg);
      
      // If opened from another window
      if (window.opener) {
        try {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: errorMsg }, '*');
        } catch (e) {
          console.error("Error posting error to opener:", e);
        }
        setTimeout(() => window.close(), 3000); // Close after 3 seconds
      } else {
        // If direct navigation, go back to login after delay
        setTimeout(() => navigate('/login'), 3000);
      }
    }
  }, [navigate]);

  return (
    <div className="google-auth-callback" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      {error ? (
        <div style={{ color: 'red' }}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting back to login...</p>
        </div>
      ) : (
        <div>
          <h2>Completing Authentication</h2>
          <p>Please wait while we complete the Google authentication process...</p>
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%',
            margin: '20px auto',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthCallback;