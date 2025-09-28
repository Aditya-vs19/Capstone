import React, { useState, useEffect } from 'react';
import './Feed.css';
import { postsAPI } from '../services/api';
import { getProfilePicUrl, getPostImageUrl, handleImageError } from '../utils/imageUtils.js';

export const getFeeds = async () => {
  try {
    const response = await postsAPI.getPosts();
    return response.data;
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return [];
  }
};

export default function Feed({ onNavigateToProfile }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [postStates, setPostStates] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const fetchedPosts = await getFeeds();
        setPosts(fetchedPosts);
        
        // Initialize post states for each post
        const initialStates = {};
        fetchedPosts.forEach(post => {
          initialStates[post._id] = {
            liked: false,
            likes: Math.floor(Math.random() * 100) + 10,
            comments: [],
            showComments: false,
            commentText: ''
          };
        });
        setPostStates(initialStates);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleUsernameClick = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (onNavigateToProfile) {
          onNavigateToProfile(data.user);
        }
      } else {
        console.error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleLike = (postId) => {
    setPostStates(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: !prev[postId].liked,
        likes: prev[postId].liked ? prev[postId].likes - 1 : prev[postId].likes + 1
      }
    }));
  };

  const handleComment = (postId) => {
    setPostStates(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        showComments: !prev[postId].showComments
      }
    }));
  };

  const handleAddComment = (postId) => {
    const commentText = postStates[postId].commentText.trim();
    if (commentText) {
      const newComment = {
        id: Date.now(),
        user: 'You',
        text: commentText,
        timestamp: new Date().toLocaleTimeString()
      };

      setPostStates(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          comments: [...prev[postId].comments, newComment],
          commentText: ''
        }
      }));
    }
  };

  const handleCommentChange = (postId, value) => {
    setPostStates(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        commentText: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="posts-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #333',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Loading posts...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="posts-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="posts-container">
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
          <p>No posts in your feed yet.</p>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>
            Follow some users or create your first post to see content here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      {posts.map((post) => {
        const postState = postStates[post._id];
        const user = post.userId || post.user;
        
        return (
          <div key={post._id} className="post-card">
            <div className="post-header">
              <div className="avatar">
                {user.profilePic ? (
                  <img 
                    src={getProfilePicUrl(user.profilePic)} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    onError={(e) => handleImageError(e, '/default-avatar.svg')}
                  />
                ) : null}
                <span style={{ display: user.profilePic ? 'none' : 'block' }}>
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </span>
              </div>
              <span 
                className="username clickable-username" 
                onClick={() => handleUsernameClick(user._id)}
                title={`Click to view ${user.fullName}'s profile`}
              >
                {user.fullName}
              </span>
            </div>
            {post.image && (
              <img 
                src={getPostImageUrl(post.image)} 
                alt={post.caption} 
                className="post-img"
                onError={(e) => handleImageError(e, 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+')}
              />
            )}
            <div className="post-body">
              <p>
                <span 
                  className="username clickable-username" 
                  onClick={() => handleUsernameClick(user._id)}
                  title={`Click to view ${user.fullName}'s profile`}
                >
                  {user.fullName}
                </span> {post.caption}
              </p>
              
              {/* Like count */}
              <div className="like-count">
                {postState.likes} {postState.likes === 1 ? 'like' : 'likes'}
              </div>
              
              {/* Comments section */}
              {postState.showComments && (
                <div className="comments-section">
                  {postState.comments.map((comment) => (
                    <div key={comment.id} className="comment">
                      <span className="comment-username">{comment.user}</span>
                      <span className="comment-text">{comment.text}</span>
                    </div>
                  ))}
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={postState.commentText}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="comment-input"
                    />
                    <button 
                      onClick={() => handleAddComment(post.id)}
                      className="comment-button"
                      disabled={!postState.commentText.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
              
              <div className="post-actions">
                <span 
                  role="img" 
                  aria-label="like"
                  className={`like-button ${postState.liked ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                >
                  {postState.liked ? '❤️' : '🤍'}
                </span>
                <span 
                  role="img" 
                  aria-label="comment"
                  className="comment-button-icon"
                  onClick={() => handleComment(post.id)}
                >
                  💬
                </span>
                <span role="img" aria-label="share">📤</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
