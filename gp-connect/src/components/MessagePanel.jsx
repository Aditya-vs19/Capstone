import React, { useState, useEffect, useRef } from 'react';
import './MessagePanel.css';
import { messagesAPI } from '../services/api.js';
import socketService from '../services/socket.js';

const MessagePanel = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [currentUser, setCurrentUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load current user
  useEffect(() => {
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
    loadCurrentUser();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Set up socket listeners
  useEffect(() => {
    socketService.onDirectMessage(handleNewMessage);
    socketService.onTypingStart(handleTypingStart);
    socketService.onTypingStop(handleTypingStop);
    
    return () => {
      socketService.offDirectMessage(handleNewMessage);
      socketService.offTypingStart(handleTypingStart);
      socketService.offTypingStop(handleTypingStop);
    };
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation) {
      socketService.joinConversation(selectedConversation._id);
      loadMessages(selectedConversation._id);
      markAsRead(selectedConversation._id);
    }
    return () => {
      if (selectedConversation) {
        socketService.leaveConversation(selectedConversation._id);
      }
    };
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await messagesAPI.getMessages(conversationId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messagesAPI.markAsRead(conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedConversation) return;

    try {
      setIsSending(true);
      const messageText = newMessage.trim();
      setNewMessage('');
      
      await messagesAPI.sendMessage(selectedConversation._id, messageText);
      // Message will be received via Socket.IO
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
    
    // Update conversation list with new message
    setConversations(prev => 
      prev.map(conv => 
        conv._id === message.conversation 
          ? { ...conv, lastMessage: message, lastMessageAt: message.createdAt }
          : conv
      )
    );
  };

  const handleTypingStart = (data) => {
    if (data.conversationId === selectedConversation?._id) {
      setTypingUsers(prev => [...prev.filter(user => user !== data.userId), data.userId]);
    }
  };

  const handleTypingStop = (data) => {
    if (data.conversationId === selectedConversation?._id) {
      setTypingUsers(prev => prev.filter(user => user !== data.userId));
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedConversation) {
      socketService.startTyping(selectedConversation._id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(selectedConversation._id);
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return date.toLocaleDateString([], { weekday: 'long' });
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mobile: list view or chat view
  if (isMobile) {
    if (selectedConversation === null) {
      // List view only
      return (
        <div className="dm-container mobile">
          <div className="dm-list mobile">
            <div className="dm-header">
            <h4 className="dm-title">Messages</h4>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dm-search"
              />
            </div>
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading conversations...</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  className={`msg-item${conv === selectedConversation ? ' selected' : ''}`}
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="msg-avatar">
                    {conv.otherUser?.profilePic ? (
                      <img 
                        src={conv.otherUser.profilePic.startsWith('http') ? conv.otherUser.profilePic : `http://localhost:5000${conv.otherUser.profilePic}`} 
                        alt={conv.otherUser.fullName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span style={{ display: conv.otherUser?.profilePic ? 'none' : 'flex' }}>
                      {conv.otherUser?.fullName?.charAt(0) || '?'}
                    </span>
                  </div>
                <div className="msg-content">
                    <p className="msg-name">{conv.otherUser?.fullName || 'Unknown User'}</p>
                    <p className="msg-preview">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                  <div className="msg-time">
                    {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    } else {
      // Chat view only
      return (
        <div className="dm-container mobile">
          <div className="dm-chat mobile">
            <div className="dm-chat-header">
              <button 
                className="back-btn" 
                onClick={() => setSelectedConversation(null)}
              >
                ← Back
              </button>
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {selectedConversation.otherUser?.profilePic ? (
                    <img 
                      src={selectedConversation.otherUser.profilePic.startsWith('http') ? selectedConversation.otherUser.profilePic : `http://localhost:5000${selectedConversation.otherUser.profilePic}`} 
                      alt={selectedConversation.otherUser.fullName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span style={{ display: selectedConversation.otherUser?.profilePic ? 'none' : 'flex' }}>
                    {selectedConversation.otherUser?.fullName?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h3>{selectedConversation.otherUser?.fullName || 'Unknown User'}</h3>
                  <p className="online-status">Online</p>
                </div>
              </div>
            </div>
            <div className="dm-chat-body">
              {messages.map((message, idx) => {
                const isOwnMessage = message.sender?._id === currentUser?._id;
                const showAvatar = idx === 0 || messages[idx - 1].sender?._id !== message.sender?._id;
                
                return (
                  <div key={message._id || idx} className={`dm-bubble ${isOwnMessage ? 'me' : 'them'}`}>
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
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{formatTime(message.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Someone is typing...</span>
            </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="dm-chat-input-row">
              <input 
                className="dm-chat-input" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={handleTyping}
                disabled={isSending}
              />
              <button 
                className="dm-send-btn" 
                type="submit"
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  // Desktop: two-pane layout
  return (
    <div className="dm-container">
      {/* Left: Message List */}
      <div className="dm-list">
        <div className="dm-header">
        <h4 className="dm-title">Messages</h4>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dm-search"
          />
        </div>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading conversations...</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              className={`msg-item${conv === selectedConversation ? ' selected' : ''}`}
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="msg-avatar">
                {conv.otherUser?.profilePic ? (
                  <img 
                    src={conv.otherUser.profilePic.startsWith('http') ? conv.otherUser.profilePic : `http://localhost:5000${conv.otherUser.profilePic}`} 
                    alt={conv.otherUser.fullName}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span style={{ display: conv.otherUser?.profilePic ? 'none' : 'flex' }}>
                  {conv.otherUser?.fullName?.charAt(0) || '?'}
                </span>
              </div>
            <div className="msg-content">
                <p className="msg-name">{conv.otherUser?.fullName || 'Unknown User'}</p>
                <p className="msg-preview">
                  {conv.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              <div className="msg-time">
                {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Right: Chat Window */}
      <div className="dm-chat">
        {selectedConversation ? (
          <>
            <div className="dm-chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {selectedConversation.otherUser?.profilePic ? (
                    <img 
                      src={selectedConversation.otherUser.profilePic.startsWith('http') ? selectedConversation.otherUser.profilePic : `http://localhost:5000${selectedConversation.otherUser.profilePic}`} 
                      alt={selectedConversation.otherUser.fullName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span style={{ display: selectedConversation.otherUser?.profilePic ? 'none' : 'flex' }}>
                    {selectedConversation.otherUser?.fullName?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h3>{selectedConversation.otherUser?.fullName || 'Unknown User'}</h3>
                  <p className="online-status">Online</p>
                </div>
              </div>
            </div>
            <div className="dm-chat-body">
              {messages.map((message, idx) => {
                const isOwnMessage = message.sender?._id === currentUser?._id;
                const showAvatar = idx === 0 || messages[idx - 1].sender?._id !== message.sender?._id;
                
                return (
                  <div key={message._id || idx} className={`dm-bubble ${isOwnMessage ? 'me' : 'them'}`}>
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
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">{formatTime(message.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Someone is typing...</span>
            </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="dm-chat-input-row">
              <input 
                className="dm-chat-input" 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={handleTyping}
                disabled={isSending}
              />
              <button 
                className="dm-send-btn" 
                type="submit"
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? '...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="dm-chat-placeholder">
            <div className="placeholder-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagePanel;