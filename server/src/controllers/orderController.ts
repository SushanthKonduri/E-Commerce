import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { customerName, customerEmail, shippingAddress, items, paymentMethod = 'stripe', guestId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order must contain at least one item' });
      return;
    }

    let totalAmount = 0;
    const orderItemData: Array<{ productId: string; price: number; quantity: number; size?: string | null }> = [];

    // Verify stock and calculate totals
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        return;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
        return;
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemData.push({
        productId: product.id,
        price: product.price,
        quantity: item.quantity,
        size: item.size || null,
      });
    }

    // Generate unique order number (e.g. LX-20260812-9482)
    const orderNumber = `LX-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerName,
        customerEmail,
        shippingAddress: JSON.stringify(shippingAddress),
        totalAmount,
        status: 'PLACED',
        paymentMethod,
        paymentStatus: 'paid',
        stripePaymentIntentId: `pi_mock_${Date.now()}`,
        items: {
          create: orderItemData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Update stock and inventory logs
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const newStock = product.stock - item.quantity;
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });

        await prisma.inventoryLog.create({
          data: {
            productId: product.id,
            changeType: 'SALE',
            quantityChange: -item.quantity,
            previousStock: product.stock,
            newStock,
            reason: `Order #${order.orderNumber}`,
          },
        });
      }
    }

    // Clear cart
    if (userId) {
      const userCart = await prisma.cart.findUnique({ where: { userId } });
      if (userCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    } else if (guestId) {
      const guestCart = await prisma.cart.findUnique({ where: { guestId } });
      if (guestCart) {
        await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error processing checkout' });
  }
};

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user orders' });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Access check: Admin or Order owner
    if (req.user?.role !== 'ADMIN' && order.userId !== req.user?.id) {
      res.status(403).json({ message: 'Access denied to this order' });
      return;
    }

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching order' });
  }
};

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (req.user?.role !== 'ADMIN' && order.userId !== req.user?.id) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (order.status === 'CANCELLED') {
      res.status(400).json({ message: 'Order is already cancelled' });
      return;
    }

    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      res.status(400).json({ message: 'Cannot cancel an order that has already been shipped or delivered' });
      return;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Restock items
    for (const item of order.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (product) {
        const newStock = product.stock + item.quantity;
        await prisma.product.update({
          where: { id: product.id },
          data: { stock: newStock },
        });

        await prisma.inventoryLog.create({
          data: {
            productId: product.id,
            changeType: 'RETURN',
            quantityChange: item.quantity,
            previousStock: product.stock,
            newStock,
            reason: `Order #${order.orderNumber} cancelled`,
          },
        });
      }
    }

    res.json({ message: 'Order cancelled successfully', order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error cancelling order' });
  }
};

export const getAllOrdersAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching admin orders' });
  }
};

export const updateOrderStatusAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json({ message: 'Order status updated successfully', order });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating order status' });
  }
};
