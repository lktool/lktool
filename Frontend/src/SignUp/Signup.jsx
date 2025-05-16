import { useState, useRef } from "react";
import "./Signup.css";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail } from "react-icons/ai";
import React from "react";
import { validateEmail } from "../Utils/validate";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
// Update import to use the new API structure
import { authService } from '../api';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const signupAttemptRef = useRef(null); // For debouncing signup attempts
  const [formErrors, setFormErrors] = useState([]); // Collect all errors in a single array
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);

  const navigate = useNavigate();

  // Modified validation to collect all errors in one array
  const validateForm = () => {
    const errors = [];

    // Email validation
    if (!email.trim()) {
      errors.push("Email is required");
    } else if (!validateEmail(email)) {
      errors.push("Please provide valid Email address");
    }

    // Password validation
    if (!password) {
      errors.push("Password is required");
    } else if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.push("Please confirm your password");
    } else if (password !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  function handleEmail(event) {
    setEmail(event.target.value);
    setError(null);
    setFormErrors([]);
  }
  
  function handlePassword(event) {
    setPassword(event.target.value);
    setError(null);
    setFormErrors([]);
  }

  function handleConfirmPassword(event) {
    setConfirmPassword(event.target.value);
    setError(null);
    setFormErrors([]);
  }
  
  function togglePasswordVisibility() {
    setPasswordVisible((prev) => !prev);
  }

  function toggleConfirmVisibility() {
    setConfirmVisible((prev) => !prev);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent multiple rapid signup attempts
    if (signupAttemptRef.current) {
      clearTimeout(signupAttemptRef.current);
    }

    // Reset errors
    setError("");
    setFormErrors([]);

    // Client-side validation
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    // Debounce signup attempts
    signupAttemptRef.current = setTimeout(async () => {
      try {
        // Use authService for registration
        const response = await authService.register(email, password, confirmPassword);
        
        if (response.success) {
          setSuccess(true); // Show verification needed message
          
          // If verification was resent to an existing account, show confirmation
          if (response.resendVerification) {
            setResendSuccess(true);
          }
        } else {
          setError(response.error || "Registration failed. Please try again.");
        }
      } catch (err) {
        console.error("Registration error:", err);
        if (err.message === 'Request timeout') {
          setError("Signup request timed out. Please try again.");
        } else if (err.response?.data) {
          // Create a readable error message from the response data
          let errorMessage = "";
          
          if (typeof err.response.data === 'object') {
            // Handle field-specific errors
            Object.entries(err.response.data).forEach(([field, messages]) => {
              if (Array.isArray(messages)) {
                errorMessage += `${field}: ${messages[0]} `;
              } else if (typeof messages === 'string') {
                errorMessage += `${field}: ${messages} `;
              }
            });
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
          
          setError(errorMessage || "Registration failed with validation errors");
        } else {
          setError("Unexpected error occurred. Please try again");
        }
      } finally {
        setLoading(false);
        signupAttemptRef.current = null;
      }
    }, 100); // Small timeout to prevent multiple submissions
  }

  const handleResendVerification = async () => {
    try {
      setResendLoading(true);
      setResendError(null);
      // Use the correct resendVerification method
      const response = await authService.resendVerification(email);
      
      if (response.success) {
        setResendSuccess(true);
      } else {
        setResendError(response.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setResendError('An unexpected error occurred');
    } finally {
      setResendLoading(false);
    }
  };

  // Display verification instructions if registration was successful
  if (success) {
    return (
      <div className="container1">
        <div className="verification-message">
          <div className="email-icon">
            <AiOutlineMail />
          </div>
          <h1>Verify Your Email</h1>
          <p>We've sent a verification link to:</p>
          <p><span className="email-highlight">{email}</span></p>
          {resendSuccess ? (
            <div className="resent-notice">
              <p>This email was already registered but not verified.</p>
              <p>We've sent a new verification link to your email address.</p>
            </div>
          ) : (
            <p><strong>Check your inbox</strong> and click the link to complete your registration.</p>
          )}
          <p>Don't see it? Check your spam folder or request a new link.</p>
          <div className="verification-actions">
            <button 
              onClick={handleResendVerification}
              className="resend-btn"
              disabled={resendLoading}
            >
              {resendLoading ? "Resending..." : "Resend Email"}
            </button>
            {resendSuccess && <p className="success-message">Verification email resent!</p>}
            {resendError && <p className="error-message">{resendError}</p>}
            <Link to="/login" className="login-link">Go to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container1">
        <div className="inside1">
          <form onSubmit={handleSubmit}>
            <h1 className="signup">Signup</h1>
            <div className="input-email">
              <input
                type="email"
                placeholder="Email"
                onChange={handleEmail}
                value={email}
              />
            </div>
            <div className="input-password">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Create password"
                onChange={handlePassword}
                value={password}
              />
              {passwordVisible ? (
                <AiOutlineEye
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>
            <div className="input-password">
              <input
                type={confirmVisible ? "text" : "password"}
                placeholder="Confirm password"
                onChange={handleConfirmPassword}
                value={confirmPassword}
              />
              {confirmVisible ? (
                <AiOutlineEye
                  className="eye-icon"
                  onClick={toggleConfirmVisibility}
                />
              ) : (
                <AiOutlineEyeInvisible
                  className="eye-icon"
                  onClick={toggleConfirmVisibility}
                />
              )}
            </div>
            
            {/* Modified: Display only one error message at a time */}
            {(formErrors.length > 0 || error) && (
              
                <p className="error-message">
                  {formErrors.length > 0 ? formErrors[0] : error}
                </p>
              
            )}

            <button className="signup-btn" type="submit" disabled={loading}>
              {loading ? "Signing up..." : "Signup"}
            </button>
            
            <div className="or-divider">
              <span>OR</span>
            </div>
            
            <GoogleLoginButton onSuccess={() => navigate("/inputMain")} actionType="signup" />
            
            <p>
              Already have an account?
              <span>
                <Link to="/login">Login</Link>
              </span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default Signup;
