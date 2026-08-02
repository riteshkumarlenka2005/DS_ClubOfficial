import { Router, Request, Response } from 'express';
import { alumniService } from '../services/alumni.service';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/alumni — Visible alumni (public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const alumni = await alumniService.getVisible();
    res.status(200).json({
      success: true,
      message: 'Alumni fetched',
      data: alumni,
    });
  } catch (error: any) {
    logger.error('Get alumni failed', error);
    res.status(500).json({ success: false, message: 'Failed to fetch alumni' });
  }
});

export default router;

