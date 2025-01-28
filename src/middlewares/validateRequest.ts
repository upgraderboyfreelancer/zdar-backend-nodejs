import type { Request, Response, NextFunction } from 'express';
import type { ZodError, ZodSchema } from 'zod';

import type { UserRole } from '@prisma/client';
import createHttpError from 'http-errors';

export const validateRequest = (defaultSchema: ZodSchema,
  roleSpecificSchemas?: Partial<Record<UserRole, ZodSchema>>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body, req.params)
    try {
      const userRole = req.user?.role; // Replace with actual role extraction logic
      const schema = roleSpecificSchemas?.[userRole!] || defaultSchema;
      const data = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      console.log(`validated fields: `, data)
      return next();
    } catch (error) {
      const zodError = error as ZodError;
      console.log(zodError)
      next(createHttpError(400, zodError.errors[0]))
    }
  };