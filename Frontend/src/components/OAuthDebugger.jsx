import { useState } from 'react';
import { oauthConfig } from '../config/oauthConfig';

/**
 * A development component to debug OAuth issues
 * Remove or hide this in production
 */
function OAuthDebugger() {
  const [showDebug, setShowDebug] = useState(false);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const redirectInfo = oauthConfig.google.getRedirectInfo();

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#f0f0f0',
      border: '1px solid #ccc',
      padding: '10px',
      borderRadius: '5px',
      maxWidth: '400px',
      zIndex: 9999
    }}>
      <button onClick={() => setShowDebug(!showDebug)}>
        {showDebug ? 'Hide' : 'Show'} OAuth Debug Info
      </button>
      
      {showDebug && (
        <div style={{ fontSize: '12px', marginTop: '10px' }}>
          <h4>OAuth Configuration</h4>
          <p><strong>Configured Redirect URI:</strong><br/>{redirectInfo.configuredUri}</p>
          <p><strong>Current Host:</strong><br/>{redirectInfo.currentHost}</p>
          <p><strong>Full Redirect Path:</strong><br/>{redirectInfo.fullPath}</p>
          
          <h4>Steps to Fix Redirect URI Mismatch:</h4>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Select your project</li>
            <li>Find and edit your OAuth 2.0 Client ID</li>
            <li>Add this exact URI to the authorized redirect URIs:</li>
            <li><code>{redirectInfo.configuredUri}</code></li>
            <li>Save the changes</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default OAuthDebugger;
