import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// POST /api/auth/google — Login with Google
router.post('/google', authLimiter, authController.googleLogin);

// GET /api/auth/me — Get current user
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/logout — Logout
router.post('/logout', authenticate, authController.logout);

export default router;

