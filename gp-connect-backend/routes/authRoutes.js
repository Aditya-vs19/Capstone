import express from 'express';
import { registerUser, verifyOtp, authUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify', verifyOtp);
router.post('/login', authUser);

export default router;
