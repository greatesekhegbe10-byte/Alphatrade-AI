import { Router } from 'express';
import { signup, login, verifySession, logout, getAllUsers, updateUserTier } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/signup', authenticate, signup);
router.post('/login', authenticate, login);
router.get('/session', authenticate, verifySession);
router.post('/logout', logout);

// Admin Routes
router.get('/users', authenticate, getAllUsers);
router.post('/users/tier', authenticate, updateUserTier);

export default router;
