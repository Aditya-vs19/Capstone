import React, { useState, useEffect } from 'react';
import { FaEdit, FaUser, FaEnvelope, FaGraduationCap, FaBuilding, FaCalendarAlt } from 'react-icons/fa';
import { profileAPI } from '../services/api';

const ProfileTab = ({ userProfile, currentUser, isOwnProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.fullName || '',
        bio: userProfile.bio || '',
        department: userProfile.department || '',
      });
      setProfilePicPreview(userProfile.profilePic || null);
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update profile data
      await profileAPI.updateProfile(userProfile._id, formData);

      // Upload profile picture if selected
      if (profilePic) {
        const formDataPic = new FormData();
        formDataPic.append('profilePic', profilePic);
        await profileAPI.uploadProfilePicture(userProfile._id, formDataPic);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userProfile) {
    return (
      <div className="profile-tab">
        <div className="loading-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-tab">
      <div className="profile-info">
        <div className="profile-header-section">
          <div className="profile-picture-container">
            <img
              src={profilePicPreview || '/default-avatar.svg'}
              alt="Profile"
              className="profile-picture"
              onError={(e) => {
                e.target.src = '/default-avatar.svg';
              }}
            />
            {isOwnProfile && isEditing && (
              <div className="profile-pic-upload">
                <input
                  type="file"
                  id="profilePic"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profilePic" className="upload-btn">
                  Change Photo
                </label>
              </div>
            )}
          </div>
          <div className="profile-basic-info">
            <h3>{userProfile.fullName}</h3>
            <p className="enrollment">Enrollment: {userProfile.enrollment}</p>
            <p className="email">{userProfile.email}</p>
            {userProfile.department && (
              <p className="department">
                <FaBuilding /> {userProfile.department} Department
              </p>
            )}
            <p className="join-date">
              <FaCalendarAlt /> Joined {formatDate(userProfile.createdAt)}
            </p>
          </div>
          {isOwnProfile && !isEditing && (
            <button 
              className="edit-profile-btn"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
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

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            {userProfile.bio && (
              <div className="bio-section">
                <h4>About</h4>
                <p>{userProfile.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
