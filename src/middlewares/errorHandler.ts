import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(message, 400);
  }

  // Handle Mongoose Duplicate Key (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    const message = `Duplicate value '${value}' for '${field}'. Please use another value.`;
    error = new AppError(message, 409);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((el: any) => el.message);
    const message = `Validation error: ${messages.join('. ')}`;
    error = new AppError(message, 400);
  }

  // Handle JSON parsing syntax error
  if (err instanceof SyntaxError && 'body' in err) {
    error = new AppError('Malformed JSON in request body.', 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';

  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('INTERNAL SERVER ERROR 💥:', err);
  }

  res.status(statusCode).json({
    status,
    message: error.message || 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};
