import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Define the expected JWT payload (match your sign-in token payload)
interface AuthPayload extends JwtPayload {
  id: string;  // Or '_id' if using MongoDB ObjectId.toString()
  // Add other claims if needed, e.g., role: string;
}

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?:string | AuthPayload;
  userId?: string;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Guard: Ensure secret is set
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not set in environment variables');
    res.status(500).json({ message: 'Server configuration error' });
    return;  // Early exit without returning res (void now)
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided. Please log in' });
    return;
  }

  const token = header.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: 'Token is missing after "Bearer "' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    req.userId = decoded.id;  // Assumes 'id' in payload; fallback to decoded._id if needed
    next();
  } catch (err: unknown) {
    // Safely narrow: Check if it's an Error before accessing .name
    let message = 'Invalid token. Please log in again.';
    if (err instanceof Error) {
      if (err.name === 'TokenExpiredError') {
        message = 'Token has expired. Please log in again.';
      } else if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token signature. Please log in again.';
      }
    }
    res.status(401).json({ message });
    return;  // Early exit
  }
};

export default authMiddleware;