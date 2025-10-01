import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Community from '../models/Community.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gpconnect');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedSingleCommunity = async () => {
  try {
    await connectDB();
    
    console.log('Starting single community seed...');
    
    // Delete all existing communities
    const deleteResult = await Community.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing communities`);
    
    // Get the first user to be the creator, or create a system user
    let systemUser = await User.findOne({ email: 'system@gpconnect.com' });
    if (!systemUser) {
      systemUser = new User({
        fullName: 'GP-Connect System',
        email: 'system@gpconnect.com',
        password: 'system123', // This won't be used for login
        enrollment: 'SYSTEM1',
        department: 'Computer',
        isVerified: true
      });
      await systemUser.save();
    }
    
    // Create the single general community
    const generalCommunity = new Community({
      name: 'GP-Connect Community',
      description: 'The main community for GP-Connect users to connect, share ideas, and collaborate.',
      avatar: '🌐',
      members: [],
      messages: [],
      createdBy: systemUser._id
    });
    
    await generalCommunity.save();
    
    console.log('✅ Single community created successfully!');
    console.log(`Community ID: ${generalCommunity._id}`);
    console.log(`Community Name: ${generalCommunity.name}`);
    console.log(`Community Slug: general`);
    
    // Update .env.example if it exists
    const fs = await import('fs');
    const path = await import('path');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    try {
      let envContent = '';
      if (fs.existsSync(envExamplePath)) {
        envContent = fs.readFileSync(envExamplePath, 'utf8');
      }
      
      // Add or update the community ID
      const communityIdLine = `GENERAL_COMMUNITY_ID=${generalCommunity._id}`;
      if (!envContent.includes('GENERAL_COMMUNITY_ID')) {
        envContent += `\n# General Community ID\n${communityIdLine}\n`;
      } else {
        envContent = envContent.replace(/GENERAL_COMMUNITY_ID=.*/, communityIdLine);
      }
      
      fs.writeFileSync(envExamplePath, envContent);
      console.log('✅ Updated .env.example with community ID');
    } catch (error) {
      console.log('⚠️  Could not update .env.example:', error.message);
    }
    
    console.log('\n🎉 Seed completed successfully!');
    console.log('The general community is ready for use.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

// Run the seed
seedSingleCommunity();
