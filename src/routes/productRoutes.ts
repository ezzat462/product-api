import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateMongoId,
  validateProductQuery
} from '../middlewares/validate';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes: Browsing products
router.get('/', validateProductQuery, getAllProducts);
router.get('/:id', validateMongoId, getProductById);

// Protected routes: Authenticated users can create/update
router.post('/', protect, validateCreateProduct, createProduct);
router.put('/:id', protect, validateUpdateProduct, updateProduct);
router.patch('/:id', protect, validateUpdateProduct, updateProduct);

// Admin-only route: Only admins can delete products
router.delete('/:id', protect, restrictTo('admin'), validateMongoId, deleteProduct);

export default router;
