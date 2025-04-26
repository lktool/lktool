import { useState } from 'react';
import './CorsAlert.css';

function CorsAlert({ origin }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!origin) return null;
  
  return (
    <div className="cors-alert">
      <div className="cors-alert-header" onClick={() => setExpanded(!expanded)}>
        <h3>⚠️ Connection Issue Detected</h3>
        <button>{expanded ? 'Hide Details' : 'Show Details'}</button>
      </div>
      
      {expanded && (
        <div className="cors-alert-body">
          <p>The app is having trouble connecting to the server due to a Cross-Origin Resource Sharing (CORS) issue.</p>
          
          <h4>Technical Details:</h4>
          <p>Your app at <code>{origin}</code> cannot connect to the backend server.</p>
          
          <h4>Solutions for Administrators:</h4>
          <ol>
            <li>Update the CORS configuration on the server to allow requests from <code>{origin}</code></li>
            <li>Add the following to your Django settings:</li>
            <pre>
              {`CORS_ALLOWED_ORIGINS = [
    "${origin}",
    # ...other allowed origins
]`}
            </pre>
            <li>Ensure OPTIONS requests are properly handled by the server</li>
            <li>Verify that CORS middleware is correctly configured</li>
          </ol>
          
          <h4>For Users:</h4>
          <p>Please contact the site administrator and provide them with this error information.</p>
        </div>
      )}
    </div>
  );
}

export default CorsAlert;
