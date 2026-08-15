import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    res.json({ categories });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching categories' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, image, description } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: { name, slug, image, description },
    });

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error creating category' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, image, description } = req.body;
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : undefined;

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(image && { image }),
        ...(description !== undefined && { description }),
      },
    });

    res.json({ message: 'Category updated successfully', category });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting category' });
  }
};
