import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'railflow_secret';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name: string; role: string };
    req.user = decoded;
    next();
  } catch (err: any) {
    // 👇 This will tell us exactly WHY the token is failing
    console.error('❌ JWT Verification Failed:', err.message); 
    
    // Auto-clear the dead cookie so the browser stops sending it
    res.clearCookie('auth_token'); 
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};