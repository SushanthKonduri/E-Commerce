import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, mergeGuestCart } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.post('/merge', mergeGuestCart);

export default router;
