import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
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

const upload = multer({ storage });

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

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate('userId', 'username');
  res.json(posts);
});

// @desc    Get posts by user
// @route   GET /api/posts/user/:id
// @access  Private
const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ userId: req.params.id }).populate(
    'userId',
    'username'
  );
  res.json(posts);
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

export { upload, createPost, getPosts, getUserPosts, deletePost };
