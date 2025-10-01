import Community from '../models/Community.js';
import User from '../models/User.js';

// Get all communities
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('members', 'fullName profilePic')
      .populate('createdBy', 'fullName profilePic')
      .sort({ createdAt: -1 });

    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single community
export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members', 'fullName profilePic')
      .populate('createdBy', 'fullName profilePic')
      .populate('messages.sender', 'fullName profilePic');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join/Leave community
export const toggleJoinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const isMember = community.members.includes(userId);

    if (isMember) {
      // Leave community
      community.members = community.members.filter(memberId => memberId.toString() !== userId);
      await community.save();
      
      // Emit Socket.IO event for member update
      const io = req.app.get('io');
      if (io) {
        io.to(`community_${id}`).emit('community:memberUpdate', {
          membersCount: community.members.length,
          members: community.members
        });
      }
      
      res.json({ 
        success: true, 
        joined: false, 
        membersCount: community.members.length,
        members: community.members
      });
    } else {
      // Join community
      community.members.push(userId);
      await community.save();
      
      // Emit Socket.IO event for member update
      const io = req.app.get('io');
      if (io) {
        io.to(`community_${id}`).emit('community:memberUpdate', {
          membersCount: community.members.length,
          members: community.members
        });
      }
      
      res.json({ 
        success: true, 
        joined: true, 
        membersCount: community.members.length,
        members: community.members
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get community messages
export const getCommunityMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id)
      .populate('messages.sender', '_id fullName profilePic');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    const isMember = community.members.includes(userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to view messages' });
    }

    // Sort messages oldest to newest
    const sortedMessages = community.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    res.json(sortedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message to community
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    const isMember = community.members.includes(userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You must be a member to send messages' });
    }

    const newMessage = {
      sender: userId,
      text,
      createdAt: new Date()
    };

    community.messages.push(newMessage);
    await community.save();

    // Populate sender info for response
    await community.populate('messages.sender', '_id fullName profilePic');

    const savedMessage = community.messages[community.messages.length - 1];

    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`community_${id}`).emit('community:message', savedMessage);
      console.log(`Emitted new message to community_${id}:`, savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new community (admin only)
export const createCommunity = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const createdBy = req.user.id;

    const community = new Community({
      name,
      description,
      avatar: avatar || '🏢',
      createdBy,
      members: [createdBy] // Creator is automatically a member
    });

    await community.save();
    await community.populate('createdBy', 'fullName profilePic');

    res.status(201).json(community);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Community name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};
