import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePicture, 
  changePassword, 
  getCurrentUserProfile,
  upload
} from '../controllers/profileController.js';

const router = express.Router();

// Get current user profile
router.get('/me', protect, getCurrentUserProfile);

// Get user profile by ID
router.get('/:id', protect, getUserProfile);

// Update user profile
router.put('/:id', protect, updateUserProfile);

// Upload profile picture
router.post('/:id/upload', protect, upload.single('profilePic'), uploadProfilePicture);

// Change password
router.put('/:id/password', protect, changePassword);

export default router;
