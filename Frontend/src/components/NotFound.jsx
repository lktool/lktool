import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically redirect to home page after 3 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 3000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn't exist or has been moved.</p>
      <p>Redirecting to homepage in 3 seconds...</p>
      <button onClick={() => navigate('/')} className="not-found-button">
        Go to Homepage
      </button>
    </div>
  );
}

export default NotFound;
