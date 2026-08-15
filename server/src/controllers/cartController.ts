import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const findOrCreateCart = async (userId?: string, guestId?: string) => {
  if (userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, category: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true, category: true },
              },
            },
          },
        },
      });
    }
    return cart;
  }

  if (guestId) {
    let cart = await prisma.cart.findUnique({
      where: { guestId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true, category: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { guestId },
        include: {
          items: {
            include: {
              product: {
                include: { images: true, category: true },
              },
            },
          },
        },
      });
    }
    return cart;
  }

  throw new Error('Either userId or guestId must be provided');
};

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const guestId = (req.headers['x-guest-id'] as string) || (req.query.guestId as string);

    if (!userId && !guestId) {
      res.json({ cart: null, items: [], subtotal: 0 });
      return;
    }

    const cart = await findOrCreateCart(userId, guestId);
    
    const items = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: item.product,
      size: item.size,
      subtotal: item.product.price * item.quantity,
    }));

    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

    res.json({ cartId: cart.id, items, subtotal });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error getting cart' });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const guestId = (req.headers['x-guest-id'] as string) || req.body.guestId;
    const { productId, quantity = 1, size = null } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ message: `Only ${product.stock} units available in stock` });
      return;
    }

    const cart = await findOrCreateCart(userId, guestId);

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) {
        res.status(400).json({ message: `Cannot add more. Stock limit of ${product.stock} reached` });
        return;
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
            size,
          },
        });
    }

    await getCart(req, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error adding to cart' });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // CartItem ID
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
    } else {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!cartItem) {
        res.status(404).json({ message: 'Cart item not found' });
        return;
      }

      if (cartItem.product.stock < quantity) {
        res.status(400).json({ message: `Only ${cartItem.product.stock} units in stock` });
        return;
      }

      await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });
    }

    await getCart(req, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating cart item' });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id } });
    await getCart(req, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error removing item from cart' });
  }
};

export const mergeGuestCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { guestId } = req.body;

    if (!userId || !guestId) {
      res.status(400).json({ message: 'Missing userId or guestId' });
      return;
    }

    const guestCart = await prisma.cart.findUnique({
      where: { guestId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) {
      await getCart(req, res);
      return;
    }

    const userCart = await findOrCreateCart(userId);

    for (const item of guestCart.items) {
      const existingUserItem = await prisma.cartItem.findFirst({
        where: {
            cartId: userCart.id,
            productId: item.productId,
            size: item.size,
        },
      });

      if (existingUserItem) {
        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: { quantity: existingUserItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
          },
        });
      }
    }

    // Delete guest cart
    await prisma.cart.delete({ where: { id: guestCart.id } });

    await getCart(req, res);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error merging cart' });
  }
};
