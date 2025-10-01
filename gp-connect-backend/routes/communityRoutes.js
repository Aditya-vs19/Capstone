import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getAllCommunities,
  getCommunity,
  toggleJoinCommunity,
  getCommunityMessages,
  sendMessage,
  createCommunity
} from '../controllers/communityController.js';

const router = express.Router();

// Public routes
router.get('/', getAllCommunities);

// Protected routes
router.use(protect);

router.get('/:id', getCommunity);
router.post('/:id/join', toggleJoinCommunity);
router.get('/:id/messages', getCommunityMessages);
router.post('/:id/messages', sendMessage);
router.post('/', createCommunity);

export default router;
