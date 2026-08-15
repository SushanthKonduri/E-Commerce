import { Router } from 'express';
import { getWishlist, toggleWishlistItem } from '../controllers/wishlistController';
import { authenticateToken, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlistItem);

export default router;
