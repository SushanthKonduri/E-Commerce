import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [totalRevenueResult, totalOrders, totalProducts, totalUsers, lowStockProducts, recentOrders, orderStatusGroup, topProductsGroup] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, stock: true, sku: true, category: { select: { name: true } } },
        take: 10,
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { select: { id: true, quantity: true, price: true, product: { select: { name: true } } } },
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Enhance top products with name and category
    const topProductDetails = await Promise.all(
      topProductsGroup.map(async (item) => {
        const prod = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true, category: { select: { name: true } } },
        });
        return {
          productId: item.productId,
          name: prod?.name || 'Unknown Product',
          category: prod?.category?.name || 'General',
          quantitySold: item._sum.quantity || 0,
          totalRevenue: (item._sum.quantity || 0) * (prod?.price || 0),
        };
      })
    );

    // Real 7-day revenue trend from database
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueTrend = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        return prisma.order.aggregate({
          _sum: { totalAmount: true },
          _count: { id: true },
          where: { createdAt: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
        }).then(r => ({
          day: days[start.getDay()],
          revenue: Math.round(r._sum.totalAmount || 0),
          orders: r._count.id || 0,
        }));
      })
    );

    res.json({
      stats: {
        totalRevenue: totalRevenueResult._sum.totalAmount || 0,
        totalOrders,
        totalProducts,
        totalUsers,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      orderStatusDistribution: orderStatusGroup.map(g => ({ name: g.status, value: g._count.id })),
      topProducts: topProductDetails,
      revenueTrend,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching dashboard stats' });
  }
};

export const getUsersAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching users' });
  }
};

export const updateUserRoleAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user?.id) {
      res.status(400).json({ message: 'Cannot modify your own admin role' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating user role' });
  }
};

export const updateUserAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (role && id === req.user?.id && role !== req.user.role) {
      res.status(400).json({ message: 'Cannot modify your own admin role' });
      return;
    }

    const updateData: any = {};
    if (name !== undefined && name.trim() !== '') {
      updateData.name = name.trim();
    }
    if (email !== undefined && email.trim() !== '') {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== existingUser.email) {
        const emailCheck = await prisma.user.findFirst({ where: { email: cleanEmail } });
        if (emailCheck) {
          res.status(400).json({ message: 'Email address is already in use by another account' });
          return;
        }
        updateData.email = cleanEmail;
      }
    }
    if (role !== undefined && (role === 'CUSTOMER' || role === 'ADMIN')) {
      updateData.role = role;
    }
    if (avatar !== undefined) {
      updateData.avatar = avatar;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
    });

    res.json({ message: 'User account updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating user account' });
  }
};

export const deleteUserAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (id === req.user?.id) {
      res.status(400).json({ message: 'Cannot delete your own admin account' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting user account' });
  }
};


export const getInventoryLogsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await prisma.inventoryLog.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true } },
        admin: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching inventory logs' });
  }
};
