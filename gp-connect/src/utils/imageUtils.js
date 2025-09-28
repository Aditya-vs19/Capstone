// Image utility functions for handling image URLs and fallbacks

const API_BASE_URL = 'http://localhost:5000';

/**
 * Get the full URL for an uploaded image
 * @param {string} imagePath - The image path from database
 * @returns {string} - Full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /, it's already a path
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, add the base URL
  return `${API_BASE_URL}/${imagePath}`;
};

/**
 * Get profile picture URL with fallback
 * @param {string} profilePic - Profile picture path
 * @returns {string} - URL to profile picture or default avatar
 */
export const getProfilePicUrl = (profilePic) => {
  return profilePic ? getImageUrl(profilePic) : '/default-avatar.svg';
};

/**
 * Get post image URL
 * @param {string} imagePath - Post image path
 * @returns {string} - URL to post image
 */
export const getPostImageUrl = (imagePath) => {
  return getImageUrl(imagePath);
};

/**
 * Handle image load error by setting fallback
 * @param {Event} event - Image load error event
 * @param {string} fallbackSrc - Fallback image source
 */
export const handleImageError = (event, fallbackSrc = '/default-avatar.svg') => {
  event.target.src = fallbackSrc;
  event.target.style.display = 'block';
};

/**
 * Handle image load success
 * @param {Event} event - Image load success event
 */
export const handleImageLoad = (event) => {
  event.target.style.display = 'block';
};

/**
 * Check if an image exists by trying to load it
 * @param {string} url - Image URL to check
 * @returns {Promise<boolean>} - Whether the image exists
 */
export const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Get a placeholder image for missing images
 * @param {string} type - Type of placeholder ('profile' or 'post')
 * @returns {string} - Placeholder image URL
 */
export const getPlaceholderImage = (type = 'post') => {
  const placeholders = {
    profile: '/default-avatar.svg',
    post: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+'
  };
  
  return placeholders[type] || placeholders.post;
};
