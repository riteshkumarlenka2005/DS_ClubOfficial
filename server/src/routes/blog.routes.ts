import { Router, Request, Response } from 'express';
import multer from 'multer';
import { blogController } from '../controllers/blog.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { optionalAuth } from '../middlewares/optionalAuth.middleware';
import { logger } from '../utils/logger';
import supabase from '../config/supabase';

// Multer: image upload — 5 MB max
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  },
});

// Multer: video upload — 50 MB max, common video types
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'video/mp4', 'video/webm', 'video/ogg',
      'video/quicktime', 'video/x-msvideo',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only MP4, WebM, OGG, MOV, and AVI videos are allowed'));
    }
  },
});

const router = Router();

// PUBLIC
router.get('/', blogController.getPublishedBlogs);
router.get('/meta/categories', blogController.getCategories);
router.get('/:slug', optionalAuth, blogController.getBlogBySlug);

// MEMBER & ADMIN
router.get(
  '/manage/all',
  authenticate,
  authorize('member', 'admin'),
  blogController.getAllBlogs
);

router.post(
  '/',
  authenticate,
  authorize('member', 'admin'),
  blogController.createBlog
);

router.put(
  '/:id',
  authenticate,
  authorize('member', 'admin'),
  blogController.updateBlog
);

router.delete(
  '/:id',
  authenticate,
  authorize('member', 'admin'),
  blogController.deleteBlog
);

// POST /api/blogs/upload-cover — Upload blog cover image
router.post(
  '/upload-cover',
  authenticate,
  authorize('member', 'admin'),
  imageUpload.single('cover'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided. Please select an image.',
        });
        return;
      }

      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const filePath = `covers/${req.user!.userId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('blog-images')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        logger.error('Blog cover upload failed', uploadErr);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to storage',
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        data: { url: urlData.publicUrl },
      });
    } catch (err) {
      logger.error('Blog cover upload error', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

// POST /api/blogs/upload-video — Upload blog video file
router.post(
  '/upload-video',
  authenticate,
  authorize('member', 'admin'),
  videoUpload.single('video'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No video file provided. Please select a video.',
        });
        return;
      }

      const ext = req.file.originalname.split('.').pop() || 'mp4';
      const filePath = `videos/${req.user!.userId}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage (blog-videos bucket)
      const { error: uploadErr } = await supabase.storage
        .from('blog-videos')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        logger.error('Blog video upload failed', uploadErr);
        res.status(500).json({
          success: false,
          message: 'Failed to upload video to storage',
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('blog-videos')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        data: { url: urlData.publicUrl },
      });
    } catch (err) {
      logger.error('Blog video upload error', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

// ADMIN ONLY
router.patch(
  '/:id/publish',
  authenticate,
  authorize('admin'),
  blogController.publishBlog
);

router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('admin'),
  blogController.unpublishBlog
);

export default router;
