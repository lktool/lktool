import React from 'react';
import './FormElements.css';

/**
 * A flexible input field component
 */
export const FormInput = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
  error,
  required = false,
  className = '',
  ...rest
}) => {
  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id || name}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="form-input"
        required={required}
        {...rest}
      />
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

/**
 * A flexible textarea component
 */
export const FormTextarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  label,
  rows = 5,
  disabled = false,
  error,
  required = false,
  className = '',
  ...rest
}) => {
  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id || name}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="form-textarea"
        required={required}
        {...rest}
      />
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

/**
 * A flexible select dropdown component
 */
export const FormSelect = ({
  id,
  name,
  value,
  onChange,
  options,
  label,
  disabled = false,
  error,
  required = false,
  className = '',
  ...rest
}) => {
  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id || name}>
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="form-select"
        required={required}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="input-error">{error}</div>}
    </div>
  );
};

/**
 * A button component that shows loading state
 */
export const SubmitButton = ({
  children,
  isLoading = false,
  loadingText = 'Submitting...',
  type = 'submit',
  disabled = false,
  className = '',
  onClick,
  ...rest
}) => {
  return (
    <button
      type={type}
      className={`submit-button ${isLoading ? 'loading' : ''} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <span className="button-spinner-container">
          <span className="button-spinner"></span>
          <span className="button-text">{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * A component for displaying form errors or success messages
 */
export const FormMessage = ({ 
  type = 'info', 
  children,
  className = ''
}) => {
  return (
    <div className={`form-message ${type}-message ${className}`}>
      {children}
    </div>
  );
};

export default {
  FormInput,
  FormTextarea,
  FormSelect,
  SubmitButton,
  FormMessage
};
