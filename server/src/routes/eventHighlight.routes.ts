import { Router, Request, Response } from 'express';
import { eventHighlightService } from '../services/eventHighlight.service';
import { activityService } from '../services/activity.service';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { isValidUUID } from '../utils/validators';
import { logger } from '../utils/logger';

const router = Router();

// ============================================
// PUBLIC
// ============================================

/**
 * GET /api/event-highlights/event/:eventId — By event UUID
 */
router.get('/event/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!isValidUUID(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const highlights = await eventHighlightService.getByEventId(eventId);

    if (!highlights) {
      res.status(404).json({
        success: false,
        message: 'Highlights not available for this event',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Highlights fetched',
      data: highlights,
    });
  } catch (error: any) {
    logger.error('Get highlights by event ID failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights',
    });
  }
});

/**
 * GET /api/event-highlights/slug/:slug — By event slug (with event data)
 */
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const result = await eventHighlightService.getByEventSlug(slug);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Event or highlights not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Event with highlights fetched',
      data: result,
    });
  } catch (error: any) {
    logger.error('Get highlights by slug failed', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch highlights',
    });
  }
});

// ============================================
// ADMIN ONLY
// ============================================

/**
 * GET /api/event-highlights/admin/all — All highlights (admin)
 */
router.get(
  '/admin/all',
  authenticate,
  authorize('admin'),
  async (_req: Request, res: Response) => {
    try {
      const highlights = await eventHighlightService.getAll();
      res.status(200).json({
        success: true,
        message: 'All highlights fetched',
        data: highlights,
      });
    } catch (error: any) {
      logger.error('Get all highlights failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch highlights',
      });
    }
  }
);

/**
 * POST /api/event-highlights — Create highlights (admin)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response) => {
    try {
      const {
        event_id,
        summary,
        stats,
        photos,
        key_takeaways,
        testimonial_text,
        testimonial_author,
      } = req.body;

      if (!event_id || !summary || !stats) {
        res.status(400).json({
          success: false,
          message: 'event_id, summary, and stats are required',
        });
        return;
      }

      if (!isValidUUID(event_id)) {
        res.status(400).json({ success: false, message: 'Invalid event ID' });
        return;
      }

      const created = await eventHighlightService.create({
        event_id,
        summary,
        stats,
        photos: photos || [],
        key_takeaways: key_takeaways || [],
        testimonial_text: testimonial_text || undefined,
        testimonial_author: testimonial_author || undefined,
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'CREATE_EVENT_HIGHLIGHTS',
        entityType: 'event_highlight',
        entityId: created.id,
        metadata: { event_id },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Highlights created',
        data: created,
      });
    } catch (error: any) {
      logger.error('Create highlights failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create highlights',
      });
    }
  }
);

/**
 * PUT /api/event-highlights/:id — Update highlights (admin)
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

      const existing = await eventHighlightService.getById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: 'Highlights not found' });
        return;
      }

      const {
        summary,
        stats,
        photos,
        key_takeaways,
        testimonial_text,
        testimonial_author,
      } = req.body;

      const updates: Record<string, any> = {};
      if (summary !== undefined) updates.summary = summary;
      if (stats !== undefined) updates.stats = stats;
      if (photos !== undefined) updates.photos = photos;
      if (key_takeaways !== undefined) updates.key_takeaways = key_takeaways;
      if (testimonial_text !== undefined) updates.testimonial_text = testimonial_text;
      if (testimonial_author !== undefined) updates.testimonial_author = testimonial_author;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ success: false, message: 'No fields to update' });
        return;
      }

      const updated = await eventHighlightService.update(id, updates);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_EVENT_HIGHLIGHTS',
        entityType: 'event_highlight',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Highlights updated',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update highlights failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update highlights',
      });
    }
  }
);

/**
 * DELETE /api/event-highlights/:id — Delete highlights (admin)
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

      await eventHighlightService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_EVENT_HIGHLIGHTS',
        entityType: 'event_highlight',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Highlights deleted',
      });
    } catch (error: any) {
      logger.error('Delete highlights failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete highlights',
      });
    }
  }
);

export default router;
