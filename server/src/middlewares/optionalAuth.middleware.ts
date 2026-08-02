import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { authService } from '../services/auth.service';

/**
 * Optional authentication middleware
 * Attaches user to request if valid token exists
 * Does NOT block the request if no token
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const payload = verifyToken(token);
      const user = await authService.findById(payload.userId);
      if (user && user.is_active) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
      }
    }
  } catch {
    // Silently continue — user remains unauthenticated
  }
  next();
}

