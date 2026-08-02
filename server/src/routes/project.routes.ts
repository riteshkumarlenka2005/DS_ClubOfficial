import { Router, Request, Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/jwt';
import { authService } from '../services/auth.service';

const router = Router();

// Optional auth helper
async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token && req.cookies?.token) token = req.cookies.token;
    if (token) {
      const payload = verifyToken(token);
      const user = await authService.findById(payload.userId);
      if (user?.is_active) {
        req.user = { userId: user.id, email: user.email, role: user.role };
      }
    }
  } catch { /* silent */ }
  next();
}

// GET /api/projects — Published projects (public)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const projects = await projectService.getPublished();
    res.status(200).json({
      success: true,
      message: 'Projects fetched',
      data: projects,
    });
  } catch (error: any) {
    logger.error('Get projects failed', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:slug — Single project (public)
router.get('/:slug', optionalAuth, async (req: Request, res: Response) => {
  try {
    const project = await projectService.getBySlug(req.params.slug);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const isPrivileged = req.user?.role === 'admin';
    if (project.status !== 'published' && !isPrivileged) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Project fetched',
      data: project,
    });
  } catch (error: any) {
    logger.error('Get project failed', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
});

export default router;
