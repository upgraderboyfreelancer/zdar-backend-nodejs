import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { PrismaClient, UserRole } from '@prisma/client';
import createHttpError from 'http-errors';
import asyncHandler from '../lib';
const secret = process.env.JWT_SECRET! || "YOUR_SECRET";
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
export const authenticate = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from cookies or headers
    const token = req.cookies?.authToken || req.headers.authorization?.split(" ")[1];
    console.log(`token => ${token}`)
    if (!token) {
      throw createHttpError(401, {message: 'Authentication required'});
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      throw createHttpError(404, {message: 'User not found'});
    }

    // Attach the decoded user info to the request object
    req.user = decoded;

    next();
  } catch (error) {
    throw createHttpError(401, {message: 'Invalid token'})
  }
})

// Middleware to authorize specific roles
export const authorize = (...roles: UserRole[]) => {
  console.log(`authorize => ${roles}`)
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw createHttpError(401, {message: 'Authentication required'})
    }
    if (!roles.includes(req.user.role)) {
      throw createHttpError(403, {message: 'Unauthorized'})
    }
    next();
  };
};
