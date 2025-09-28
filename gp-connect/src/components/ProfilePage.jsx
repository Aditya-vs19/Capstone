import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaCog, FaArrowLeft, FaEnvelope, FaGraduationCap, FaBuilding, FaCalendarAlt, FaSave, FaTimes } from 'react-icons/fa';
import { profileAPI, postsAPI } from '../services/api';
import './ProfilePage.css';

const ProfilePage = ({ userProfile, onBackToHome, onNavigateToSettings, isMobile }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    department: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalFollowers: 0,
    totalFollowing: 0
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await profileAPI.getCurrentUserProfile();
        setCurrentUser(response.data.user);
        setUserPosts(response.data.posts);
        setUserStats(response.data.user.stats || { totalPosts: 0, totalFollowers: 0, totalFollowing: 0 });
        
        // Set form data for editing
        setFormData({
          fullName: response.data.user.fullName || '',
          bio: response.data.user.bio || '',
          department: response.data.user.department || '',
        });
        setProfilePicPreview(response.data.user.profilePic ? `http://localhost:5000${response.data.user.profilePic}` : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const isOwnProfile = !userProfile || (currentUser && currentUser._id === userProfile._id);
  const displayUser = userProfile || currentUser;

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
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Update profile data
      await profileAPI.updateProfile(currentUser._id, formData);

      // Upload profile picture if selected
      if (profilePic) {
        const formDataPic = new FormData();
        formDataPic.append('profilePic', profilePic);
        await profileAPI.uploadProfilePicture(currentUser._id, formDataPic);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      
      // Update current user state without reloading
      const updatedResponse = await profileAPI.getCurrentUserProfile();
      setCurrentUser(updatedResponse.data.user);
      setUserPosts(updatedResponse.data.posts);
      setUserStats(updatedResponse.data.user.stats || { totalPosts: 0, totalFollowers: 0, totalFollowing: 0 });
      
      // Update profile picture preview with the new URL
      if (updatedResponse.data.user.profilePic) {
        setProfilePicPreview(`http://localhost:5000${updatedResponse.data.user.profilePic}`);
      } else {
        setProfilePicPreview(null);
      }
      
      // Update form data with new values
      setFormData({
        fullName: updatedResponse.data.user.fullName || '',
        bio: updatedResponse.data.user.bio || '',
        department: updatedResponse.data.user.department || '',
      });
      
      // Clear the selected file
      setProfilePic(null);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={onBackToHome} className="btn btn-primary">
            <FaArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-header">
          {isMobile && (
            <button className="mobile-back-btn" onClick={onBackToHome}>
              <FaArrowLeft />
            </button>
          )}
          <h2 className="profile-title">
            {isOwnProfile ? 'My Profile' : `${displayUser?.fullName || 'User'}'s Profile`}
          </h2>
        </div>

        <div className="profile-info">
          <div className="profile-header-section">
            <div className="profile-picture-container">
              <img
                src={profilePicPreview || (displayUser?.profilePic ? `http://localhost:5000${displayUser.profilePic}` : '/default-avatar.svg')}
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
              <h3>{displayUser?.fullName}</h3>
              <p className="enrollment">Enrollment: {displayUser?.enrollment}</p>
              <p className="email">{displayUser?.email}</p>
              {displayUser?.department && (
                <p className="department">
                  <FaBuilding /> {displayUser.department} Department
                </p>
              )}
              <p className="join-date">
                <FaCalendarAlt /> Joined {formatDate(displayUser?.createdAt)}
              </p>
              
              {/* User Stats */}
              <div className="user-stats">
                <div className="stat-item">
                  <span className="stat-number">{userStats.totalPosts}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.totalFollowers}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{userStats.totalFollowing}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
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
                  <option value="Meta">Meta</option>
                </select>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  <FaTimes /> Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-details">
              {displayUser?.bio && (
                <div className="bio-section">
                  <h4>About</h4>
                  <p>{displayUser.bio}</p>
                </div>
              )}
            </div>
          )}

          {/* Posts Section */}
          <div className="posts-section">
            <h4>{isOwnProfile ? 'My Posts' : `${displayUser?.fullName}'s Posts`}</h4>
            {userPosts.length === 0 ? (
              <div className="no-posts">
                <p>No posts yet.</p>
              </div>
            ) : (
              <div className="posts-list">
                {userPosts.map(post => (
                  <div key={post._id} className="post-item">
                    <div className="post-header">
                      <div className="post-user-info">
                        <img
                          src={post.userId.profilePic ? `http://localhost:5000${post.userId.profilePic}` : '/default-avatar.svg'}
                          alt="Profile"
                          className="post-user-avatar"
                          onError={(e) => {
                            e.target.src = '/default-avatar.svg';
                          }}
                        />
                        <div>
                          <h5>{post.userId.fullName}</h5>
                          <p className="post-time">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="post-content">
                      <p>{post.caption}</p>
                      {post.image && (
                        <div className="post-image">
                          <img 
                            src={`http://localhost:5000${post.image}`} 
                            alt="Post" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;