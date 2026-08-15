import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { productId, rating, comment, title } = req.body;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Verified purchaser check
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        items: {
          some: { productId },
        },
      },
    });

    if (!existingOrder) {
      res.status(403).json({ message: 'Only verified purchasers of this product can submit a review' });
      return;
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      res.status(400).json({ message: 'You have already reviewed this product' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: parseInt(rating, 10),
        comment,
        title,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update product rating and review count
    const allReviews = await prisma.review.findMany({
      where: { productId },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / allReviews.length) * 10) / 10;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding review' });
  }
};

export const deleteReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (req.user?.role !== 'ADMIN' && review.userId !== req.user?.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const productId = review.productId;
    await prisma.review.delete({ where: { id } });

    // Recalculate product rating
    const remainingReviews = await prisma.review.findMany({ where: { productId } });
    const totalRating = remainingReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = remainingReviews.length > 0 ? Math.round((totalRating / remainingReviews.length) * 10) / 10 : 5.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: remainingReviews.length,
      },
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting review' });
  }
};
