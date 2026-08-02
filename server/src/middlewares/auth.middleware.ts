import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { authService } from '../services/auth.service';
import { logger } from '../utils/logger';

/**
 * Authenticate middleware
 * Verifies JWT from Authorization header or cookie
 * Attaches user payload to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
      return;
    }

    // Verify JWT
    const payload = verifyToken(token);

    // Verify user still exists and is active
    const user = await authService.findById(payload.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found or deactivated.',
      });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated.',
      });
      return;
    }

    // Attach fresh role from DB (not from token — prevents stale roles)
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    logger.error('Authentication failed', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}