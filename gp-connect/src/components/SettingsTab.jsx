import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaGraduationCap, FaBuilding, FaLock, FaSave, FaSignOutAlt } from 'react-icons/fa';
import { profileAPI } from '../services/api';

const SettingsTab = ({ currentUser, onLogout }) => {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        fullName: currentUser.fullName || '',
        bio: currentUser.bio || '',
        department: currentUser.department || '',
      });
      setProfilePicPreview(currentUser.profilePic || null);
    }
  }, [currentUser]);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="settings-tab">
        <div className="loading-container">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-tab">
      <div className="settings-sidebar">
        <button 
          className={`settings-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FaUser /> Profile Settings
        </button>
        <button 
          className={`settings-nav-btn ${activeSection === 'password' ? 'active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          <FaLock /> Change Password
        </button>
        <button 
          className={`settings-nav-btn ${activeSection === 'account' ? 'active' : ''}`}
          onClick={() => setActiveSection('account')}
        >
          <FaEnvelope /> Account Info
        </button>
      </div>

      <div className="settings-content">
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="settings-section">
            <h3>Profile Settings</h3>
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileInputChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={profileData.department}
                  onChange={handleProfileInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer">Computer</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Metallurgy">Metallurgy</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div className="form-group">
                <label>Profile Picture</label>
                <div className="profile-pic-section">
                  <img
                    src={profilePicPreview || '/default-avatar.svg'}
                    alt="Profile"
                    className="current-profile-pic"
                    onError={(e) => {
                      e.target.src = '/default-avatar.svg';
                    }}
                  />
                  <div>
                    <input
                      type="file"
                      id="profilePic"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profilePic" className="file-input-label">
                      Change Profile Picture
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeSection === 'password' && (
          <div className="settings-section">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  minLength="6"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                <FaLock /> {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {activeSection === 'account' && (
          <div className="settings-section">
            <h3>Account Information</h3>
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
              <button 
                onClick={onLogout}
                className="btn btn-danger"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
