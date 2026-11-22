import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { validateRegister, validateLogin } from '../middlewares/validate';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;
