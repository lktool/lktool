import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { unifiedAuthService } from '../api/unifiedAuthService'; // Changed from authService
import LoadingSpinner from './LoadingSpinner';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const credential = urlParams.get('credential');
      const action = urlParams.get('action') || 'login';
      
      if (!credential) {
        setError('No credential provided');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Use unified auth service
        const response = await unifiedAuthService.googleAuth(credential, action);
        
        if (response.success) {
          navigate('/inputMain');
        } else {
          setError(response.error || 'Authentication failed');
        }
      } catch (err) {
        console.error('Google auth error:', err);
        setError('Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };
    
    handleCallback();
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
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
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