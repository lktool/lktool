import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const spinnerSizes = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };
  
  return (
    <div className="spinner-container">
      <div 
        className="spinner" 
        style={{ 
          width: spinnerSizes[size], 
          height: spinnerSizes[size] 
        }}
      ></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
