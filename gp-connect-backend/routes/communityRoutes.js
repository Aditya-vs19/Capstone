import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMessages,
  sendMessage
} from '../controllers/communityController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get community details
router.get('/', getCommunity);

// Join community
router.post('/join', joinCommunity);

// Leave community
router.post('/leave', leaveCommunity);

// Get community messages
router.get('/messages', getCommunityMessages);

// Send message to community
router.post('/message', sendMessage);

export default router;
