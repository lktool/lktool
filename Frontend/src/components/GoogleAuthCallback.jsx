import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    // Function to extract id token from URL hash
    const getTokenFromHash = () => {
      // Parse the URL parameters from the hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      
      // Get the id token
      return params.get('id_token');
    };
    
    // Try to get the token
    const token = getTokenFromHash();
    console.log("Google Auth Callback - token present:", !!token);
    
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('google_token', token);
      
      try {
        // If opened from another window, notify it and close
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            token
          }, window.location.origin);
          
          // Close this window after sending the message
          window.close();
          return;
        } 
        // If direct navigation, proceed with auto-login
        else {
          // Navigate to main page after successful auth
          navigate('/inputMain');
        }
      } catch (err) {
        console.error("Error in callback processing:", err);
        setError("Error processing authentication. Please try again.");
      }
    } else {
      // No token found
      const errorMsg = 'No authentication token found. Please try again.';
      setError(errorMsg);
      
      if (window.opener) {
        try {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: errorMsg
          }, window.location.origin);
          setTimeout(() => window.close(), 2000);
        } catch (e) {
          console.error("Error posting to opener:", e);
        }
      } else {
        // Redirect back to login after showing error
        setTimeout(() => navigate('/login'), 3000);
      }
    }
    
    setIsProcessing(false);
  }, [navigate]);

  // Show loading or error state
  if (isProcessing) {
    return <LoadingSpinner message="Processing authentication..." />;
  }

  return (
    <div className="google-auth-callback-container">
      {error ? (
        <div className="auth-error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting back to login...</p>
        </div>
      ) : (
        <div className="auth-success">
          <h2>Successfully Authenticated</h2>
          <p>You will be redirected automatically...</p>
        </div>
      )}
    </div>
  );
};

export default GoogleAuthCallback;