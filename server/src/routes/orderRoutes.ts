import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrdersAdmin, updateOrderStatusAdmin } from '../controllers/orderController';
import { authenticateToken, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/checkout', createOrder);
router.get('/my-orders', requireAuth, getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

// Admin order routes
router.get('/admin/all', requireAdmin, getAllOrdersAdmin);
router.patch('/admin/:id/status', requireAdmin, updateOrderStatusAdmin);

export default router;
