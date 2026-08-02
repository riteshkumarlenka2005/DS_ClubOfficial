import { Router, Request, Response } from 'express';
import multer from 'multer';
import { teamService } from '../services/team.service';
import { activityService } from '../services/activity.service';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { sanitizeString, isValidUUID } from '../utils/validators';
import { logger } from '../utils/logger';
import supabase from '../config/supabase';

// Multer: keep file in memory (we stream straight to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

const router = Router();

// ============================================
// PUBLIC
// ============================================

/**
 * GET /api/team — Visible team members
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const members = await teamService.getVisible();
    res.status(200).json({
      success: true,
      message: 'Team members fetched',
      data: members,
    });
  } catch (error: any) {
    logger.error('Get team failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team members',
    });
  }
});

// ============================================
// MEMBER / ADMIN — Self-service team profile
// ============================================

/**
 * GET /api/team/me — Get own team member profile (matched by email)
 */
router.get(
  '/me',
  authenticate,
  authorize('member', 'admin'),
  async (req: Request, res: Response) => {
    try {
      const userEmail = req.user!.email;
      const teamMember = await teamService.findByEmail(userEmail);

      if (!teamMember) {
        res.status(404).json({
          success: false,
          message: 'No team member profile found linked to your email. Ask an admin to set your email in the team members list.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Team profile found',
        data: teamMember,
      });
    } catch (error: any) {
      logger.error('Get team/me failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch team profile',
      });
    }
  }
);

/**
 * PUT /api/team/me/avatar — Upload a photo file as team avatar
 * Accepts multipart/form-data with field name "avatar"
 */
router.put(
  '/me/avatar',
  authenticate,
  authorize('member', 'admin'),
  upload.single('avatar'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided. Please select an image.',
        });
        return;
      }

      const userEmail = req.user!.email;
      const teamMember = await teamService.findByEmail(userEmail);

      if (!teamMember) {
        res.status(404).json({
          success: false,
          message: 'No team member profile linked to your email.',
        });
        return;
      }

      // Build a unique file path in the avatars bucket
      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const filePath = `team/${teamMember.id}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage (upsert so re-uploads overwrite)
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        logger.error('Supabase storage upload failed', uploadErr);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to storage',
        });
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Save URL to team_members table
      const updated = await teamService.updateAvatar(teamMember.id, publicUrl);

      // Sync avatar to users table so profile stays in sync
      try {
        await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('email', userEmail);
        logger.info(`Synced team avatar to users table for ${userEmail}`);
      } catch (syncErr) {
        logger.warn('Failed to sync avatar to users table', syncErr);
      }

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_TEAM_AVATAR',
        entityType: 'team_member',
        entityId: teamMember.id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Team avatar updated successfully',
        data: updated,
      });
    } catch (error: any) {
      // Handle multer file-size / type errors
      if (error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5 MB.',
        });
        return;
      }
      if (error.message?.includes('Only JPEG')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }
      logger.error('Update team avatar failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update team avatar',
      });
    }
  }
);

// ============================================
// ADMIN ONLY
// ============================================

/**
 * GET /api/team/admin/all — All team members (admin)
 */
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  async (_req: Request, res: Response) => {
    try {
      const members = await teamService.getAll();
      res.status(200).json({
        success: true,
        message: 'All team members fetched',
        data: members,
      });
    } catch (error: any) {
      logger.error('Get all team failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch team members',
      });
    }
  }
);

/**
 * POST /api/team — Create team member (admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const {
        name,
        student_id,
        role,
        department,
        tier,
        sub_category,
        bio,
        avatar_url,
        img_seed,
        linkedin_url,
        github_url,
        instagram_url,
        email,
        display_order,
      } = req.body;

      if (!name || !student_id || !role || !department || !tier) {
        res.status(400).json({
          success: false,
          message: 'Name, student ID, role, department, and tier are required',
        });
        return;
      }

      const validDepts = ['leadership', 'technical', 'management', 'creative'];
      const validTiers = ['lead', 'head', 'core', 'co-member'];

      if (!validDepts.includes(department)) {
        res.status(400).json({
          success: false,
          message: `Invalid department. Must be: ${validDepts.join(', ')}`,
        });
        return;
      }

      if (!validTiers.includes(tier)) {
        res.status(400).json({
          success: false,
          message: `Invalid tier. Must be: ${validTiers.join(', ')}`,
        });
        return;
      }

      if (
        sub_category &&
        !['social', 'design', 'video'].includes(sub_category)
      ) {
        res.status(400).json({
          success: false,
          message: 'Invalid sub_category. Must be: social, design, or video',
        });
        return;
      }

      const member = await teamService.create({
        name: sanitizeString(name),
        student_id: sanitizeString(student_id),
        role: sanitizeString(role),
        department,
        tier,
        sub_category: sub_category || null,
        bio: bio ? sanitizeString(bio) : undefined,
        avatar_url: avatar_url || undefined,
        img_seed: img_seed || undefined,
        linkedin_url: linkedin_url || undefined,
        github_url: github_url || undefined,
        instagram_url: instagram_url || undefined,
        email: email || undefined,
        display_order: display_order || 0,
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'CREATE_TEAM_MEMBER',
        entityType: 'team_member',
        entityId: member.id,
        metadata: { name: member.name },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Team member created',
        data: member,
      });
    } catch (error: any) {
      logger.error('Create team member failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create team member',
      });
    }
  }
);

/**
 * PUT /api/team/:id — Update team member (admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const existing = await teamService.getById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
        return;
      }

      const {
        name,
        student_id,
        role,
        department,
        tier,
        sub_category,
        bio,
        avatar_url,
        img_seed,
        linkedin_url,
        github_url,
        instagram_url,
        email,
        display_order,
      } = req.body;

      const updates: Record<string, any> = {};

      if (name) updates.name = sanitizeString(name);
      if (student_id) updates.student_id = sanitizeString(student_id);
      if (role) updates.role = sanitizeString(role);
      if (department) updates.department = department;
      if (tier) updates.tier = tier;
      if (sub_category !== undefined) updates.sub_category = sub_category;
      if (bio !== undefined) updates.bio = bio ? sanitizeString(bio) : null;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (img_seed !== undefined) updates.img_seed = img_seed;
      if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
      if (github_url !== undefined) updates.github_url = github_url;
      if (instagram_url !== undefined) updates.instagram_url = instagram_url;
      if (email !== undefined) updates.email = email;
      if (display_order !== undefined) updates.display_order = display_order;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
        return;
      }

      const updated = await teamService.update(id, updates);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_TEAM_MEMBER',
        entityType: 'team_member',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Team member updated',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update team member failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update team member',
      });
    }
  }
);

/**
 * PATCH /api/team/:id/visibility — Toggle visibility (admin)
 */
router.patch(
  '/:id/visibility',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { is_visible } = req.body;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      if (typeof is_visible !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'is_visible must be boolean',
        });
        return;
      }

      const updated = await teamService.toggleVisibility(id, is_visible);

      res.status(200).json({
        success: true,
        message: `Team member ${is_visible ? 'visible' : 'hidden'}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to update visibility',
      });
    }
  }
);

/**
 * DELETE /api/team/:id — Delete team member (admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const existing = await teamService.getById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
        return;
      }

      await teamService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_TEAM_MEMBER',
        entityType: 'team_member',
        entityId: id,
        metadata: { name: existing.name },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Team member deleted',
      });
    } catch (error: any) {
      logger.error('Delete team member failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete team member',
      });
    }
  }
);

export default router;

