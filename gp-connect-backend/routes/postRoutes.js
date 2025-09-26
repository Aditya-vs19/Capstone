import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload, createPost, getPosts, getUserPosts, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.route('/').post(protect, upload.single('image'), createPost).get(protect, getPosts);
router.route('/user/:id').get(protect, getUserPosts);
router.route('/:id').delete(protect, deletePost);

export default router;
