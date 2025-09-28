import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import { FaSignOutAlt, FaArrowLeft, FaUser, FaEnvelope, FaGraduationCap, FaBuilding, FaSave, FaLock } from 'react-icons/fa';
import { profileAPI } from '../services/api';

const SettingsPage = ({ onLogout, onBackToProfile, isMobile }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    department: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getCurrentUserProfile();
        setCurrentUser(response.data.user);
        
        setProfileData({
          fullName: response.data.user.fullName || '',
          bio: response.data.user.bio || '',
          department: response.data.user.department || '',
        });
        setProfilePicPreview(response.data.user.profilePic || null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setMessage({ type: 'error', text: 'Failed to load user data' });
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      // Update profile data
      await profileAPI.updateProfile(currentUser._id, profileData);

      // Upload profile picture if selected
      if (profilePic) {
        const formData = new FormData();
        formData.append('profilePic', profilePic);
        await profileAPI.uploadProfilePicture(currentUser._id, formData);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update current user state
      const updatedResponse = await profileAPI.getCurrentUserProfile();
      setCurrentUser(updatedResponse.data.user);
      setProfilePicPreview(updatedResponse.data.user.profilePic || null);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    try {
      await profileAPI.changePassword(currentUser._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="settings-page">
        <div className="error-container">
          <p>Error loading user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-content">
        {isMobile && (
          <button className="mobile-back-btn" onClick={onBackToProfile}>
            <FaArrowLeft />
          </button>
        )}
        <h2 className="settings-title">Settings</h2>
        
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeSection === 'password' ? 'active' : ''}`}
            onClick={() => setActiveSection('password')}
          >
            <FaLock /> Change Password
          </button>
          <button 
            className={`settings-tab ${activeSection === 'account' ? 'active' : ''}`}
            onClick={() => setActiveSection('account')}
          >
            <FaEnvelope /> Account Info
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}


        {activeSection === 'password' && (
          <form className="settings-form" onSubmit={handlePasswordSave}>
            <div className="settings-section">
              <div className="settings-section-title">Change Password</div>
              
              <div className="form-group">
                <label className="settings-label">Current Password
                  <input 
                    className="settings-input" 
                    type="password" 
                    name="currentPassword" 
                    value={passwordData.currentPassword} 
                    onChange={handlePasswordInputChange} 
                    required 
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="settings-label">New Password
                  <input 
                    className="settings-input" 
                    type="password" 
                    name="newPassword" 
                    value={passwordData.newPassword} 
                    onChange={handlePasswordInputChange} 
                    required 
                    minLength="6"
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="settings-label">Confirm New Password
                  <input 
                    className="settings-input" 
                    type="password" 
                    name="confirmPassword" 
                    value={passwordData.confirmPassword} 
                    onChange={handlePasswordInputChange} 
                    required 
                    minLength="6"
                  />
                </label>
              </div>

              <button className="settings-btn" type="submit">
                <FaLock /> Change Password
              </button>
            </div>
          </form>
        )}

        {activeSection === 'account' && (
          <div className="settings-section">
            <div className="settings-section-title">Account Information</div>
            <div className="account-info">
              <div className="info-item">
                <label><FaEnvelope /> Email</label>
                <p>{currentUser.email}</p>
              </div>
              <div className="info-item">
                <label><FaGraduationCap /> Enrollment Number</label>
                <p>{currentUser.enrollment}</p>
              </div>
              <div className="info-item">
                <label><FaBuilding /> Department</label>
                <p>{currentUser.department || 'Not set'}</p>
              </div>
              <div className="info-item">
                <label>Account Status</label>
                <p className={`status ${currentUser.isVerified ? 'verified' : 'unverified'}`}>
                  {currentUser.isVerified ? 'Verified' : 'Unverified'}
                </p>
              </div>
            </div>
            
            <div className="account-actions">
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 