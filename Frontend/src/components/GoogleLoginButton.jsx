import React, { useState } from 'react';
import axios from 'axios';
import { OAUTH_CONFIG } from '../api/config';
import './GoogleLoginButton.css';

// Google logo SVG for the custom button
const GoogleLogo = () => (
  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const GoogleLoginButton = ({ onSuccess, actionType = 'login' }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const { CLIENT_ID, REDIRECT_URI, RESPONSE_TYPE, SCOPE, PROMPT } = OAUTH_CONFIG.GOOGLE;
    
    localStorage.setItem('google_auth_action', actionType);
    
    const params = {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: RESPONSE_TYPE,
      scope: SCOPE,
      prompt: PROMPT,
      nonce: Math.random().toString(36).substring(2, 15),
    };
    
    const url = `${googleAuthUrl}?${new URLSearchParams(params).toString()}`;
    
    const authWindow = window.open(url, '_blank', 'width=500,height=600');
    
    if (!authWindow) {
      setIsLoading(false);
      setError("Popup blocked! Please allow popups for this site.");
      return;
    }
    
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        handleTokenVerification(event.data.token);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        setIsLoading(false);
        setError(event.data.error || "Authentication failed");
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    const checkWindowClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', messageHandler);
        setIsLoading(false);
        
        const token = localStorage.getItem('google_token');
        if (token) {
          handleTokenVerification(token);
          localStorage.removeItem('google_token');
        } else {
          setError("Authentication was cancelled or failed");
        }
      }
    }, 500);
  };
  
  const handleTokenVerification = async (token) => {
    try {
      const action = localStorage.getItem('google_auth_action') || actionType;
      localStorage.removeItem('google_auth_action');
      
      // Using the now-working API endpoint
      const url = `${import.meta.env.VITE_API_URL}/api/auth/google/`;
      
      const response = await axios({
        method: 'POST',
        url: url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: { 
          credential: token,
          action: action
        },
        withCredentials: true
      });
      
      const data = response.data;
      
      // Store tokens in localStorage
      if (data.access) {
        localStorage.setItem('token', data.access);
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
        }
        
        localStorage.setItem('userRole', data.role || 'user');
        localStorage.setItem('userEmail', data.email);
        
        // Explicitly trigger auth change event
        window.dispatchEvent(new Event('authChange'));
        
        if (onSuccess) {
          onSuccess(data.is_new_user);
        }
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    } catch (error) {
      // Handle common error cases
      if (error.response?.status === 409) {
        if (actionType === 'signup' && error.response.data?.needs_login) {
          setError("An account already exists with this email. Please log in instead.");
          
          if (window.confirm("An account with this email already exists. Would you like to log in instead?")) {
            window.location.href = '/login';
          }
          return;
        }
      }
      
      if (error.response?.status === 404) {
        if (actionType === 'login' && error.response.data?.needs_signup) {
          setError("No account found with this email. Please sign up first.");
          
          if (window.confirm("No account found with this email. Would you like to sign up instead?")) {
            window.location.href = '/signup';
          }
          return;
        }
      }
      
      setError(error.response?.data?.error || error.message || 'Error during Google authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-login-container">
      <button 
        className="custom-google-button" 
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {!isLoading && <GoogleLogo />}
        {isLoading ? 'Connecting...' : `Continue with Google`}
      </button>
      {error && <p className="google-error">{error}</p>}
    </div>
  );
};

export default GoogleLoginButton;
