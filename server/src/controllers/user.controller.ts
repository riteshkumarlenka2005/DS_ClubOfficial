import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { activityService } from '../services/activity.service';
import { logger } from '../utils/logger';
import { isValidUUID, sanitizeString } from '../utils/validators';
import { UserRole } from '../types';

// Super admin — role cannot be changed by anyone, account cannot be deactivated
const SUPER_ADMIN_EMAIL = '24cse143.riteshkumarlenka@giet.edu';

export const userController = {
  /**
   * GET /api/users/profile
   * Get own profile
   */
  async getOwnProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getProfile(req.user!.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile fetched',
        data: user,
      });
    } catch (error: any) {
      logger.error('Get profile failed', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
      });
    }
  },

  /**
   * PUT /api/users/profile
   * Update own profile
   */
  async updateOwnProfile(req: Request, res: Response): Promise<void> {
    try {
      const { full_name, bio, department, batch_year, github_url, linkedin_url, portfolio_url } =
        req.body;

      const updates: Record<string, any> = {};

      if (full_name) updates.full_name = sanitizeString(full_name);
      if (bio !== undefined) updates.bio = sanitizeString(bio);
      if (department !== undefined)
        updates.department = sanitizeString(department);
      if (batch_year !== undefined) updates.batch_year = batch_year;
      if (github_url !== undefined) updates.github_url = github_url;
      if (linkedin_url !== undefined)
        updates.linkedin_url = linkedin_url;
      if (portfolio_url !== undefined) updates.portfolio_url = portfolio_url;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
        return;
      }

      const updated = await userService.updateProfile(
        req.user!.userId,
        updates
      );

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_PROFILE',
        entityType: 'user',
        entityId: req.user!.userId,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update profile failed', error);
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
      });
    }
  },

  /**
   * GET /api/users (admin only)
   * Get all users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        success: true,
        message: 'Users fetched',
        data: users,
      });
    } catch (error: any) {
      logger.error('Get all users failed', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
      });
    }
  },

  /**
   * PATCH /api/users/:id/role (admin only)
   * Update user role
   */
  async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }

      const validRoles: UserRole[] = ['student', 'member', 'admin'];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          message: `Invalid role. Must be: ${validRoles.join(', ')}`,
        });
        return;
      }

      // Prevent admin from demoting themselves
      if (id === req.user!.userId) {
        res.status(400).json({
          success: false,
          message: 'Cannot change your own role',
        });
        return;
      }

      // Protect super admin — no one can change their role
      const targetUser = await userService.getProfile(id);
      if (targetUser?.email === SUPER_ADMIN_EMAIL) {
        res.status(403).json({
          success: false,
          message: 'Cannot modify the super admin role',
        });
        return;
      }

      const updated = await userService.updateRole(id, role);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_ROLE',
        entityType: 'user',
        entityId: id,
        metadata: { newRole: role },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Role updated to ${role}`,
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update role failed', error);
      res.status(500).json({
        success: false,
        message: 'Error updating role',
      });
    }
  },

  /**
   * PATCH /api/users/:id/status (admin only)
   * Activate/deactivate user
   */
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
        return;
      }

      if (typeof is_active !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'is_active must be a boolean',
        });
        return;
      }

      if (id === req.user!.userId) {
        res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account',
        });
        return;
      }

      // Protect super admin — cannot be deactivated
      const targetUser = await userService.getProfile(id);
      if (targetUser?.email === SUPER_ADMIN_EMAIL) {
        res.status(403).json({
          success: false,
          message: 'Cannot deactivate the super admin account',
        });
        return;
      }

      const updated = await userService.toggleActive(id, is_active);

      activityService.log({
        userId: req.user!.userId,
        action: is_active ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
        entityType: 'user',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'}`,
        data: updated,
      });
    } catch (error: any) {
      logger.error('Toggle status failed', error);
      res.status(500).json({
        success: false,
        message: 'Error updating user status',
      });
    }
  },
};

