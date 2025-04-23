import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../api/apiConfig';

function CorsTest() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testEndpoint = '/api/auth/user/';

  const runTest = async () => {
    setStatus('loading');
    try {
      // First test with a simple OPTIONS request
      const optionsResult = await axios({
        method: 'OPTIONS',
        url: getApiUrl(testEndpoint),
      });
      
      setResult(prev => ({
        ...prev,
        options: {
          status: optionsResult.status,
          headers: optionsResult.headers,
        }
      }));
      
      // Then try a GET request
      const getResult = await axios.get(getApiUrl(testEndpoint), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      setResult(prev => ({
        ...prev,
        get: {
          status: getResult.status,
          headers: getResult.headers,
        }
      }));
      
      setStatus('success');
    } catch (err) {
      console.error('CORS Test Error:', err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setStatus('error');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto', 
      fontFamily: 'monospace' 
    }}>
      <h2>CORS Diagnostic Tool</h2>
      
      <div>
        <h3>Environment Info</h3>
        <p>Current origin: <strong>{window.location.origin}</strong></p>
        <p>Testing against: <strong>{getApiUrl(testEndpoint)}</strong></p>
      </div>
      
      <button 
        onClick={runTest} 
        disabled={status === 'loading'}
        style={{
          padding: '10px 20px',
          background: '#67AE6E',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: status === 'loading' ? 'wait' : 'pointer',
          marginTop: '15px'
        }}
      >
        {status === 'loading' ? 'Testing...' : 'Run CORS Test'}
      </button>
      
      {status === 'error' && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '15px', 
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <h3>Error</h3>
          <p><strong>Message:</strong> {error.message}</p>
          {error.status && <p><strong>Status:</strong> {error.status}</p>}
          {error.response && (
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(error.response, null, 2)}
            </pre>
          )}
          <p>
            This error suggests a CORS misconfiguration. Make sure your backend 
            has the correct CORS headers to allow requests from this origin.
          </p>
        </div>
      )}
      
      {status === 'success' && (
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '15px', 
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          <h3>Success!</h3>
          <p>CORS is properly configured!</p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default CorsTest;
