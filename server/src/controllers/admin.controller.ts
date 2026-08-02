import { Request, Response } from 'express';
import { activityService } from '../services/activity.service';
import { projectService } from '../services/project.service';
import { alumniService } from '../services/alumni.service';
import { generateSlug } from '../utils/generateSlug';
import { sanitizeString, isValidUUID } from '../utils/validators';
import { logger } from '../utils/logger';

export const adminController = {
  // ============================================
  // ACTIVITY LOG
  // ============================================
  async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const logs = await activityService.getAll(limit, offset);

      res.status(200).json({
        success: true,
        message: 'Activity logs fetched',
        data: logs,
      });
    } catch (error: any) {
      logger.error('Get activity logs failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs',
      });
    }
  },

  // ============================================
  // PROJECTS (Admin CRUD)
  // ============================================
  async getProjects(_req: Request, res: Response): Promise<void> {
    try {
      const projects = await projectService.getAll();
      res.status(200).json({
        success: true,
        message: 'Projects fetched',
        data: projects,
      });
    } catch (error: any) {
      logger.error('Get projects failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch projects' });
    }
  },

  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        short_description,
        tech_stack,
        github_url,
        live_url,
        image_url,
      } = req.body;

      if (!title || !description) {
        res.status(400).json({
          success: false,
          message: 'Title and description are required',
        });
        return;
      }

      const slug = generateSlug(title);

      const project = await projectService.create({
        title: sanitizeString(title),
        slug,
        description: sanitizeString(description),
        short_description: short_description
          ? sanitizeString(short_description)
          : undefined,
        tech_stack: tech_stack || [],
        github_url: github_url || undefined,
        live_url: live_url || undefined,
        image_url: image_url || undefined,
        created_by: req.user!.userId,
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: project.id,
        metadata: { title },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Project created',
        data: project,
      });
    } catch (error: any) {
      logger.error('Create project failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create project',
      });
    }
  },

  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid project ID' });
        return;
      }

      const existing = await projectService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const {
        title,
        description,
        short_description,
        tech_stack,
        github_url,
        live_url,
        image_url,
      } = req.body;

      const updates: Record<string, any> = {};
      if (title) {
        updates.title = sanitizeString(title);
        updates.slug = generateSlug(title);
      }
      if (description) updates.description = sanitizeString(description);
      if (short_description !== undefined)
        updates.short_description = sanitizeString(short_description);
      if (tech_stack !== undefined) updates.tech_stack = tech_stack;
      if (github_url !== undefined) updates.github_url = github_url;
      if (live_url !== undefined) updates.live_url = live_url;
      if (image_url !== undefined) updates.image_url = image_url;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, message: 'No fields to update' });
        return;
      }

      const updated = await projectService.update(id, updates);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_PROJECT',
        entityType: 'project',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Project updated',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update project failed', error);
      res.status(500).json({ success: false, message: 'Failed to update project' });
    }
  },

  async publishProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const project = await projectService.publish(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'PUBLISH_PROJECT',
        entityType: 'project',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Project published',
        data: project,
      });
    } catch (error: any) {
      logger.error('Publish project failed', error);
      res.status(500).json({ success: false, message: 'Failed to publish project' });
    }
  },

  async unpublishProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const project = await projectService.unpublish(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'UNPUBLISH_PROJECT',
        entityType: 'project',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Project unpublished',
        data: project,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to unpublish project' });
    }
  },

  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const existing = await projectService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      await projectService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_PROJECT',
        entityType: 'project',
        entityId: id,
        metadata: { title: existing.title },
        ipAddress: req.ip,
      });

      res.status(200).json({ success: true, message: 'Project deleted' });
    } catch (error: any) {
      logger.error('Delete project failed', error);
      res.status(500).json({ success: false, message: 'Failed to delete project' });
    }
  },

  // ============================================
  // ALUMNI (Admin CRUD)
  // ============================================
  async getAllAlumni(_req: Request, res: Response): Promise<void> {
    try {
      const alumni = await alumniService.getAll();
      res.status(200).json({
        success: true,
        message: 'Alumni fetched',
        data: alumni,
      });
    } catch (error: any) {
      logger.error('Get alumni failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch alumni' });
    }
  },

    async createAlumni(req: Request, res: Response): Promise<void> {
    try {
      const {
        full_name,
        email,
        batch_year,
        department,
        company,
        designation,
        linkedin_url,
        github_url,
        avatar_url,
        testimonial,
        skills,
        bg_color,
        img_seed,
        display_order,
      } = req.body;

      if (!full_name || !batch_year) {
        res.status(400).json({
          success: false,
          message: 'Full name and batch year are required',
        });
        return;
      }

      const alumni = await alumniService.create({
        full_name: sanitizeString(full_name),
        email: email || undefined,
        batch_year,
        department: department ? sanitizeString(department) : undefined,
        company: company ? sanitizeString(company) : undefined,
        designation: designation ? sanitizeString(designation) : undefined,
        linkedin_url: linkedin_url || undefined,
        github_url: github_url || undefined,
        avatar_url: avatar_url || undefined,
        testimonial: testimonial ? sanitizeString(testimonial) : undefined,
        skills: skills || [],
        bg_color: bg_color || undefined,
        img_seed: img_seed || undefined,
        display_order: display_order || 0,
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'CREATE_ALUMNI',
        entityType: 'alumni',
        entityId: alumni.id,
        metadata: { full_name },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Alumni created',
        data: alumni,
      });
    } catch (error: any) {
      logger.error('Create alumni failed', error);
      res.status(500).json({ success: false, message: 'Failed to create alumni' });
    }
  },

  async updateAlumni(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const existing = await alumniService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Alumni not found' });
        return;
      }

      const {
        full_name, email, batch_year, department, company,
        designation, linkedin_url, github_url, avatar_url, testimonial,
        skills, bg_color, img_seed, display_order,
      } = req.body;

      const updates: Record<string, any> = {};
      if (full_name) updates.full_name = sanitizeString(full_name);
      if (email !== undefined) updates.email = email;
      if (batch_year !== undefined) updates.batch_year = batch_year;
      if (department !== undefined) updates.department = sanitizeString(department);
      if (company !== undefined) updates.company = sanitizeString(company);
      if (designation !== undefined) updates.designation = sanitizeString(designation);
      if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url;
      if (github_url !== undefined) updates.github_url = github_url;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;
      if (testimonial !== undefined) updates.testimonial = sanitizeString(testimonial);
      if (skills !== undefined) updates.skills = skills;
      if (bg_color !== undefined) updates.bg_color = bg_color;
      if (img_seed !== undefined) updates.img_seed = img_seed;
      if (display_order !== undefined) updates.display_order = display_order;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, message: 'No fields to update' });
        return;
      }

      const updated = await alumniService.update(id, updates);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_ALUMNI',
        entityType: 'alumni',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Alumni updated',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update alumni failed', error);
      res.status(500).json({ success: false, message: 'Failed to update alumni' });
    }
  },

  async toggleAlumniVisibility(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const existing = await alumniService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Alumni not found' });
        return;
      }

      const updated = await alumniService.toggleVisibility(id, !existing.is_visible);

      activityService.log({
        userId: req.user!.userId,
        action: 'TOGGLE_ALUMNI_VISIBILITY',
        entityType: 'alumni',
        entityId: id,
        metadata: { is_visible: !existing.is_visible },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Alumni ${updated.is_visible ? 'shown' : 'hidden'}`,
        data: updated,
      });
    } catch (error: any) {
      logger.error('Toggle alumni visibility failed', error);
      res.status(500).json({ success: false, message: 'Failed to toggle visibility' });
    }
  },

  async deleteAlumni(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      await alumniService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_ALUMNI',
        entityType: 'alumni',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({ success: true, message: 'Alumni deleted' });
    } catch (error: any) {
      logger.error('Delete alumni failed', error);
      res.status(500).json({ success: false, message: 'Failed to delete alumni' });
    }
  },

  // ============================================
  // DASHBOARD STATS
  // ============================================
  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const [users, events, blogs, projects, gallery, alumni] =
        await Promise.all([
          supabaseCount('users'),
          supabaseCount('events'),
          supabaseCount('blogs'),
          supabaseCount('projects'),
          supabaseCount('gallery'),
          supabaseCount('alumni'),
        ]);

      const [publishedEvents, publishedBlogs, pendingGallery, pendingMemberships, approvedMemberships] =
        await Promise.all([
          supabaseCount('events', { publish_status: 'published' }),
          supabaseCount('blogs', { status: 'published' }),
          supabaseCount('gallery', { status: 'draft' }),
          supabaseCount('membership_applications', { status: 'pending' }),
          supabaseCount('membership_applications', { status: 'approved' }),
        ]);

      res.status(200).json({
        success: true,
        message: 'Stats fetched',
        data: {
          total_users: users,
          total_events: events,
          total_blogs: blogs,
          total_projects: projects,
          total_gallery: gallery,
          total_alumni: alumni,
          published_events: publishedEvents,
          published_blogs: publishedBlogs,
          pending_gallery: pendingGallery,
          pending_memberships: pendingMemberships,
          approved_memberships: approvedMemberships,
        },
      });
    } catch (error: any) {
      logger.error('Get stats failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stats',
      });
    }
  },
};

// Helper function to count rows
import supabase from '../config/supabase';

async function supabaseCount(
  table: string,
  filters?: Record<string, string>
): Promise<number> {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  const { count, error } = await query;

  if (error) {
    logger.error(`Count error for ${table}`, error);
    return 0;
  }

  return count || 0;
}

