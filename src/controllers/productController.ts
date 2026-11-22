import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/productModel';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/sendResponse';

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  // 1. Pagination parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  // 2. Build filter query
  const queryObj: Record<string, any> = {};

  if (req.query.category) {
    queryObj.category = { $regex: req.query.category as string, $options: 'i' };
  }

  if (req.query.search) {
    queryObj.name = { $regex: req.query.search as string, $options: 'i' };
  }

  if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
    queryObj.price = {};
    if (req.query.minPrice !== undefined) {
      queryObj.price.$gte = parseFloat(req.query.minPrice as string);
    }
    if (req.query.maxPrice !== undefined) {
      queryObj.price.$lte = parseFloat(req.query.maxPrice as string);
    }
  }

  // 3. Sorting
  let sortBy = '-createdAt';
  if (req.query.sort) {
    sortBy = (req.query.sort as string).split(',').join(' ');
  }

  // 4. Execution
  const [total, products] = await Promise.all([
    Product.countDocuments(queryObj),
    Product.find(queryObj)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email role')
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  sendSuccess(res, products, 200, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  });
});

export const getProductById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findById(req.params.id).populate('createdBy', 'name email role');

  if (!product) {
    return next(new AppError('Product not found with the requested ID', 404));
  }

  sendSuccess(res, product);
});

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const productData = {
    ...req.body,
    ...(req.user ? { createdBy: req.user.id } : {})
  };

  const product = await Product.create(productData);
  sendSuccess(res, product, 201);
});

export const updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!product) {
    return next(new AppError('Product not found with the requested ID', 404));
  }

  sendSuccess(res, product);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('Product not found with the requested ID', 404));
  }

  sendSuccess(res, { message: 'Product deleted successfully', id: req.params.id });
});
