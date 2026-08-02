import { Request, Response } from 'express';
import { eventService } from '../services/event.service';
import { activityService } from '../services/activity.service';
import { generateSlug } from '../utils/generateSlug';
import { sanitizeString, isValidUUID } from '../utils/validators';
import { logger } from '../utils/logger';

export const eventController = {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  /**
   * GET /api/events
   * Get published events (public)
   */
  async getPublishedEvents(_req: Request, res: Response): Promise<void> {
    try {
      const events = await eventService.getPublished();

      // Attach registration count to each event
      const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
          const count = await eventService.getRegistrationCount(event.id);
          return { ...event, registration_count: count };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Events fetched',
        data: eventsWithCounts,
      });
    } catch (error: any) {
      logger.error('Get published events failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
      });
    }
  },

  /**
   * GET /api/events/:slug
   * Get single event by slug (public)
   */
  async getEventBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const event = await eventService.getBySlug(slug);

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      // Only return published events to public
      // If user is member/admin, they can see any status
      const isPrivileged =
        req.user && (req.user.role === 'member' || req.user.role === 'admin');

      if (event.status !== 'upcoming' && event.status !== 'ongoing' && !isPrivileged) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      const registrationCount = await eventService.getRegistrationCount(
        event.id
      );

      // Check if current user is registered
      let isRegistered = false;
      if (req.user) {
        const reg = await eventService.checkRegistration(
          event.id,
          req.user.userId
        );
        isRegistered = !!reg;
      }

      res.status(200).json({
        success: true,
        message: 'Event fetched',
        data: {
          ...event,
          registration_count: registrationCount,
          is_registered: isRegistered,
        },
      });
    } catch (error: any) {
      logger.error('Get event by slug failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch event',
      });
    }
  },

  // ============================================
  // AUTHENTICATED ENDPOINTS
  // ============================================

  /**
   * POST /api/events/:id/register
   * Register for event (any authenticated user)
   */
  async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

      const registration = await eventService.register(
        id,
        req.user!.userId
      );

      activityService.log({
        userId: req.user!.userId,
        action: 'REGISTER_EVENT',
        entityType: 'event',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Successfully registered for event',
        data: registration,
      });
    } catch (error: any) {
      logger.error('Event registration failed', error);
      const status = error.message.includes('not found')
        ? 404
        : error.message.includes('Already') ||
            error.message.includes('full')
          ? 409
          : 500;

      res.status(status).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  },

  /**
   * DELETE /api/events/:id/register
   * Cancel event registration
   */
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

      await eventService.cancelRegistration(id, req.user!.userId);

      activityService.log({
        userId: req.user!.userId,
        action: 'CANCEL_REGISTRATION',
        entityType: 'event',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Registration cancelled',
      });
    } catch (error: any) {
      logger.error('Cancel registration failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel registration',
      });
    }
  },

  /**
   * GET /api/events/my-registrations
   * Get current user's registrations
   */
  async getMyRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const registrations = await eventService.getUserRegistrations(
        req.user!.userId
      );

      res.status(200).json({
        success: true,
        message: 'Registrations fetched',
        data: registrations,
      });
    } catch (error: any) {
      logger.error('Get my registrations failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations',
      });
    }
  },

  // ============================================
  // MEMBER/ADMIN ENDPOINTS
  // ============================================

  /**
   * GET /api/events/all
   * Get all events including drafts (member/admin)
   */
  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      let events;

      if (req.user!.role === 'admin') {
        events = await eventService.getAll();
      } else {
        // Members see only their own events
        events = await eventService.getByCreator(req.user!.userId);
      }

      res.status(200).json({
        success: true,
        message: 'Events fetched',
        data: events,
      });
    } catch (error: any) {
      logger.error('Get all events failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
      });
    }
  },

  /**
   * POST /api/events
   * Create event draft (member/admin)
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        description,
        short_description,
        event_date,
        end_date,
        venue,
        cover_image,
        max_participants,
        event_type,
      } = req.body;

      // Validation
      if (!title || !description || !event_date) {
        res.status(400).json({
          success: false,
          message: 'Title, description, and event date are required',
        });
        return;
      }

      // Validate event date based on event_type
      const eventDateObj = new Date(event_date);
      const now = new Date();

      if (event_type === 'past') {
        // Past event: event_date must be in the past
        if (eventDateObj >= now) {
          res.status(400).json({
            success: false,
            message: 'Past event date must be in the past',
          });
          return;
        }
        if (end_date && new Date(end_date) >= now) {
          res.status(400).json({
            success: false,
            message: 'Past event end date must also be in the past',
          });
          return;
        }
      } else {
        // Upcoming event (default): event_date must be in the future
        if (eventDateObj < now) {
          res.status(400).json({
            success: false,
            message: 'Upcoming event date must be in the future',
          });
          return;
        }
      }

      const slug = generateSlug(title);

      const event = await eventService.create({
        title: sanitizeString(title),
        slug,
        description: sanitizeString(description),
        short_description: short_description
          ? sanitizeString(short_description)
          : undefined,
        event_date,
        end_date: end_date || undefined,
        venue: venue ? sanitizeString(venue) : undefined,
        cover_image: cover_image || undefined,
        max_participants: max_participants || undefined,
        created_by: req.user!.userId,
        event_type: event_type === 'past' ? 'past' : 'upcoming',
      });

      activityService.log({
        userId: req.user!.userId,
        action: 'CREATE_EVENT',
        entityType: 'event',
        entityId: event.id,
        metadata: { title: event.title },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Event draft created',
        data: event,
      });
    } catch (error: any) {
      logger.error('Create event failed', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create event',
      });
    }
  },

  /**
   * PUT /api/events/:id
   * Update event (creator or admin)
   */
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

      // Check if event exists
      const existing = await eventService.getById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      // Members can only edit their own drafts
      if (req.user!.role === 'member') {
        if (existing.created_by !== req.user!.userId) {
          res.status(403).json({
            success: false,
            message: 'You can only edit your own events',
          });
          return;
        }
        if (existing.status !== 'upcoming') {
          res.status(403).json({
            success: false,
            message: 'You can only edit upcoming events',
          });
          return;
        }
      }

      const {
        title,
        description,
        short_description,
        event_date,
        end_date,
        venue,
        cover_image,
        max_participants,
      } = req.body;

      const updates: Record<string, any> = {};
      if (title) {
        updates.title = sanitizeString(title);
        updates.slug = generateSlug(title);
      }
      if (description) updates.description = sanitizeString(description);
      if (short_description !== undefined)
        updates.short_description = sanitizeString(short_description);
      if (event_date) updates.event_date = event_date;
      if (end_date !== undefined) updates.end_date = end_date;
      if (venue !== undefined)
        updates.venue = sanitizeString(venue);
      if (cover_image !== undefined) updates.cover_image = cover_image;
      if (max_participants !== undefined)
        updates.max_participants = max_participants;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
        return;
      }

      const updated = await eventService.update(id, updates);

      activityService.log({
        userId: req.user!.userId,
        action: 'UPDATE_EVENT',
        entityType: 'event',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Event updated',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Update event failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update event',
      });
    }
  },

  /**
   * GET /api/events/:id/registrations
   * Get event registrations (member/admin)
   */
  async getEventRegistrations(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

      // Members can only see registrations for their own events
      if (req.user!.role === 'member') {
        const event = await eventService.getById(id);
        if (!event || event.created_by !== req.user!.userId) {
          res.status(403).json({
            success: false,
            message: 'You can only view registrations for your own events',
          });
          return;
        }
      }

      const registrations = await eventService.getRegistrations(id);
      const count = await eventService.getRegistrationCount(id);

      res.status(200).json({
        success: true,
        message: 'Registrations fetched',
        data: { registrations, total: count },
      });
    } catch (error: any) {
      logger.error('Get registrations failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations',
      });
    }
  },

  // ============================================
  // ADMIN ONLY ENDPOINTS
  // ============================================

  /**
   * PATCH /api/events/:id/publish
   * Publish event (admin only)
   */
  async publishEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({
          success: false,
          message: 'Invalid event ID',
        });
        return;
      }

      const event = await eventService.getById(id);
      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found',
        });
        return;
      }

      const published = await eventService.publish(id, req.user!.userId);

      activityService.log({
        userId: req.user!.userId,
        action: 'PUBLISH_EVENT',
        entityType: 'event',
        entityId: id,
        metadata: { title: event.title },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Event published',
        data: published,
      });
    } catch (error: any) {
      logger.error('Publish event failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish event',
      });
    }
  },

  /**
   * PATCH /api/events/:id/unpublish
   */
  async unpublishEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid event ID' });
        return;
      }

      const event = await eventService.unpublish(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'UNPUBLISH_EVENT',
        entityType: 'event',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Event unpublished',
        data: event,
      });
    } catch (error: any) {
      logger.error('Unpublish event failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unpublish event',
      });
    }
  },

  /**
   * PATCH /api/events/:id/cancel
   */
  async cancelEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid event ID' });
        return;
      }

      const event = await eventService.cancel(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'CANCEL_EVENT',
        entityType: 'event',
        entityId: id,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Event cancelled',
        data: event,
      });
    } catch (error: any) {
      logger.error('Cancel event failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel event',
      });
    }
  },

  /**
   * DELETE /api/events/:id
   * Delete event (admin only)
   */
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        res.status(400).json({ success: false, message: 'Invalid event ID' });
        return;
      }

      const event = await eventService.getById(id);
      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      await eventService.delete(id);

      activityService.log({
        userId: req.user!.userId,
        action: 'DELETE_EVENT',
        entityType: 'event',
        entityId: id,
        metadata: { title: event.title },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Event deleted permanently',
      });
    } catch (error: any) {
      logger.error('Delete event failed', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete event',
      });
    }
  },
};

