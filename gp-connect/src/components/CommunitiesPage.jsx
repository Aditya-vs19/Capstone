import React, { useState } from 'react';
import './CommunitiesPage.css';

const dummyCommunities = [
  {
    id: 1,
    name: 'Civil Crew',
    description: 'Civil Engineering community for projects, knowledge sharing, and industry connections.',
    avatar: '🏗️',
    members: 342,
    joined: false
  },
  {
    id: 2,
    name: 'Spark Squad',
    description: 'Electrical Engineering enthusiasts discussing circuits, power systems, and innovations.',
    avatar: '⚡',
    members: 287,
    joined: false
  },
  {
    id: 3,
    name: 'Signal Masters',
    description: 'Electronics & Telecommunication community for communication systems and tech projects.',
    avatar: '📡',
    members: 198,
    joined: false
  },
  {
    id: 4,
    name: 'Mech Warriors',
    description: 'Mechanical Engineering students sharing design, manufacturing, and robotics insights.',
    avatar: '⚙️',
    members: 423,
    joined: false
  },
  {
    id: 5,
    name: 'Code Crafters',
    description: 'Computer Engineering community for software development and hardware integration.',
    avatar: '💻',
    members: 512,
    joined: false
  },
  {
    id: 6,
    name: 'Tech Titans',
    description: 'IT community focused on web development, data science, and emerging technologies.',
    avatar: '🚀',
    members: 389,
    joined: false
  },
  {
    id: 7,
    name: 'Metal Masters',
    description: 'Metallurgy Engineering community for materials science and industrial applications.',
    avatar: '🔧',
    members: 156,
    joined: false
  }
];

const dummyMembers = [
  { id: 1, name: 'Rahul Kumar', avatar: 'RK', online: true },
  { id: 2, name: 'Priya Sharma', avatar: 'PS', online: false },
  { id: 3, name: 'Amit Patel', avatar: 'AP', online: true },
  { id: 4, name: 'Neha Singh', avatar: 'NS', online: true },
  { id: 5, name: 'Vikram Mehta', avatar: 'VM', online: false }
];

const dummyMessages = [
  { id: 1, user: 'Rahul Kumar', text: 'Anyone working on the bridge design project?', time: '2:30 PM' },
  { id: 2, user: 'Priya Sharma', text: 'Yes! I need help with the calculations', time: '2:32 PM' },
  { id: 3, user: 'Amit Patel', text: 'I can help with that. Let\'s meet tomorrow', time: '2:35 PM' }
];

export default function CommunitiesPage() {
  const [joined, setJoined] = useState({});
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [message, setMessage] = useState('');

  const handleToggle = (communityId) => {
    setJoined(prev => ({
      ...prev,
      [communityId]: !prev[communityId]
    }));
  };

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Backend will handle this
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  const handleBack = () => {
    setSelectedCommunity(null);
  };

  if (selectedCommunity) {
    return (
      <div className="communities-page">
        <div className="communities-content">
          <div className="community-header">
            <button className="back-btn" onClick={handleBack}>← Back</button>
            <div className="community-info">
              <span className="community-emoji">{selectedCommunity.avatar}</span>
              <div>
                <h2>{selectedCommunity.name}</h2>
                <p>{selectedCommunity.members} members</p>
              </div>
            </div>
          </div>
          
          <div className="community-chat">
            <div className="chat-messages">
              {dummyMessages.map(msg => (
                <div key={msg.id} className="message">
                  <strong>{msg.user}:</strong> {msg.text}
                  <span className="message-time">{msg.time}</span>
                </div>
              ))}
            </div>
            
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </div>

          <div className="members-list">
            <h3>Members</h3>
            {dummyMembers.map(member => (
              <div key={member.id} className="member">
                <div className={`member-avatar ${member.online ? 'online' : ''}`}>
                  {member.avatar}
                </div>
                <span>{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="communities-page">
      <div className="communities-content">
        <h2 className="communities-title">Engineering Communities</h2>
        <div className="communities-list">
          {dummyCommunities.map((community) => (
            <div key={community.id} className="community-item" onClick={() => handleCommunityClick(community)}>
              <div className="community-avatar">
                <span className="community-emoji">{community.avatar}</span>
              </div>
              <div className="community-content">
                <div className="community-name">{community.name}</div>
                <div className="community-desc">{community.description}</div>
                <div className="community-members">{community.members} members</div>
              </div>
              <button 
                className={`community-btn${joined[community.id] ? ' leave' : ''}`} 
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(community.id);
                }}
              >
                {joined[community.id] ? 'Leave' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 