import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GoogleAuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = () => {
      try {
        // Parse the URL hash to get the ID token
        const fragment = new URLSearchParams(window.location.hash.substring(1));
        const idToken = fragment.get('id_token');
        
        if (idToken) {
          // Store the token and close the window
          localStorage.setItem('google_token', idToken);
          
          // If this is running in a popup, close it
          if (window.opener) {
            window.close();
          } else {
            // If opened in main window, redirect back to appropriate page
            const action = localStorage.getItem('google_auth_action') || 'login';
            navigate(action === 'signup' ? '/signup' : '/login');
          }
        } else {
          console.error('No ID token found in the callback URL');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error processing Google callback:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="google-callback">
      <p>Processing authentication... Please wait.</p>
    </div>
  );
}

export default GoogleAuthCallback;