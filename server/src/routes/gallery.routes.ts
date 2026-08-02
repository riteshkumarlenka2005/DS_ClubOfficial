import { Router, Request, Response } from 'express';
import multer from 'multer';
import { galleryController } from '../controllers/gallery.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { logger } from '../utils/logger';
import supabase from '../config/supabase';

// Multer: image upload — 5 MB max
const upload = multer({
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

const router = Router();

// PUBLIC
router.get('/', galleryController.getApproved);
router.get('/:id/photos', galleryController.getSubPhotos);

// MEMBER & ADMIN
router.get(
  '/manage/all',
  authenticate,
  authorize('member', 'admin'),
  galleryController.getAllItems
);

router.post(
  '/',
  authenticate,
  authorize('member', 'admin'),
  galleryController.uploadItem
);

// POST /api/gallery/upload-image — Upload gallery image file
router.post(
  '/upload-image',
  authenticate,
  authorize('member', 'admin'),
  upload.single('image'),
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
      const filePath = `uploads/${req.user!.userId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        logger.error('Gallery image upload failed', uploadErr);
        res.status(500).json({
          success: false,
          message: 'Failed to upload image to storage',
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      res.json({
        success: true,
        data: { url: urlData.publicUrl },
      });
    } catch (err) {
      logger.error('Gallery image upload error', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize('member', 'admin'),
  galleryController.deleteItem
);

// ADMIN ONLY
router.get(
  '/pending',
  authenticate,
  authorize('admin'),
  galleryController.getPending
);

router.patch(
  '/bulk-approve',
  authenticate,
  authorize('admin'),
  galleryController.bulkApproveItems
);

router.patch(
  '/:id/approve',
  authenticate,
  authorize('admin'),
  galleryController.approveItem
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize('admin'),
  galleryController.rejectItem
);

export default router;

