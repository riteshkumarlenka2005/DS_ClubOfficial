import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users/profile — Own profile
router.get('/profile', userController.getOwnProfile);

// PUT /api/users/profile — Update own profile
router.put('/profile', userController.updateOwnProfile);

// GET /api/users — All users (admin only)
router.get('/', authorize('admin'), userController.getAllUsers);

// PATCH /api/users/:id/role — Update role (admin only)
router.patch(
  '/:id/role',
  authorize('admin'),
  userController.updateUserRole
);

// PATCH /api/users/:id/status — Toggle active (admin only)
router.patch(
  '/:id/status',
  authorize('admin'),
  userController.toggleUserStatus
);

export default router;

