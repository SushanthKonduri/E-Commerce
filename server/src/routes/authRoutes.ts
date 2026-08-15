import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, getMe, forgotPassword, verifyOtp, resetPassword, registerSchema, loginSchema, refreshTokenSchema } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticateToken, requireAuth } from '../middleware/auth';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: 'Too many auth attempts, please try again later.' },
});

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, requireAuth, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
