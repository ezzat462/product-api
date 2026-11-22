import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, any>
): Response => {
  return res.status(statusCode).json({
    status: 'success',
    ...(meta ? { meta } : {}),
    data
  });
};

export const sendFail = (
  res: Response,
  data: any,
  statusCode = 400
): Response => {
  return res.status(statusCode).json({
    status: 'fail',
    data
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
): Response => {
  return res.status(statusCode).json({
    status: 'error',
    message
  });
};
