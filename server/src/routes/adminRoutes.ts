import { Router } from 'express';
import { getDashboardStats, getUsersAdmin, updateUserRoleAdmin, updateUserAdmin, deleteUserAdmin, getInventoryLogsAdmin } from '../controllers/adminController';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../controllers/orderController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsersAdmin);
router.put('/users/:id', updateUserAdmin);
router.patch('/users/:id', updateUserAdmin);
router.put('/users/:id/role', updateUserRoleAdmin);
router.patch('/users/:id/role', updateUserRoleAdmin);
router.delete('/users/:id', deleteUserAdmin);

router.get('/inventory-logs', getInventoryLogsAdmin);

// Admin order management
router.get('/orders', getAllOrdersAdmin);
router.put('/orders/:id/status', updateOrderStatusAdmin);

export default router;
