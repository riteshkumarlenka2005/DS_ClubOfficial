import { Request, Response } from 'express';
import { blogService } from '../services/blog.service';
import { activityService } from '../services/activity.service';
import { generateSlug } from '../utils/generateSlug';
import { sanitizeString, isValidUUID } from '../utils/validators';
import { logger } from '../utils/logger';

export const blogController = {
  /**
   * GET /api/blogs — Published blogs (public)
   */
  async getPublishedBlogs(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const blogs = await blogService.getPublished(category);
      res.status(200).json({
        success: true,
        message: 'Blogs fetched',
        data: blogs,
      });
    } catch (error: any) {
      logger.error('Get blogs failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
    }
  },

  /**
   * GET /api/blogs/:slug — Single blog by slug
   */
  async getBlogBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const blog = await blogService.getBySlug(slug);

      if (!blog) {
        res.status(404).json({ success: false, message: 'Blog not found' });
        return;
      }

      const isPrivileged =
        req.user && (req.user.role === 'member' || req.user.role === 'admin');

      if (blog.status !== 'published' && !isPrivileged) {
        res.status(404).json({ success: false, message: 'Blog not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Blog fetched',
        data: blog,
      });
    } catch (error: any) {
      logger.error('Get blog failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch blog' });
    }
  },

  /**
   * GET /api/blogs/manage/all — All blogs (member sees own, admin sees all)
   */
  async getAllBlogs(req: Request, res: Response): Promise<void> {
    try {
      let blogs;
      if (req.user!.role === 'admin') {
        blogs = await blogService.getAll();
      } else {
        blogs = await blogService.getByAuthor(req.user!.userId);
      }

      res.status(200).json({
        success: true,
        message: 'Blogs fetched',
        data: blogs,
      });
    } catch (error: any) {
      logger.error('Get all blogs failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch blogs' });
    }
  },

    /**
   * GET /api/blogs/meta/categories — Get available categories
   */
  async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await blogService.getCategories();
      res.status(200).json({
        success: true,
        message: 'Categories fetched',
        data: categories,
      });
    } catch (error: any) {
      logger.error('Get categories failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
  },

  /**
   * POST /api/blogs — Create blog draft (member/admin)
   */
  async createBlog(req: Request, res: Response): Promise<void> {
    try {
      const {
        title, content, excerpt, cover_image, tags,
        video_url, category, duration, event_id
      } = req.body;

      const strippedContent = content ? content.replace(/<[^>]*>?/gm, '').trim() : '';

      if (!title || title.trim() === '' || !content || strippedContent === '') {
        res.status(400).json({
          success: false,
          message: 'Title and content cannot be empty',
        });
        return;
      }

      const slug = generateSlug(title);

      const blog = await blogService.create({
        title: sanitizeString(title),
        slug,
        content,
        excerpt: excerpt ? sanitizeString(excerpt) : undefined,
        cover_image: cover_image || undefined,
        author_id: req.user!.userId,
        tags: tags || [],
        video_url: video_url || undefined,
        category: category || undefined,
        duration: duration || undefined,
        is_user_upload: true,
        event_id: event_id || undefined,
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'CREATE_BLOG',
        entityType: 'blog',
        entityId: blog.id,
        metadata: { title: blog.title },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Blog draft created',
        data: blog,
      });
    } catch (error: any) {
      logger.error('Create blog failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create blog',
      });
    }
  },

  /**
   * PUT /api/blogs/:id — Update blog
   */
  async updateBlog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog ID' });
        return;
      }

      const existing = await blogService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Blog not found' });
        return;
      }

      // Members can only edit own drafts
      if (req.user!.role === 'member') {
        if (existing.author_id !== req.user!.userId) {
          res.status(403).json({
            success: false,
            message: 'You can only edit your own blogs',
          });
          return;
        }
        if (existing.status !== 'draft') {
          res.status(403).json({
            success: false,
            message: 'You can only edit draft blogs',
          });
          return;
        }
      }

      const { title, content, excerpt, cover_image, tags, video_url, category, duration } = req.body;

      const updates: Record<string, any> = {};
      if (title) {
        updates.title = sanitizeString(title);
        updates.slug = generateSlug(title);
      }
      if (content) updates.content = content;
      if (excerpt !== undefined) updates.excerpt = sanitizeString(excerpt);
      if (cover_image !== undefined) updates.cover_image = cover_image;
      if (tags !== undefined) updates.tags = tags;
      if (video_url !== undefined) updates.video_url = video_url;
      if (category !== undefined) updates.category = category;
      if (duration !== undefined) updates.duration = duration;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, message: 'No fields to update' });
        return;
      }

      const updated = await blogService.update(id, updates);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_BLOG',
        entityType: 'blog',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Blog updated',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update blog failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update blog',
      });
    }
  },

  /**
   * DELETE /api/blogs/:id — Delete blog
   * Members can delete own drafts, admin can delete any
   */
  async deleteBlog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog ID' });
        return;
      }

      const existing = await blogService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Blog not found' });
        return;
      }

      if (req.user!.role === 'member') {
        if (existing.author_id !== req.user!.userId) {
          res.status(403).json({
            success: false,
            message: 'You can only delete your own blogs',
          });
          return;
        }
        if (existing.status !== 'draft') {
          res.status(403).json({
            success: false,
            message: 'You can only delete draft blogs',
          });
          return;
        }
      }

      await blogService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_BLOG',
        entityType: 'blog',
        entityId: id,
        metadata: { title: existing.title },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Blog deleted',
      });
    } catch (error: any) {
      logger.error('Delete blog failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog',
      });
    }
  },

  /**
   * PATCH /api/blogs/:id/publish — Publish (admin)
   */
  async publishBlog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog ID' });
        return;
      }

      const blog = await blogService.publish(id, req.user!.userId);

      activityService.log({
        userId: req.user!.userId,
        action: 'PUBLISH_BLOG',
        entityType: 'blog',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Blog published',
        data: blog,
      });
    } catch (error: any) {
      logger.error('Publish blog failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish blog',
      });
    }
  },

  /**
   * PATCH /api/blogs/:id/unpublish
   */
  async unpublishBlog(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid blog ID' });
        return;
      }

      const blog = await blogService.unpublish(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'UNPUBLISH_BLOG',
        entityType: 'blog',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Blog unpublished',
        data: blog,
      });
    } catch (error: any) {
      logger.error('Unpublish blog failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unpublish blog',
      });
    }
  },
};