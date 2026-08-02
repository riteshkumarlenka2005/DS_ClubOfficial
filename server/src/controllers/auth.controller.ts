import { Request, Response } from 'express';
import { verifyGoogleToken } from '../config/google';
import { authService } from '../services/auth.service';
import { activityService } from '../services/activity.service';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const authController = {
  /**
   * POST /api/auth/google
   * Handles Google login — verifies token, upserts user, returns JWT
   */
  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({
          success: false,
          message: 'Google ID token is required.',
        });
        return;
      }

      // Step 1: Verify Google ID token
      const googleUser = await verifyGoogleToken(idToken);

      logger.info(`Google auth verified for: ${googleUser.email}`);

      // Step 2: Upsert user in database
      const user = await authService.upsertUser({
        google_id: googleUser.googleId,
        email: googleUser.email,
        full_name: googleUser.fullName,
        avatar_url: googleUser.avatarUrl,
      });

      // Step 3: Check if user is active
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Contact admin.',
        });
        return;
      }

      // Step 4: Generate internal JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Step 5: Log activity (non-blocking)
      activityService.log({
        userId: user.id,
        action: 'LOGIN',
        entityType: 'auth',
        ipAddress: req.ip,
      });

      // Step 6: Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Step 7: Return response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            role: user.role,
          },
          token, // Also send token in body for localStorage option
        },
      });
    } catch (error: any) {
      logger.error('Google login failed', error.message);

      const statusCode = error.message.includes('Only @')
        ? 403
        : error.message.includes('verification failed')
          ? 401
          : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Authentication failed',
      });
    }
  },

  /**
   * GET /api/auth/me
   * Returns current authenticated user
   * Requires: authenticate middleware
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const user = await authService.findById(req.user.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          role: user.role,
          bio: user.bio,
          department: user.department,
          batch_year: user.batch_year,
          github_url: user.github_url,
          linkedin_url: user.linkedin_url,
          portfolio_url: user.portfolio_url,
          created_at: user.created_at,
        },
      });
    } catch (error: any) {
      logger.error('Get me failed', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user data',
      });
    }
  },

  /**
   * POST /api/auth/logout
   * Clears the auth cookie
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (req.user) {
        activityService.log({
          userId: req.user.userId,
          action: 'LOGOUT',
          entityType: 'auth',
          ipAddress: req.ip,
        });
      }

      res.clearCookie('token', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  },
};

