import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Add auth token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Assuming 'token' is where JWT is stored
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // Optionally redirect to login, but for now, we'll let the component handle it
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions - Updated for email verification flow
export const authAPI = {
  login: (credentials) => API.post('/auth/login', credentials),
  register: (userData) => API.post('/auth/register', userData),
  verifyOtp: (data) => API.post('/auth/verify', data),
};

export const profileAPI = {
  getCurrentUserProfile: () => API.get('/profile/me'),
  getUserProfile: (userId) => API.get(`/profile/${userId}`),
  updateProfile: (userId, data) => API.put(`/profile/${userId}`, data),
  uploadProfilePicture: (userId, formData) => API.post(`/profile/${userId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (userId, data) => API.put(`/profile/${userId}/password`, data),
  searchUsers: (query) => API.get(`/profile/search?query=${encodeURIComponent(query)}`),
  followUser: (userId) => API.post(`/profile/${userId}/follow`),
  unfollowUser: (userId) => API.post(`/profile/${userId}/unfollow`),
  testUsers: () => API.get('/profile/test-users'),
};

export const postsAPI = {
  getPosts: () => API.get('/posts'),
  createPost: (data) => API.post('/posts', data),
  getUserPosts: (userId) => API.get(`/posts/user/${userId}`),
  updatePost: (postId, data) => API.put(`/posts/${postId}`, data),
  deletePost: (postId) => API.delete(`/posts/${postId}`),
  toggleLike: (postId) => API.post(`/posts/${postId}/like`),
  getPostLikes: (postId) => API.get(`/posts/${postId}/likes`),
  addComment: (postId, text) => API.post(`/posts/${postId}/comments`, { text }),
  getPostComments: (postId) => API.get(`/posts/${postId}/comments`),
};

// Community API functions
export const communitiesAPI = {
  getCommunity: () => API.get('/community'),
  joinCommunity: () => API.post('/community/join'),
  leaveCommunity: () => API.post('/community/leave'),
  getCommunityMessages: () => API.get('/community/messages'),
  sendMessage: (content) => API.post('/community/message', { content }),
};

export const messagesAPI = {
  getConversations: () => API.get('/messages/conversations'),
  getOrCreateConversation: (otherUserId) => API.get(`/messages/conversation/${otherUserId}`),
  getMessages: (conversationId, page = 1, limit = 50) => API.get(`/messages/conversation/${conversationId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (conversationId, content, messageType = 'text') => API.post(`/messages/conversation/${conversationId}/message`, { content, messageType }),
  markAsRead: (conversationId) => API.put(`/messages/conversation/${conversationId}/read`),
  deleteMessage: (messageId) => API.delete(`/messages/message/${messageId}`),
  getUnreadCount: () => API.get('/messages/unread-count'),
};

export const notificationsAPI = {
  getNotifications: () => API.get('/notifications/'),
};

export default API; 