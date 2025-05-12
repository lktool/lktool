import React from 'react';
import { useState } from 'react';
import axios from 'axios'; // Add axios import
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
  
  // Function to handle Google sign-in manually
  const handleGoogleSignIn = () => {
    // Show loading state
    setIsLoading(true);
    setError(null);
    
    // Create a new window for Google OAuth
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    // Fix the double slash in the redirect URI
    const redirectUri = 'https://projectsection-ten.vercel.app/auth/google/callback';
    const clientId = '865917249576-o12qfisk9hpp4b10vjvdj2d1kqhunva9.apps.googleusercontent.com';
    
    // Store the action type in localStorage for the callback to use
    localStorage.setItem('google_auth_action', actionType);
    
    // Create the OAuth URL with correct parameters
    const params = {
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'email profile',
      nonce: Math.random().toString(36).substring(2, 15),
      prompt: 'select_account',
    };
    
    const url = `${googleAuthUrl}?${new URLSearchParams(params).toString()}`;
    
    // Open a new window for the Google login
    const authWindow = window.open(url, '_blank', 'width=500,height=600');
    
    if (!authWindow) {
      setIsLoading(false);
      setError("Popup blocked! Please allow popups for this site.");
      return;
    }
    
    // Listen for messages from the popup window
    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        // Call backend with the token
        handleTokenVerification(event.data.token);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler);
        setIsLoading(false);
        setError(event.data.error || "Authentication failed");
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Function to check if the window has been closed
    const checkWindowClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(checkWindowClosed);
        window.removeEventListener('message', messageHandler);
        setIsLoading(false);
        
        // Check if we can get the token from local storage (set by the callback page)
        const token = localStorage.getItem('google_token');
        if (token) {
          // Call your backend to verify the token
          handleTokenVerification(token);
          // Clear the token from localStorage after using it
          localStorage.removeItem('google_token');
        } else {
          setError("Authentication was cancelled or failed");
        }
      }
    }, 500);
  };
  
  // Function to verify Google token with backend
  const handleTokenVerification = async (token) => {
    try {
      // Get the action type from localStorage
      const action = localStorage.getItem('google_auth_action') || actionType;
      localStorage.removeItem('google_auth_action');
      
      console.log("Verifying Google token with backend");
      
      // Use direct URL to avoid path construction issues
      const url = 'https://lktool.onrender.com/auth/google/';
      console.log("Google Auth URL:", url);
      
      // Simplified fetch to avoid preflight issues
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
      console.log("Backend response:", data);
      
      if (!response.status === 200) {
        // Handle specific cases
        if (response.status === 404 && data.needs_signup) {
          setError("No account found with this email. Please sign up first.");
          return;
        } 
        
        if (response.status === 409 && data.needs_login) {
          setError("An account already exists with this email. Please log in instead.");
          return;
        }
        
        throw new Error(data.error || `Failed to authenticate (${response.status})`);
      }
      
      // Store tokens from the response
      if (data.access) {
        localStorage.setItem('token', data.access);
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
        }
        
        localStorage.setItem('userRole', data.role || 'user');
        localStorage.setItem('userEmail', data.email);
        
        // Call the onSuccess callback
        if (onSuccess) {
          onSuccess(data.is_new_user);
        }
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during Google authentication:', error);
      setError(error.message || 'Error during Google authentication');
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