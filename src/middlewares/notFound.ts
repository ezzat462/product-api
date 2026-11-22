import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
};
