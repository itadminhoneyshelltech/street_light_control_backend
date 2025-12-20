import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

export interface AuthRequest extends Express.Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    city: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId: string, email: string, role: string, city: string) => {
  return jwt.sign(
    { id: userId, email, role, city },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
