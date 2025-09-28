import React, { useState, useEffect } from 'react';
import './Feed.css';
import { postsAPI } from '../services/api';

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
  const [postStates, setPostStates] = useState(
    posts.reduce((acc, post) => {
      acc[post.id] = {
        liked: false,
        likes: Math.floor(Math.random() * 100) + 10,
        comments: [],
        showComments: false,
        commentText: ''
      };
      return acc;
    }, {})
  );

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await getFeeds();
      setPosts(fetchedPosts);
    };
    fetchPosts();
  }, []);

  const handleUsernameClick = (username) => {
    console.log(`Navigating to profile of: ${username}`);
    
    const dummyProfileData = {
      username: username,
      name: username,
      bio: `This is ${username}'s profile bio.`,
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random`,
      posts: [
        { id: 1, image: './src/images/image1.jpg' },
        { id: 2, image: './src/images/image2.jpg' },
        { id: 3, image: './src/images/image3.jpg' },
      ],
      followers: Math.floor(Math.random() * 1000) + 100,
      following: Math.floor(Math.random() * 500) + 50,
      postsCount: Math.floor(Math.random() * 50) + 5
    };
    
    if (onNavigateToProfile) {
      onNavigateToProfile(dummyProfileData);
    } else {
      alert(`Navigating to ${username}'s profile! (Backend integration pending)`);
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

  return (
    <div className="posts-container">
      {posts.map((post) => {
        const postState = postStates[post.id];
        
        return (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="avatar">{post.user[0].toUpperCase()}</div>
              <span 
                className="username clickable-username" 
                onClick={() => handleUsernameClick(post.user)}
                title={`Click to view ${post.user}'s profile`}
              >
                {post.user}
              </span>
            </div>
            <img src={post.image} alt={post.caption} className="post-img" />
            <div className="post-body">
              <p>
                <span 
                  className="username clickable-username" 
                  onClick={() => handleUsernameClick(post.user)}
                  title={`Click to view ${post.user}'s profile`}
                >
                  {post.user}
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
