import React, { useState, useEffect, useRef } from 'react';
import './CommonCommunity.css';
import { communitiesAPI } from '../services/api.js';
import socketService from '../services/socket.js';

const COMMUNITY_ID = '68dd52a283642af8c35205cc';

export default function CommonCommunity() {
  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load current user and community data
  useEffect(() => {
    loadCurrentUser();
    loadCommunity();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Set up socket listeners when component mounts
  useEffect(() => {
    socketService.onNewMessage(handleNewMessage);
    socketService.onMemberUpdate(handleMemberUpdate);
    
    return () => {
      socketService.offNewMessage(handleNewMessage);
      socketService.offMemberUpdate(handleMemberUpdate);
    };
  }, []);

  // Join community room when user is a member
  useEffect(() => {
    if (community && isMember() && socketService.socket) {
      socketService.joinCommunity(COMMUNITY_ID);
    }
  }, [community]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.user);
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadCommunity = async () => {
    try {
      setIsLoading(true);
      const response = await communitiesAPI.getCommunity();
      setCommunity(response.data);
    } catch (error) {
      console.error('Error loading community:', error);
      setError('Failed to load community');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await communitiesAPI.getCommunityMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const isMember = () => {
    if (!currentUser || !community || !community.members) {
      return false;
    }
    return community.members.some(member => 
      (typeof member === 'object' ? member._id : member) === currentUser._id
    );
  };

  const handleJoin = async () => {
    if (!currentUser) {
      alert('Please wait while we load your profile...');
      return;
    }

    try {
      setIsJoining(true);
      const response = await communitiesAPI.joinCommunity();
      setCommunity(response.data.community);
      
      // Join socket room
      socketService.joinCommunity(COMMUNITY_ID);
      
      // Load messages after joining
      await loadMessages();
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!currentUser) {
      return;
    }

    try {
      setIsLeaving(true);
      const response = await communitiesAPI.leaveCommunity();
      setCommunity(response.data.community);
      
      // Leave socket room
      socketService.leaveCommunity(COMMUNITY_ID);
      
      // Clear messages
      setMessages([]);
    } catch (error) {
      console.error('Error leaving community:', error);
      alert('Failed to leave community. Please try again.');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageText = newMessage.trim();
      setNewMessage('');
      
      const response = await communitiesAPI.sendMessage(messageText);
      // Message will be received via Socket.IO, so no need to add it locally
      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      setNewMessage(newMessage); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleMemberUpdate = (data) => {
    setCommunity(prev => ({
      ...prev,
      members: data.members,
      membersCount: data.membersCount
    }));
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="common-community">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="common-community">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={loadCommunity} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="common-community">
        <div className="error-container">
          <h2>Community Not Found</h2>
          <p>The GP-ConneX CommonCommunity could not be found.</p>
        </div>
      </div>
    );
  }

  // Show join card if user is not a member
  if (!isMember()) {
    return (
      <div className="common-community">
        <div className="join-container">
          <div className="join-card">
            <div className="community-header">
              <div className="community-avatar">{community.avatar}</div>
              <div className="community-info">
                <h1 className="community-name">{community.name}</h1>
                <p className="community-description">{community.description}</p>
                <div className="community-stats">
                  <span className="member-count">{community.members?.length || 0} members</span>
                </div>
              </div>
            </div>
            <div className="join-actions">
              <button 
                className="join-btn"
                onClick={handleJoin}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Community'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show chat interface if user is a member
  return (
    <div className="common-community">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-info">
            <div className="community-avatar">{community.avatar}</div>
            <div>
              <h2 className="chat-title">{community.name}</h2>
              <p className="member-count">{community.members?.length || 0} members</p>
            </div>
          </div>
          <button 
            className="leave-btn"
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {isLeaving ? 'Leaving...' : 'Leave Community'}
          </button>
        </div>

        <div className="messages-container">
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="no-messages">
                <div className="welcome-icon">💬</div>
                <h3>Welcome to {community.name}!</h3>
                <p>Start the conversation by sending a message below.</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.sender?._id === currentUser?._id;
                const showAvatar = index === 0 || messages[index - 1].sender?._id !== message.sender?._id;
                
                return (
                  <div key={message._id || index} className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}>
                    {!isOwnMessage && showAvatar && (
                      <div className="message-avatar">
                        {message.sender?.profilePic ? (
                          <img 
                            src={message.sender.profilePic.startsWith('http') ? message.sender.profilePic : `http://localhost:5000${message.sender.profilePic}`} 
                            alt={message.sender.fullName}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span style={{ display: message.sender?.profilePic ? 'none' : 'flex' }}>
                          {message.sender?.fullName?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    {!isOwnMessage && !showAvatar && <div className="message-spacer"></div>}
                    
                    <div className="message-bubble">
                      {!isOwnMessage && showAvatar && (
                        <div className="message-sender">{message.sender?.fullName || 'Unknown User'}</div>
                      )}
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                        <div className="message-time">{formatTime(message.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="message-input-container">
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              className="message-input"
            />
            <button 
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="send-btn"
            >
              {isSending ? (
                <div className="sending-spinner"></div>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
