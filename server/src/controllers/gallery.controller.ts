import { Request, Response } from 'express';
import { galleryService } from '../services/gallery.service';
import { activityService } from '../services/activity.service';
import { isValidUUID } from '../utils/validators';
import { logger } from '../utils/logger';

export const galleryController = {
  /**
   * GET /api/gallery — Approved cover items (public)
   */
  async getApproved(_req: Request, res: Response): Promise<void> {
    try {
      const items = await galleryService.getApproved();
      res.status(200).json({
        success: true,
        message: 'Gallery fetched',
        data: items,
      });
    } catch (error: any) {
      logger.error('Get gallery failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch gallery' });
    }
  },

  /**
   * GET /api/gallery/:id/photos — Approved sub-photos for a cover (public)
   */
  async getSubPhotos(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const items = await galleryService.getSubPhotos(id);
      res.status(200).json({
        success: true,
        message: 'Sub-photos fetched',
        data: items,
      });
    } catch (error: any) {
      logger.error('Get sub-photos failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch sub-photos' });
    }
  },

  /**
   * GET /api/gallery/manage/all — All items (admin)
   */
  async getAllItems(req: Request, res: Response): Promise<void> {
    try {
      let items;
      if (req.user!.role === 'admin') {
        items = await galleryService.getAll();
      } else {
        items = await galleryService.getByUploader(req.user!.userId);
      }

      res.status(200).json({
        success: true,
        message: 'Gallery items fetched',
        data: items,
      });
    } catch (error: any) {
      logger.error('Get all gallery failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch gallery' });
    }
  },

  /**
   * GET /api/gallery/pending — Pending items (admin)
   */
  async getPending(_req: Request, res: Response): Promise<void> {
    try {
      const items = await galleryService.getPending();
      res.status(200).json({
        success: true,
        message: 'Pending items fetched',
        data: items,
      });
    } catch (error: any) {
      logger.error('Get pending gallery failed', error);
      res.status(500).json({ success: false, message: 'Failed to fetch pending items' });
    }
  },

  /**
   * POST /api/gallery — Upload gallery item (member/admin)
   */
  async uploadItem(req: Request, res: Response): Promise<void> {
    try {
      const { title, image_url, description, event_id, parent_id, is_cover } = req.body;

      if (!image_url) {
        res.status(400).json({
          success: false,
          message: 'Image URL is required',
        });
        return;
      }

      if (event_id && !isValidUUID(event_id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

      if (parent_id && !isValidUUID(parent_id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid parent ID',
        });
        return;
      }

      // If parent_id is provided, verify the parent exists
      let parentTitle = '';
      if (parent_id) {
        const parent = await galleryService.getById(parent_id);
        if (!parent) {
          res.status(404).json({
            success: false,
            message: 'Parent cover photo not found. Upload a cover photo first.',
          });
          return;
        }
        parentTitle = parent.title || 'Photo';
      }

      const item = await galleryService.create({
        title: title || parentTitle || 'Untitled',
        image_url,
        description: description || undefined,
        event_id: event_id || undefined,
        uploaded_by: req.user!.userId,
        parent_id: parent_id || undefined,
        is_cover: is_cover || false,
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'UPLOAD_GALLERY',
        entityType: 'gallery',
        entityId: item.id,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: parent_id
          ? 'Sub-photo uploaded — pending approval'
          : 'Gallery item uploaded — pending approval',
        data: item,
      });
    } catch (error: any) {
      logger.error('Upload gallery failed', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to upload' });
    }
  },

  /**
   * PATCH /api/gallery/:id/approve — Approve (admin)
   */
  async approveItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const item = await galleryService.approve(id, req.user!.userId);

      activityService.log({
        userId: req.user!.userId,
        action: 'APPROVE_GALLERY',
        entityType: 'gallery',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Gallery item approved',
        data: item,
      });
    } catch (error: any) {
      logger.error('Approve gallery failed', error);
      res.status(500).json({ success: false, message: 'Failed to approve' });
    }
  },

  /**
   * PATCH /api/gallery/bulk-approve — Bulk approve (admin)
   */
  async bulkApproveItems(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ success: false, message: 'Provide an array of IDs' });
        return;
      }

      const count = await galleryService.bulkApprove(ids, req.user!.userId);

      res.status(200).json({
        success: true,
        message: `${count} item${count !== 1 ? 's' : ''} approved`,
        data: { count },
      });
    } catch (error: any) {
      logger.error('Bulk approve failed', error);
      res.status(500).json({ success: false, message: error.message || 'Failed to bulk approve' });
    }
  },

  /**
   * PATCH /api/gallery/:id/reject — Reject (admin)
   */
  async rejectItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const item = await galleryService.reject(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'REJECT_GALLERY',
        entityType: 'gallery',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Gallery item rejected',
        data: item,
      });
    } catch (error: any) {
      logger.error('Reject gallery failed', error);
      res.status(500).json({ success: false, message: 'Failed to reject' });
    }
  },

  /**
   * DELETE /api/gallery/:id — Delete (admin or uploader)
   */
  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
        return;
      }

      const existing = await galleryService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Item not found' });
        return;
      }

      // Members can only delete their own pending items
      if (req.user!.role === 'member') {
        if (existing.uploaded_by !== req.user!.userId) {
          res.status(403).json({
            success: false,
            message: 'You can only delete your own uploads',
          });
          return;
        }
      }

      await galleryService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_GALLERY',
        entityType: 'gallery',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Gallery item deleted',
      });
    } catch (error: any) {
      logger.error('Delete gallery failed', error);
      res.status(500).json({ success: false, message: 'Failed to delete' });
    }
    
  },
};