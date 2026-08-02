import { Request, Response } from 'express';
import { eventReviewService } from '../services/eventReview.service';
import { logger } from '../utils/logger';

export const eventReviewController = {
  /**
   * POST /api/event-reviews/:eventId
   * Submit a review for an event
   */
  async submitReview(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { rating, review_text } = req.body;
      const userId = req.user!.userId;

      // Basic bounds check (also checked by DB constraint)
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({
          success: false,
          message: 'Rating must be an integer between 1 and 5',
        });
        return;
      }

      // Length check (also checked by DB constraint)
      if (!review_text || typeof review_text !== 'string' || review_text.length < 10 || review_text.length > 500) {
        res.status(400).json({
          success: false,
          message: 'Review text must be between 10 and 500 characters',
        });
        return;
      }

      // Check overarching eligibility
      try {
        const eligibility = await eventReviewService.checkEligibility(eventId, userId);
        if (!eligibility.eligible) {
          res.status(403).json({
            success: false,
            message: eligibility.reason,
          });
          return;
        }
      } catch (err: any) {
         res.status(400).json({
          success: false,
          message: err.message || 'Error checking eligibility',
        });
        return;
      }

      const newReview = await eventReviewService.create({
        event_id: eventId,
        user_id: userId,
        rating,
        review_text,
      });

      res.status(201).json({
        success: true,
        data: newReview,
        message: 'Review submitted successfully and is pending approval',
      });
    } catch (error: any) {
      logger.error('Submit review error', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit review',
      });
    }
  },

  /**
   * GET /api/event-reviews/event/:eventId
   * Get all approved reviews & aggregated rating stats
   */
  async getEventReviews(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const data = await eventReviewService.getByEventId(eventId, true);
      
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Get event reviews error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
      });
    }
  },

  /**
   * GET /api/event-reviews/eligibility/:eventId
   * Check if the current user can review the event
   */
  async checkUserEligibility(req: Request, res: Response): Promise<void> {
    try {
        const { eventId } = req.params;
        const userId = req.user!.userId;
        
        try {
            const result = await eventReviewService.checkEligibility(eventId, userId);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (err: any) {
             res.status(400).json({
                success: false,
                message: err.message
            });
        }
    } catch (error) {
         logger.error('Check eligibility error', error);
         res.status(500).json({
            success: false,
            message: 'Failed to check eligibility',
         });
    }
  },

  /**
   * GET /api/event-reviews/admin
   * Get all reviews (approved & pending) for admin management
   */
  async getAllReviews(req: Request, res: Response): Promise<void> {
    try {
      const reviews = await eventReviewService.getAll();
      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error: any) {
      logger.error('Get all reviews admin error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch all reviews',
      });
    }
  },

  /**
   * PUT /api/event-reviews/admin/:reviewId
   * Admin: Approve or reject a review
   */
  async updateReviewStatus(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { is_approved } = req.body;

      if (typeof is_approved !== 'boolean') {
         res.status(400).json({
          success: false,
          message: 'is_approved must be a boolean',
        });
        return;
      }

      const updatedReview = await eventReviewService.updateStatus(reviewId, is_approved);
      
      res.status(200).json({
        success: true,
        data: updatedReview,
        message: is_approved ? 'Review approved' : 'Review unapproved',
      });
    } catch (error: any) {
      logger.error('Update review status error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review status',
      });
    }
  },

  /**
   * DELETE /api/event-reviews/admin/:reviewId
   */
  async deleteReview(req: Request, res: Response): Promise<void> {
      try {
          const { reviewId } = req.params;
          await eventReviewService.delete(reviewId);
          res.status(200).json({
              success: true,
              message: 'Review deleted',
          });
      } catch (error: any) {
         logger.error('Delete review error', error);
          res.status(500).json({
            success: false,
            message: 'Failed to delete review',
          });
      }
  }
};
