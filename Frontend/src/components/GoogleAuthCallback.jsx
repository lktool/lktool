import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  
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
    
    if (token) {
      // Store the token in localStorage so the opener window can access it
      localStorage.setItem('google_token', token);
      
      // Show success message
      console.log('Successfully authenticated with Google');
      
      // Navigate to the main page or close this window
      // If this window was opened by another window, close it
      if (window.opener) {
        window.close();
      } else {
        navigate('/inputMain');
      }
    } else {
      // Show error
      console.error('No ID token found in URL');
      
      // Navigate back to login
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="google-auth-callback">
      <p>Completing authentication...</p>
    </div>
  );
};

export default GoogleAuthCallback;