import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { optionalAuth } from '../middlewares/optionalAuth.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /api/membership/count — Public count of approved members
router.get('/count', membershipController.getApprovedCount);

// POST /api/membership/apply — Submit application (optionally authenticated)
router.post('/apply', optionalAuth, membershipController.apply);

// GET /api/membership/status — Check own application status (requires login)
router.get('/status', authenticate, membershipController.checkStatus);

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/membership — All applications
router.get('/', authenticate, authorize('admin'), membershipController.getAll);

// PATCH /api/membership/:id/status — Approve/reject
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  membershipController.updateStatus
);

export default router;
