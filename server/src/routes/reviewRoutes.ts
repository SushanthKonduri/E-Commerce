import { Router } from 'express';
import { createReview, deleteReview } from '../controllers/reviewController';
import { authenticateToken, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireAuth);

router.post('/', createReview);
router.delete('/:id', deleteReview);

export default router;
