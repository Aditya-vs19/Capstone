import React, { useState } from 'react';
import './ForgotPasswordPage.css';
import { FaArrowLeft, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Reset form after showing success
      setTimeout(() => {
        onNavigate('login');
      }, 3000);
    }, 2000);
  };

  const handleBackToLogin = () => {
    onNavigate('login');
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-content">
            <FaCheckCircle className="success-icon" />
            <h2>Reset Link Sent!</h2>
            <p>We've sent a password reset link to:</p>
            <p className="email-display">{email}</p>
            <p className="instructions">
              Please check your email and click the link to reset your password. 
              The link will expire in 1 hour.
            </p>
            <button className="back-btn" onClick={handleBackToLogin}>
              <FaArrowLeft /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1 className="brand-gradient">GP‑ConnecX</h1>
        </div>
        
        <div className="forgot-password-card">
          <div className="forgot-password-header-section">
            
            <h2>Forgot Password</h2>
            <p>Enter your email to receive a password reset link</p>
          </div>

          <form onSubmit={handleReset} className="forgot-password-form">
            <div className="input-group">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  className={`forgot-password-input ${error ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>

            <button
              type="submit"
              className={`reset-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="forgot-password-footer">
            <p>Remember your password? 
              <span className="link-text" onClick={handleBackToLogin}>
                Back to Login
              </span>
            </p>
          </div>
        </div>

        <div className="forgot-password-info">
          <h4>Need Help?</h4>
          <ul>
            <li>Check your spam folder if you don't see the email</li>
            <li>Make sure you're using the email associated with your account</li>
            <li>Contact support if you continue to have issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
