import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount
} from '../controllers/messageController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all conversations for the current user
router.get('/conversations', getConversations);

// Get or create a conversation with a specific user
router.get('/conversation/:otherUserId', getOrCreateConversation);

// Get messages for a specific conversation
router.get('/conversation/:conversationId/messages', getMessages);

// Send a message to a conversation
router.post('/conversation/:conversationId/message', sendMessage);

// Mark messages in a conversation as read
router.put('/conversation/:conversationId/read', markAsRead);

// Delete a specific message
router.delete('/message/:messageId', deleteMessage);

// Get unread message count
router.get('/unread-count', getUnreadCount);

export default router;
