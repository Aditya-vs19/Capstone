import React, { useState, useEffect } from 'react';
import Feed from './Feed';
import MessagePanel from './MessagePanel';
import ProfilePage from './ProfilePage';
import NotificationPage from './NotificationPage';
import CommunitiesPage from './CommunitiesPage';
import SettingsPage from './SettingsPage';
import CreatePage from './CreatePage';
import './HomePage.css';
import { FaHome, FaBell, FaEnvelope, FaUser, FaCog, FaSignOutAlt, FaSearch, FaUsers, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { profileAPI } from '../services/api';

export default function HomePage({ onLogout }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [viewingUserProfile, setViewingUserProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await profileAPI.getCurrentUserProfile();
        setCurrentUser(response.data.user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleNavigateToProfile = (userProfileData) => {
    setViewingUserProfile(userProfileData);
    setActiveTab('profile');
  };

  const handleBackToHome = () => {
    setViewingUserProfile(null);
    setActiveTab('home');
  };

  const handleNavigateToMyProfile = () => {
    setViewingUserProfile(null);
    setActiveTab('profile');
  };

  // Search component for mobile
  const SearchComponent = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const handleSearch = (e) => {
      e.preventDefault();
      if (localSearchTerm.trim()) {
        // Simulate search results
        const dummyResults = [
          { id: 1, name: 'John Doe', username: 'johndoe', avatar: 'J' },
          { id: 2, name: 'Jane Smith', username: 'janesmith', avatar: 'J' },
          { id: 3, name: 'Mike Johnson', username: 'mikejohnson', avatar: 'M' },
        ].filter(user => 
          user.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(localSearchTerm.toLowerCase())
        );
        setSearchResults(dummyResults);
      }
    };

    return (
      <div className="search-page">
        <div className="search-header">
          <button className="mobile-back-btn" onClick={() => setActiveTab('home')}>
            <FaArrowLeft />
          </button>
          <h2>Search</h2>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search users..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="search-button">
            Search
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h3>Results</h3>
            {searchResults.map(user => (
              <div key={user.id} className="search-result-item">
                <div className="user-avatar">{user.avatar}</div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-username">@{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {localSearchTerm && searchResults.length === 0 && (
          <div className="no-results">
            <p>No users found for "{localSearchTerm}"</p>
          </div>
        )}
      </div>
    );
  };

  // Footer nav for mobile
  const MobileFooter = () => (
    <footer className="mobile-footer-nav">
      <button className={`footer-tab${activeTab === 'home' ? ' active' : ''}`} onClick={() => setActiveTab('home')}><FaHome /></button>
      <button className={`footer-tab${activeTab === 'communities' ? ' active' : ''}`} onClick={() => setActiveTab('communities')}><FaUsers /></button>
      <button className={`footer-tab${activeTab === 'create' ? ' active' : ''}`} onClick={() => setActiveTab('create')}><FaPlus /></button>
      <button className="footer-tab search-tab" onClick={() => setActiveTab('search')}><FaSearch /></button>
      <button className={`footer-tab${activeTab === 'profile' ? ' active' : ''}`} onClick={handleNavigateToMyProfile}><FaUser /></button>
    </footer>
  );

  return (
    <div className="home">
      <header className={`navbar-glass${isMobile ? ' mobile-header' : ''}`}> 
        <div className="left-section">
          <h1 className="brand-gradient">GP‑ConnecX</h1>
        </div>
        <div className="center-section">
          <div className="search-bar-wrapper">
       
            <input
              type="text"
              className="search-bar"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="right-section nav-actions">
          <button className="icon-btn" onClick={() => setActiveTab('notifications')} title="Notifications">
            <FaBell />
          </button>
          <button className="icon-btn" onClick={() => setShowMessages(true)} title="Messages">
            <FaEnvelope />
          </button>
        </div>
      </header>
      <div className="layout">
        {!isMobile && (
          <aside className="sidebar">
            <nav className="sidebar-nav">
              <button className={`sidebar-tab${activeTab === 'home' ? ' active' : ''}`} onClick={() => setActiveTab('home')}>
                <FaHome className="sidebar-icon" /> <span>Home</span>
              </button>
              <button className={`sidebar-tab${activeTab === 'communities' ? ' active' : ''}`} onClick={() => setActiveTab('communities')}>
                <FaUsers className="sidebar-icon" /> <span>Communities</span>
              </button>
              <button className={`sidebar-tab${activeTab === 'messages' ? ' active' : ''}`} onClick={() => setShowMessages(true)}>
                <FaEnvelope className="sidebar-icon" /> <span>Messages</span>
              </button>
              <button className={`sidebar-tab${activeTab === 'create' ? ' active' : ''}`} onClick={() => setActiveTab('create')}>
                <FaPlus className="sidebar-icon" /> <span>Create</span>
              </button>
              <button className={`sidebar-tab${activeTab === 'profile' ? ' active' : ''}`} onClick={handleNavigateToMyProfile}>
                <FaUser className="sidebar-icon" /> <span>Profile</span>
              </button>
              <button className={`sidebar-tab${activeTab === 'settings' ? ' active' : ''}`} onClick={() => setActiveTab('settings')}>
                <FaCog className="sidebar-icon" /> <span>Settings</span>
              </button>
            </nav>
          </aside>
        )}
        <div className={`feed-col`}>
          {activeTab === 'home' && <Feed onNavigateToProfile={handleNavigateToProfile} />}
          {activeTab === 'profile' && !showSettings && (
            <ProfilePage 
              userProfile={viewingUserProfile} 
              onBackToHome={handleBackToHome} 
              onNavigateToSettings={() => setShowSettings(true)}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'profile' && showSettings && (
            <SettingsPage 
              onLogout={onLogout}
              onBackToProfile={() => setShowSettings(false)}
              isMobile={isMobile}
            />
          )}
          {activeTab === 'notifications' && <NotificationPage />}
          {activeTab === 'communities' && <CommunitiesPage />}
          {activeTab === 'create' && <CreatePage />}
          {activeTab === 'search' && <SearchComponent />}
          {activeTab === 'settings' && !isMobile && <SettingsPage onLogout={onLogout} />}
          {/* Add more tab content here later */}
        </div>
        {/* Overlay for messages */}
        {showMessages && (
          <div className={`messages-overlay${isMobile ? ' mobile' : ''}`}>
            <button className="close-messages-btn" onClick={() => setShowMessages(false)} title="Close">&times;</button>
            <MessagePanel />
          </div>
        )}
      </div>
      {isMobile && <MobileFooter />}
    </div>
  );
}
