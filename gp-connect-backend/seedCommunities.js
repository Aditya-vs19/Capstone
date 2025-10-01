import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from './models/Community.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const defaultCommunities = [
  {
    name: 'Civil Crew',
    description: 'Civil Engineering community for projects, knowledge sharing, and industry connections.',
    avatar: '🏗️'
  },
  {
    name: 'Spark Squad',
    description: 'Electrical Engineering enthusiasts discussing circuits, power systems, and innovations.',
    avatar: '⚡'
  },
  {
    name: 'Signal Masters',
    description: 'Electronics & Telecommunication community for communication systems and tech projects.',
    avatar: '📡'
  },
  {
    name: 'Mech Warriors',
    description: 'Mechanical Engineering students sharing design, manufacturing, and robotics insights.',
    avatar: '⚙️'
  },
  {
    name: 'Code Crafters',
    description: 'Computer Engineering community for software development and hardware integration.',
    avatar: '💻'
  },
  {
    name: 'Tech Titans',
    description: 'IT community focused on web development, data science, and emerging technologies.',
    avatar: '🚀'
  },
  {
    name: 'Metal Masters',
    description: 'Metallurgy Engineering community for materials science and industrial applications.',
    avatar: '🔧'
  }
];

const seedCommunities = async () => {
  try {
    // Clear existing communities
    await Community.deleteMany({});
    console.log('Cleared existing communities');

    // Create default communities
    for (const communityData of defaultCommunities) {
      const community = new Community({
        ...communityData,
        createdBy: new mongoose.Types.ObjectId(), // Dummy creator ID
        members: []
      });
      await community.save();
      console.log(`Created community: ${community.name}`);
    }

    console.log('Communities seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding communities:', error);
    process.exit(1);
  }
};

seedCommunities();
