import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { uploadImage } from '../utils/upload';
import * as ctrl from '../controllers/contribution.controller';

const router = Router();

// ── Any authenticated user ───────────────
router.get('/requests/active', authenticate, ctrl.getActiveRequests);
router.post('/submit', authenticate, ctrl.submitContribution);
router.get('/my', authenticate, ctrl.getMyContributions);

// ── Admin ────────────────────────────────
router.post('/admin/requests', authenticate, authorize('admin'), uploadImage.single('qr_image'), ctrl.createRequest);
router.put('/admin/requests/:requestId/close', authenticate, authorize('admin'), ctrl.closeRequest);
router.get('/admin/all', authenticate, authorize('admin'), ctrl.getAllContributions);
router.put('/admin/:contributionId/verify', authenticate, authorize('admin'), ctrl.verifyContribution);
router.get('/admin/stats', authenticate, authorize('admin'), ctrl.getContributionStats);

export default router;
