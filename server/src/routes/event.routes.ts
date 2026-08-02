import { Router, Request, Response } from 'express';
import multer from 'multer';
import { eventController } from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { optionalAuth } from '../middlewares/optionalAuth.middleware';
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
// PUBLIC ROUTES
// ============================================

// GET /api/events — Published events
router.get('/', eventController.getPublishedEvents);

// GET /api/events/:slug — Single event by slug
// Optionally authenticated (to check registration status)
router.get('/:slug', optionalAuth, eventController.getEventBySlug);

// ============================================
// AUTHENTICATED ROUTES (any logged-in user)
// ============================================

// POST /api/events/:id/register — Register for event
router.post('/:id/register', authenticate, eventController.registerForEvent);

// DELETE /api/events/:id/register — Cancel registration
router.delete(
  '/:id/register',
  authenticate,
  eventController.cancelRegistration
);

// GET /api/events/user/my-registrations — My registrations
router.get(
  '/user/my-registrations',
  authenticate,
  eventController.getMyRegistrations
);

// ============================================
// MEMBER & ADMIN ROUTES
// ============================================

// GET /api/events/manage/all — All events with drafts
router.get(
  '/manage/all',
  authenticate,
  authorize('member', 'admin'),
  eventController.getAllEvents
);

// POST /api/events — Create event draft
router.post(
  '/',
  authenticate,
  authorize('member', 'admin'),
  eventController.createEvent
);

// PUT /api/events/:id — Update event
router.put(
  '/:id',
  authenticate,
  authorize('member', 'admin'),
  eventController.updateEvent
);

// GET /api/events/:id/registrations — Event registrations
router.get(
  '/:id/registrations',
  authenticate,
  authorize('member', 'admin'),
  eventController.getEventRegistrations
);

// POST /api/events/upload-cover — Upload event cover image
router.post(
  '/upload-cover',
  authenticate,
  authorize('member', 'admin'),
  upload.single('cover'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided. Please select an image.',
        });
        return;
      }

      // Build a unique file path in the event-covers bucket
      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const filePath = `covers/${req.user!.userId}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadErr } = await supabase.storage
        .from('event-covers')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        logger.error('Event cover upload failed', uploadErr);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to storage',
        });
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('event-covers')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        data: { url: urlData.publicUrl },
      });
    } catch (err) {
      logger.error('Event cover upload error', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// PATCH /api/events/:id/publish
router.patch(
  '/:id/publish',
  authenticate,
  authorize('admin'),
  eventController.publishEvent
);

// PATCH /api/events/:id/unpublish
router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('admin'),
  eventController.unpublishEvent
);

// PATCH /api/events/:id/cancel
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('admin'),
  eventController.cancelEvent
);

// DELETE /api/events/:id
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  eventController.deleteEvent
);

export default router;

// ============================================


