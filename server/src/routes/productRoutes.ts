import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

// Admin product endpoints
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id', authenticateToken, requireAdmin, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);
router.post('/upload', authenticateToken, requireAdmin, upload.single('image'), uploadProductImage);

export default router;
