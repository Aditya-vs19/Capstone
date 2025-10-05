import React, { useState, useEffect } from 'react';
import './CommunitiesPage.css';
import { communitiesAPI } from '../services/api.js';
import socketService from '../services/socket.js';

// Single community - GP-Connect Community
const GENERAL_COMMUNITY_ID = '68dd52a283642af8c35205cc'; // From seed script

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [joiningCommunity, setJoiningCommunity] = useState(null);
  const messagesEndRef = React.useRef(null);

  // Load communities on component mount
  useEffect(() => {
    loadCommunities();
    loadCurrentUser();
  }, []);

  // No need for additional useEffect - state updates handle everything

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Set up socket listeners when community is selected
  useEffect(() => {
    if (selectedCommunity) {
      try {
        socketService.joinRoom(selectedCommunity._id);
        socketService.onNewMessage(handleNewMessage);
        socketService.onMemberUpdate(handleMemberUpdate);
        loadMessages(selectedCommunity._id);
      } catch (error) {
        console.error('Error setting up socket connection:', error);
        // Still load messages even if socket fails
        loadMessages(selectedCommunity._id);
      }
    }

    return () => {
      if (selectedCommunity) {
        try {
          socketService.leaveRoom(selectedCommunity._id);
          socketService.offNewMessage(handleNewMessage);
          socketService.offMemberUpdate(handleMemberUpdate);
        } catch (error) {
          console.error('Error cleaning up socket connection:', error);
        }
      }
    };
  }, [selectedCommunity]);

  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          console.log('Current user loaded:', userData);
        } else {
          console.error('Failed to load user:', response.status);
        }
      } else {
        console.error('No token found');
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const loadCommunities = async () => {
    try {
      console.log('Loading communities...');
      setLoading(true);
      const response = await communitiesAPI.getCommunities();
      console.log('Communities response:', response.data);
      // Filter to only show the general community
      const generalCommunity = response.data.find(c => c._id === GENERAL_COMMUNITY_ID);
      if (generalCommunity) {
        console.log('Found general community:', generalCommunity);
        // Ensure members are populated with user data
        if (generalCommunity.members && generalCommunity.members.length > 0) {
          // If members are just IDs, we need to populate them
          const populatedCommunity = await communitiesAPI.getCommunity(generalCommunity._id);
          setCommunities([populatedCommunity.data]);
        } else {
          setCommunities([generalCommunity]);
        }
      } else {
        console.error('General community not found');
        setError('General community not found. Please run the seed script.');
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (communityId) => {
    try {
      setLoadingMessages(true);
      const response = await communitiesAPI.getCommunityMessages(communityId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Removed refreshCommunityData - not needed with proper state management

  const handleToggle = async (community) => {
    if (!currentUser) {
      alert('Please wait while we load your profile...');
      return;
    }
    
    // Prevent multiple clicks
    if (joiningCommunity === community._id) {
      return;
    }
    
    try {
      setJoiningCommunity(community._id);
      console.log('Joining/leaving community:', community._id, 'Current user:', currentUser._id);
      
      const response = await communitiesAPI.joinCommunity(community._id);
      console.log('Join/leave response:', response.data);
      
      // Update local state immediately with server response
      setCommunities(prev => prev.map(c => 
        c._id === community._id 
          ? { 
              ...c, 
              members: response.data.members,
              // Ensure we have the updated member count
              ...(response.data.membersCount && { memberCount: response.data.membersCount })
            }
          : c
      ));
      
      console.log('Updated communities state:', response.data.joined ? 'joined' : 'left');
      console.log('New members array:', response.data.members);
      console.log('Current user ID:', currentUser._id);
      console.log('Is user in members?', response.data.members.includes(currentUser._id));
      
    } catch (error) {
      console.error('Error toggling community membership:', error);
      alert('Error joining/leaving community. Please try again.');
    } finally {
      setJoiningCommunity(null);
    }
  };

  const handleOpenChat = (community) => {
    if (!currentUser) {
      alert('Please wait while we load your profile...');
      return;
    }
    setSelectedCommunity(community);
  };

  const handleSendMessage = async () => {
    if (message.trim() && selectedCommunity && currentUser) {
      try {
        setSendingMessage(true);
        const messageText = message.trim();
        setMessage(''); // Clear input immediately
        
        // Don't add to local state - let Socket.IO handle it to avoid duplication
        const response = await communitiesAPI.sendMessage(selectedCommunity._id, messageText);
        
        // The message will be received via Socket.IO, so no need to add it locally
        console.log('Message sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
        // Restore message on error
        setMessage(messageText);
      } finally {
        setSendingMessage(false);
      }
    }
  };

  const handleNewMessage = (newMessage) => {
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMemberUpdate = (data) => {
    const { membersCount, members } = data;
    setCommunities(prev => prev.map(c => 
      c._id === selectedCommunity?._id 
        ? { ...c, members: members }
        : c
    ));
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Auto-scroll when component mounts or messages load
  useEffect(() => {
    if (messagesEndRef.current && !loadingMessages) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [loadingMessages, selectedCommunity]);

  const handleBack = () => {
    setSelectedCommunity(null);
    setMessages([]);
  };

  const isMember = (community) => {
    if (!currentUser || !community.members) {
      return false;
    }
    
    // Handle empty members array
    if (community.members.length === 0) {
      return false;
    }
    
    const isAMember = community.members.some(member => {
      // Handle both populated user objects and user IDs
      const memberId = typeof member === 'object' ? member._id : member;
      return memberId === currentUser._id;
    });
    
    return isAMember;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                <p>{selectedCommunity.members.length} members</p>
              </div>
            </div>
          </div>
          
          <div className="chat-container">
            <div className="community-chat">
              <div className="chat-header">
                <div className="chat-title">
                  <span className="community-emoji">{selectedCommunity.avatar}</span>
                  <div>
                    <h3>{selectedCommunity.name}</h3>
                    <p>{selectedCommunity.members?.length || 0} members</p>
                  </div>
                </div>
              </div>
              
              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="loading-messages">
                    <div className="loading-spinner"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="no-messages">
                    <div className="welcome-icon">💬</div>
                    <h4>Welcome to {selectedCommunity.name}!</h4>
                    <p>Start the conversation by sending a message below.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = msg.sender?._id === currentUser?._id;
                    const showAvatar = index === 0 || messages[index - 1].sender?._id !== msg.sender?._id;
                    
                    return (
                      <div key={msg._id || index} className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                        {!isOwnMessage && showAvatar && (
                          <div className="message-avatar">
                            {msg.sender?.profilePic ? (
                              <img src={msg.sender.profilePic} alt={msg.sender.fullName} />
                            ) : (
                              <span>{msg.sender?.fullName?.charAt(0) || '?'}</span>
                            )}
                          </div>
                        )}
                        {!isOwnMessage && !showAvatar && <div className="message-spacer"></div>}
                        
                        <div className="message-bubble">
                          {!isOwnMessage && showAvatar && (
                            <div className="message-sender">{msg.sender?.fullName || 'Unknown User'}</div>
                          )}
                          <div className="message-content">
                            <div className="message-text">{msg.text}</div>
                            <div className="message-time">{formatTime(msg.createdAt)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="chat-input-container">
                <div className="chat-input">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={sendingMessage}
                    className="message-input"
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={sendingMessage || !message.trim()}
                    className="send-button"
                  >
                    {sendingMessage ? (
                      <div className="sending-spinner"></div>
                    ) : (
                      <span>Send</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="members-sidebar">
              <div className="members-header">
                <h3>Members ({selectedCommunity.members?.length || 0})</h3>
              </div>
              
              <div className="members-list">
                {!selectedCommunity.members || selectedCommunity.members.length === 0 ? (
                  <div className="no-members">
                    <p>No members yet</p>
                  </div>
                ) : (
                  selectedCommunity.members.map(member => {
                    // Handle both populated user objects and user IDs
                    const memberId = typeof member === 'object' ? member._id : member;
                    const memberName = typeof member === 'object' ? member.fullName : 'Member';
                    const memberProfilePic = typeof member === 'object' ? member.profilePic : null;
                    
                    console.log('Rendering member:', { member, memberId, memberName, memberProfilePic });
                    
                    return (
                      <div key={memberId} className="member-item">
                        <div className="member-avatar">
                          {memberProfilePic ? (
                            <img 
                              src={memberProfilePic.startsWith('http') ? memberProfilePic : `http://localhost:5000${memberProfilePic}`} 
                              alt={memberName}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span style={{ display: memberProfilePic ? 'none' : 'flex' }}>
                            {memberName?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="member-info">
                          <span className="member-name">{memberName || 'Unknown User'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || loadingUser) {
    return (
      <div className="communities-page">
        <div className="communities-content">
          <h2 className="communities-title">Loading...</h2>
          <p>Please wait while we load your profile and communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="communities-page">
        <div className="communities-content">
          <h2 className="communities-title">Error</h2>
          <p>{error}</p>
          <button onClick={loadCommunities} style={{ marginTop: '10px', padding: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="communities-page">
        <div className="communities-content">
          <h2 className="communities-title">Please Login</h2>
          <p>You need to be logged in to view communities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="communities-page">
      <div className="communities-content">
        <h2 className="communities-title">GP-Connect Community</h2>
        <div className="communities-list">
          {communities.map((community) => (
            <div key={community._id} className="community-item">
              <div className="community-avatar">
                <span className="community-emoji">{community.avatar}</span>
              </div>
              <div className="community-content">
                <div className="community-name">{community.name}</div>
                <div className="community-desc">{community.description}</div>
                <div className="community-members">{community.members.length} members</div>
              </div>
              <div className="community-actions">
                <button 
                  className={`community-btn${isMember(community) ? ' leave' : ''}${joiningCommunity === community._id ? ' loading' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(community);
                  }}
                  disabled={joiningCommunity === community._id}
                >
                  {joiningCommunity === community._id ? (
                    <span>Processing...</span>
                  ) : (
                    isMember(community) ? 'Leave' : 'Join'
                  )}
                </button>
                {isMember(community) && (
                  <button 
                    className="community-btn open-chat"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat(community);
                    }}
                  >
                    Open Chat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 