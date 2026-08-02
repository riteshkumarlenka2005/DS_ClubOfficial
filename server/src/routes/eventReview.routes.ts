import { Router } from 'express';
import { eventReviewController } from '../controllers/eventReview.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// PUBLIC ROUTES
router.get('/event/:eventId', eventReviewController.getEventReviews);

// AUTHENTICATED USER ROUTES
router.post('/:eventId', authenticate, eventReviewController.submitReview);
router.get('/eligibility/:eventId', authenticate, eventReviewController.checkUserEligibility);

// ADMIN ROUTES
router.get('/admin/all', authenticate, authorize('admin'), eventReviewController.getAllReviews);
router.put('/admin/:reviewId', authenticate, authorize('admin'), eventReviewController.updateReviewStatus);
router.delete('/admin/:reviewId', authenticate, authorize('admin'), eventReviewController.deleteReview);

export default router;
