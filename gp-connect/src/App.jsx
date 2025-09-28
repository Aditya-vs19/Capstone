import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import OtpVerificationPage from './components/OtpVerificationPage';
import HomePage from './components/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token is valid by making a test API call
      const verifyToken = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/profile/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            setIsLoggedIn(true);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        } finally {
          setIsLoading(false);
        }
      };
      
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const handleRegisterSuccess = (email) => {
    setUserEmail(email);
    setShowOtpVerification(true);
    setShowRegister(false);
  };

  const handleOtpVerificationSuccess = () => {
    setIsLoggedIn(true);
    setShowOtpVerification(false);
  };

  const handleBackToRegister = () => {
    setShowOtpVerification(false);
    setShowRegister(true);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #333',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <HomePage onLogout={handleLogout} />
      ) : showOtpVerification ? (
        <OtpVerificationPage
          email={userEmail}
          onVerificationSuccess={handleOtpVerificationSuccess}
          onBackToRegister={handleBackToRegister}
        />
      ) : showForgotPassword ? (
        <ForgotPasswordPage
          onNavigate={(page) => {
            if (page === 'login') {
              setShowForgotPassword(false);
              setShowRegister(false);
            }
          }}
        />
      ) : showRegister ? (
        <RegistrationPage
          onRegister={handleRegisterSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <LoginPage
          onLogin={() => setIsLoggedIn(true)}
          onSwitchToRegister={() => setShowRegister(true)}
          onSwitchToForgotPassword={() => setShowForgotPassword(true)}
        />
      )}
    </>
  );
}

export default App;
