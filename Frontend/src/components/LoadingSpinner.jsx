import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  color = '#67AE6E',
  thickness = 'normal',
  textVisible = true
}) => {
  // Size presets
  const spinnerSizes = {
    xs: '16px',
    small: '24px',
    medium: '40px',
    large: '60px',
    xl: '80px'
  };
  
  // Border thickness presets
  const borderSizes = {
    thin: '2px',
    normal: '4px',
    thick: '6px'
  };
  
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div 
        className="spinner" 
        style={{ 
          width: spinnerSizes[size] || size, 
          height: spinnerSizes[size] || size,
          borderWidth: borderSizes[thickness] || thickness,
          borderTopColor: color,
          borderColor: `${color}33` // Adding transparency to other borders
        }}
      ></div>
      {textVisible && text && <p className="spinner-text">{text}</p>}
      <span className="sr-only">Loading content...</span>
    </div>
  );
};

export default LoadingSpinner;
