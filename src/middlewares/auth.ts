import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { User, UserRole, IUserPayload } from '../models/userModel';

interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please provide a valid bearer token to get access.', 401));
  }

  const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your authentication token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid authentication token. Please log in again.', 401));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = {
    id: currentUser._id.toString(),
    email: currentUser.email,
    role: currentUser.role
  };

  next();
});

export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};
