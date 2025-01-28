import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import db from './prisma';

const SECRET = process.env.JWT_SECRET!
interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export const signJwt = (userId: string, role: UserRole, email: string): string => {
  console.log("jwtsign", SECRET)
  return jwt.sign({ userId, role, email }, SECRET, { expiresIn: '1d' });
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET) as JwtPayload;
};

export const getRoleBasedId = async (userId: string, role: UserRole): Promise<string | null> => {
  if (role === UserRole.USER) {
    const candidate = await db.candidate.findUnique({ where: { userId } });
    return candidate?.id || null;
  } else if (role === UserRole.COMPANY) {
    const company = await db.company.findUnique({ where: { userId } });
    return company?.id || null;
  }
  return null;
};


