import { useState, useRef } from "react";
import "./Signup.css";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import React from "react";
import { validateEmail } from "../Utils/validate";
import { Link, useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { authService } from '../api/authService';

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
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  // Enhanced client-side validation
  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(email)) {
      errors.email = "Please provide valid Email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  async function handleSubmit(event) {
    event.preventDefault();

    // Prevent multiple rapid signup attempts
    if (signupAttemptRef.current) {
      clearTimeout(signupAttemptRef.current);
    }

    // Reset errors
    setError("");

    // Client-side validation
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    // Debounce signup attempts
    signupAttemptRef.current = setTimeout(async () => {
      try {
        // Pass confirmPassword as third parameter with timeout handling
        await authService.register(email, password, confirmPassword);
        setSuccess(true); // Show verification needed message instead of redirecting
      } catch (err) {
        console.error("Registration error:", err);
        if (err.message === 'Request timeout') {
          setError("Signup request timed out. Please try again.");
        } else if (err.response?.data?.email) {
          setError(`Email error: ${err.response.data.email[0]}`);
        } else if (err.response?.data?.password) {
          setError(`Password error: ${err.response.data.password[0]}`);
        } else if (err.response?.data?.password2) {
          setError(`Confirm password error: ${err.response.data.password2[0]}`);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Unexpected error occurred. Please try again");
        }
      } finally {
        setLoading(false);
        signupAttemptRef.current = null;
      }
    }, 100); // Small timeout to prevent multiple submissions
  }

  function handleEmail(event) {
    setEmail(event.target.value);
  }
  
  function handlePassword(event) {
    setPassword(event.target.value);
  }

  function handleConfirmPassword(event) {
    setConfirmPassword(event.target.value);
  }
  
  function togglePasswordVisibility() {
    setPasswordVisible((prev) => !prev);
  }

  function toggleConfirmVisibility() {
    setConfirmVisible((prev) => !prev);
  }

  // Display immediate inline validation feedback
  const getInputClassName = (field) => {
    return validationErrors[field] ? 'input-error' : '';
  };

  // Display verification instructions if registration was successful
  if (success) {
    return (
      <div className="container1">
        <div className="inside1 verification-message">
          <h1>Registration Successful!</h1>
          <p>A verification link has been sent to your email.</p>
          <p>Please check your inbox and click the link to verify your account.</p>
          <p>If you don't receive the email within a few minutes, check your spam folder.</p>
          <div className="verification-actions">
            <button 
              onClick={() => authService.resendVerification(email)}
              className="resend-btn"
            >
              Resend Verification Email
            </button>
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
                className={getInputClassName('email')}
              />
              {validationErrors.email && <p className="error-message">{validationErrors.email}</p>}
            </div>
            <div className="input-password">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Create password"
                onChange={handlePassword}
                value={password}
                className={getInputClassName('password')}
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
              {validationErrors.password && <p className="error-message">{validationErrors.password}</p>}
            </div>
            <div className="input-password">
              <input
                type={confirmVisible ? "text" : "password"}
                placeholder="Confirm password"
                onChange={handleConfirmPassword}
                value={confirmPassword}
                className={getInputClassName('confirmPassword')}
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
              {validationErrors.confirmPassword && <p className="error-message">{validationErrors.confirmPassword}</p>}
            </div>
            <p className="error-message">{error}</p>
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
