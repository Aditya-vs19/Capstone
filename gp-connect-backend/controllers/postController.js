import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import User from '../models/User.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const post = new Post({
    userId: req.user._id,
    caption,
    image,
  });

  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

// @desc    Get posts from current user and followed users
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
  // Get current user with following list
  const currentUser = await User.findById(req.user._id).select('following');
  
  // Create array of user IDs to fetch posts from (current user + followed users)
  const userIdsToFetch = [req.user._id, ...currentUser.following];
  
  const posts = await Post.find({ userId: { $in: userIdsToFetch } })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName profilePic enrollment');
  res.json(posts);
});

// @desc    Get posts by user
// @route   GET /api/posts/user/:id
// @access  Private
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ userId: req.params.id })
    .sort({ createdAt: -1 })
    .populate('userId', 'fullName profilePic enrollment');
  res.json(posts);
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this post');
  }

  // Update fields
  if (caption !== undefined) post.caption = caption;
  if (image !== undefined) post.image = image;

  const updatedPost = await post.save();
  const populatedPost = await Post.findById(updatedPost._id)
    .populate('userId', 'fullName profilePic enrollment');

  res.json(populatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (post) {
    if (post.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this post');
    }
    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } else {
    res.status(404);
    throw new Error('Post not found');
  }
});

export { upload, createPost, getPosts, getUserPosts, updatePost, deletePost };
