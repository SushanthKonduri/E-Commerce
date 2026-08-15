import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '12', 10);
    const search = req.query.search as string || '';
    const category = req.query.category as string || '';
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const inStockOnly = req.query.inStock === 'true';
    const isFeatured = req.query.featured === 'true';
    const isNew = req.query.isNew === 'true';
    const sortBy = (req.query.sortBy as string) || 'newest';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    if (inStockOnly) {
      where.stock = { gt: 0 };
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isNew) {
      where.isNew = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price-asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
    else if (sortBy === 'rating') orderBy = { rating: 'desc' };
    else if (sortBy === 'popularity') orderBy = { reviewCount: 'desc' };
    else if (sortBy === 'newest') orderBy = { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true, isPrimary: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching products' });
  }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Get related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      take: 4,
      include: {
        category: { select: { name: true, slug: true } },
        images: { select: { url: true, isPrimary: true } },
      },
    });

    res.json({ product, relatedProducts });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching product details' });
  }
};

export const createProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, originalPrice, stock, sku, categoryId, isFeatured, isNew, images } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock: parseInt(stock, 10),
        sku,
        categoryId,
        isFeatured: Boolean(isFeatured),
        isNew: Boolean(isNew),
        images: {
          create: images && Array.isArray(images)
            ? images.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
                url: img.url,
                isPrimary: img.isPrimary || index === 0,
              }))
            : [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', isPrimary: true }],
        },
      },
      include: { category: true, images: true },
    });

    // Create inventory audit log
    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        changeType: 'RESTOCK',
        quantityChange: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reason: 'Initial stock creation',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating product' });
  }
};

export const updateProduct = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, originalPrice, stock, sku, categoryId, isFeatured, isNew, images } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const newStock = stock !== undefined ? parseInt(stock, 10) : existingProduct.stock;
    const stockDifference = newStock - existingProduct.stock;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(stock !== undefined && { stock: newStock }),
        ...(sku && { sku }),
        ...(categoryId && { categoryId }),
        ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
        ...(isNew !== undefined && { isNew: Boolean(isNew) }),
      },
      include: { category: true, images: true },
    });

    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((img: { url: string; isPrimary?: boolean }, index: number) => ({
          productId: id,
          url: img.url,
          isPrimary: img.isPrimary || index === 0,
        })),
      });
    }

    if (stockDifference !== 0) {
      await prisma.inventoryLog.create({
        data: {
          productId: id,
          changeType: stockDifference > 0 ? 'RESTOCK' : 'ADJUSTMENT',
          quantityChange: stockDifference,
          previousStock: existingProduct.stock,
          newStock,
          reason: 'Manual stock adjustment by admin',
          createdBy: req.user?.id,
        },
      });
    }

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting product' });
  }
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error uploading image' });
  }
};
