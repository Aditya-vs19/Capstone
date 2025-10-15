import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .populate('participants', 'fullName profilePic enrollment')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    // Filter out the current user from participants for display
    const conversationsWithOtherUser = conversations.map(conv => {
      const otherUser = conv.participants.find(p => p._id.toString() !== userId);
      return {
        _id: conv._id,
        otherUser,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: 0 // We'll implement this later
      };
    });

    res.json(conversationsWithOtherUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get or create a conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    if (userId === otherUserId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Look for existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
      isActive: true
    })
    .populate('participants', 'fullName profilePic enrollment');

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, otherUserId]
      });
      await conversation.save();
      await conversation.populate('participants', 'fullName profilePic enrollment');
    }

    // Get the other user from participants
    const otherUserData = conversation.participants.find(p => p._id.toString() !== userId);

    res.json({
      conversation: {
        _id: conversation._id,
        otherUser: otherUserData,
        lastMessage: conversation.lastMessage,
        lastMessageAt: conversation.lastMessageAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get messages with pagination
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'fullName profilePic enrollment')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Create new message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
      messageType
    });

    await message.save();
    await message.populate('sender', 'fullName profilePic enrollment');

    // Update conversation's last message
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Send to conversation room
      io.to(`conversation_${conversationId}`).emit('message:new', message);
      console.log(`Emitted new message to conversation ${conversationId}:`, message);
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all messages in this conversation as read (except own messages)
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Message.countDocuments({
      conversation: { $in: await Conversation.find({ participants: userId }).distinct('_id') },
      sender: { $ne: userId },
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
