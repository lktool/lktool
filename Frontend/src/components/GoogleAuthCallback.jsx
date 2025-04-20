import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Function to extract id token from URL hash
    const getTokenFromHash = () => {
      // Check if we have a hash
      const hash = window.location.hash;
      if (!hash || hash.length < 2) {
        console.error('No hash found in URL');
        setError('Authentication failed: No hash found in URL');
        return null;
      }
      
      // Remove the pound sign
      const hashContent = hash.substring(1);
      
      // Parse the URL parameters
      const params = new URLSearchParams(hashContent);
      
      // Get the id token
      const token = params.get('id_token');
      
      if (!token) {
        console.error('No id_token found in URL hash');
        setError('Authentication failed: No id_token found in URL');
      }
      
      return token;
    };
    
    // Try to get the token
    const token = getTokenFromHash();
    
    if (token) {
      // Store the token in localStorage so the opener window can access it
      localStorage.setItem('google_token', token);
      
      // Show success message
      console.log('Successfully authenticated with Google');
      
      // If this window was opened by another window, close it
      if (window.opener) {
        window.close();
      } else {
        // Otherwise, navigate to the main page
        navigate('/inputMain');
      }
    } else {
      // If no token found, navigate back to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  }, [navigate]);

  return (
    <div className="google-auth-callback" style={{ 
      padding: "2rem", 
      textAlign: "center",
      maxWidth: "400px",
      margin: "100px auto",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      {error ? (
        <>
          <h2 style={{ color: "#d32f2f" }}>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting to login page...</p>
        </>
      ) : (
        <>
          <h2>Google Authentication</h2>
          <p>Completing authentication process...</p>
          <div className="loading-spinner" style={{ 
            margin: "20px auto",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3498db",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            animation: "spin 2s linear infinite"
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default GoogleAuthCallback;