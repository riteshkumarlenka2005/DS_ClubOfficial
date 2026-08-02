import { Router, Request, Response } from 'express';
import multer from 'multer';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
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

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize('admin'));

// DASHBOARD
router.get('/stats', adminController.getDashboardStats);

// ACTIVITY LOGS
router.get('/activity-logs', adminController.getActivityLogs);

// PROJECTS
router.get('/projects', adminController.getProjects);
router.post('/projects', adminController.createProject);
router.put('/projects/:id', adminController.updateProject);
router.patch('/projects/:id/publish', adminController.publishProject);
router.patch('/projects/:id/unpublish', adminController.unpublishProject);
router.delete('/projects/:id', adminController.deleteProject);

// Ensure a storage bucket exists, creating it if needed
async function ensureBucket(name: string): Promise<void> {
  const { error } = await supabase.storage.getBucket(name);
  if (error) {
    logger.info(`Bucket "${name}" not found — creating it`);
    const { error: createErr } = await supabase.storage.createBucket(name, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });
    if (createErr && !createErr.message?.includes('already exists')) {
      logger.error(`Failed to create bucket "${name}"`, createErr);
      throw createErr;
    }
  }
}

// POST /api/admin/projects/upload-image — Upload project image
router.post(
  '/projects/upload-image',
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

      // Try project-images bucket first, fall back to gallery bucket
      const ext = req.file.originalname.split('.').pop() || 'jpg';
      const filePath = `projects/${req.user!.userId}/${Date.now()}.${ext}`;
      let bucketName = 'project-images';

      try {
        await ensureBucket(bucketName);
      } catch {
        // If we can't create project-images, fall back to gallery bucket
        logger.warn('Cannot create project-images bucket, falling back to gallery');
        bucketName = 'gallery';
      }

      const { error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadErr) {
        logger.error('Project image upload failed', uploadErr);
        res.status(500).json({
          success: false,
          message: `Failed to upload image: ${uploadErr.message}`,
        });
        return;
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      res.json({
        success: true,
        data: { url: urlData.publicUrl },
      });
    } catch (err: any) {
      logger.error('Project image upload error', err);
      res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
    }
  }
);

// ALUMNI
router.get('/alumni', adminController.getAllAlumni);
router.post('/alumni', adminController.createAlumni);
router.put('/alumni/:id', adminController.updateAlumni);
router.patch('/alumni/:id/visibility', adminController.toggleAlumniVisibility);
router.delete('/alumni/:id', adminController.deleteAlumni);

export default router;
