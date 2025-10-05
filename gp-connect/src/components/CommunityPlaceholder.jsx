import React from 'react';
import './CommunityPlaceholder.css';

export default function CommunityPlaceholder() {
  return (
    <div className="community-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">🏢</div>
        <h2>Community Feature</h2>
        <p className="placeholder-text">Community feature coming soon.</p>
        <div className="placeholder-description">
          <p>We're working on bringing you an amazing community experience where you can:</p>
          <ul>
            <li>Join interest-based communities</li>
            <li>Connect with like-minded peers</li>
            <li>Share ideas and collaborate</li>
            <li>Participate in group discussions</li>
          </ul>
          <p>Stay tuned for updates!</p>
        </div>
      </div>
    </div>
  );
}
