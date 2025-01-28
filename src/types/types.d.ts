import type { NextFunction, Request } from "express";

export interface CustomError extends Error{
  status: number;
  message: string;
}


export type ErrorHander = (err: CustomError, req: Request, next: NextFunction)=> void;