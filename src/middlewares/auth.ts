import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { PrismaClient, UserRole } from '@prisma/client';
import createHttpError from 'http-errors';
const secret = process.env.JWT_SECRET! || "1234";
const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware to authenticate using token from cookies
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from cookies
    const token = req.cookies?.authToken;
    console.log(`token => ${token}`)
    if (!token) {
      throw createHttpError(401, 'Authentication required');
    }

    // Verify the token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Check if the user exists in the database
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    // Attach the decoded user info to the request object
    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    throw createHttpError(401, 'Invalid token')
  }
};

// Middleware to authorize specific roles
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createHttpError(401, 'Authentication required')
    }

    if (!roles.includes(req.user.role)) {
      throw createHttpError(403, 'Unauthorized')
    }

    next();
  };
};

