import { Request, Response } from 'express';
import { membershipService } from '../services/membership.service';
import { activityService } from '../services/activity.service';
import { logger } from '../utils/logger';
import { sanitizeString, isValidUUID } from '../utils/validators';
import supabase from '../config/supabase';

export const membershipController = {
  /**
   * GET /api/membership/count
   * Public endpoint: returns count of approved members
   */
  async getApprovedCount(_req: Request, res: Response): Promise<void> {
    try {
      const { count, error } = await supabase
        .from('membership_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      if (error) {
        logger.error('Error counting approved members', error);
        res.status(500).json({ success: false, message: 'Failed to count members' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Count fetched',
        data: { count: count || 0 },
      });
    } catch (error: any) {
      logger.error('Get approved count failed', error);
      res.status(500).json({ success: false, message: 'Failed to get count' });
    }
  },

  /**
   * POST /api/membership/apply
   * Submit a membership application (public or authenticated)
   */
  async apply(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, email, academic_year, interests } = req.body;

      // Validate required fields
      if (!full_name || !email || !academic_year || !interests) {
        res.status(400).json({
          success: false,
          message: 'All fields are required: full_name, email, academic_year, interests',
        });
        return;
      }

      // Validate academic_year
      const year = Number(academic_year);
      if (!Number.isInteger(year) || year < 1 || year > 4) {
        res.status(400).json({
          success: false,
          message: 'Academic year must be between 1 and 4',
        });
        return;
      }

      // Check for existing application
      const userId = req.user?.userId;
      const existing = await membershipService.findExisting(email, userId);

      if (existing) {
        const statusMsg =
          existing.status === 'pending'
            ? 'You already have a pending application. We\'ll get back to you soon!'
            : 'Your application has already been approved!';
        res.status(409).json({
          success: false,
          message: statusMsg,
          data: { status: existing.status },
        });
        return;
      }

      // Submit
      const application = await membershipService.submit({
        user_id: userId,
        full_name: sanitizeString(full_name),
        email: sanitizeString(email),
        academic_year: year,
        interests: sanitizeString(interests),
      });

      // Log activity if authenticated
      if (userId) {
        activityService.log({
          userId,
          action: 'MEMBERSHIP_APPLICATION',
          entityType: 'membership',
          entityId: application.id,
          ipAddress: req.ip,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully! We\'ll review it soon.',
        data: application,
      });
    } catch (error: any) {
      logger.error('Membership application failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
      });
    }
  },

  /**
   * GET /api/membership/status?email=...
   * Check application status by email (public)
   */
  async checkStatus(req: Request, res: Response): Promise<void> {
    try {
      const email = req.query.email as string;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      const application = await membershipService.getStatusByEmail(email);

      res.status(200).json({
        success: true,
        message: application ? 'Application found' : 'No application found',
        data: application,
      });
    } catch (error: any) {
      logger.error('Check membership status failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check status',
      });
    }
  },

  /**
   * GET /api/membership (admin)
   * Get all applications
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const applications = await membershipService.getAll();

      res.status(200).json({
        success: true,
        message: 'Applications fetched',
        data: applications,
      });
    } catch (error: any) {
      logger.error('Fetch all applications failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
      });
    }
  },

  /**
   * PATCH /api/membership/:id/status
   * Admin approves/rejects an application
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid application ID',
        });
        return;
      }

      if (!['approved', 'rejected'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be "approved" or "rejected"',
        });
        return;
      }

      const updated = await membershipService.updateStatus(
        id,
        status,
        req.user!.userId
      );

      // If approved and user_id exists, promote user role to 'member'
      if (status === 'approved' && updated.user_id) {
        const { error: roleErr } = await supabase
          .from('users')
          .update({ role: 'member' })
          .eq('id', updated.user_id)
          .in('role', ['student']); // only promote students, don't downgrade admins
        if (roleErr) {
          logger.warn('Failed to promote user role on membership approval', roleErr);
        }
      }

      activityService.log({
        userId: req.user!.userId,
        action: `MEMBERSHIP_${status.toUpperCase()}`,
        entityType: 'membership',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Application ${status}`,
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update application status failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application',
      });
    }
  },
};
