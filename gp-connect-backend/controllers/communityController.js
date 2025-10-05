import Community from '../models/Community.js';
import User from '../models/User.js';

// Get community details
export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById('68dd52a283642af8c35205cc')
      .populate('members', 'fullName profilePic enrollment')
      .populate('createdBy', 'fullName profilePic enrollment')
      .populate('messages.sender', 'fullName profilePic enrollment');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join community
export const joinCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = '68dd52a283642af8c35205cc';

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add user to members
    community.members.push(userId);
    await community.save();

    // Populate the updated community
    await community.populate('members', 'fullName profilePic enrollment');

    // Emit Socket.IO event for member update
    const io = req.app.get('io');
    if (io) {
      io.to(`community_${communityId}`).emit('community:memberUpdate', {
        membersCount: community.members.length,
        members: community.members
      });
    }

    res.json({ 
      success: true, 
      message: 'Successfully joined the community',
      community: {
        _id: community._id,
        name: community.name,
        description: community.description,
        avatar: community.avatar,
        members: community.members,
        membersCount: community.members.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave community
export const leaveCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = '68dd52a283642af8c35205cc';

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member' });
    }

    // Remove user from members
    community.members = community.members.filter(memberId => memberId.toString() !== userId);
    await community.save();

    // Populate the updated community
    await community.populate('members', 'fullName profilePic enrollment');

    // Emit Socket.IO event for member update
    const io = req.app.get('io');
    if (io) {
      io.to(`community_${communityId}`).emit('community:memberUpdate', {
        membersCount: community.members.length,
        members: community.members
      });
    }

    res.json({ 
      success: true, 
      message: 'Successfully left the community',
      community: {
        _id: community._id,
        name: community.name,
        description: community.description,
        avatar: community.avatar,
        members: community.members,
        membersCount: community.members.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get community messages
export const getCommunityMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const communityId = '68dd52a283642af8c35205cc';

    const community = await Community.findById(communityId)
      .populate('messages.sender', 'fullName profilePic enrollment');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(403).json({ message: 'You must be a member to view messages' });
    }

    // Sort messages by timestamp (oldest first)
    const sortedMessages = community.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json(sortedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message to community
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const communityId = '68dd52a283642af8c35205cc';

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(403).json({ message: 'You must be a member to send messages' });
    }

    const newMessage = {
      sender: userId,
      content: content.trim(),
      timestamp: new Date()
    };

    community.messages.push(newMessage);
    await community.save();

    // Populate sender info for response
    await community.populate('messages.sender', 'fullName profilePic enrollment');

    const savedMessage = community.messages[community.messages.length - 1];

    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`community_${communityId}`).emit('community:message', savedMessage);
      console.log(`Emitted new message to community_${communityId}:`, savedMessage);
    }

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
