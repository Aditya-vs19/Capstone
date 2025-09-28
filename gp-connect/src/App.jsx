import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import OtpVerificationPage from './components/OtpVerificationPage';
import HomePage from './components/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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

  return (
    <>
      {isLoggedIn ? (
        <HomePage onLogout={() => setIsLoggedIn(false)} />
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
