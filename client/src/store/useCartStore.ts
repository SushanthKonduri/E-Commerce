import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToastStore } from './useToastStore';

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  images: { url: string }[];
  category?: { name: string };
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  size?: string | null;
  product: CartItemProduct;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  setIsOpen: (isOpen: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number, size?: string | null, event?: React.MouseEvent) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  mergeCart: () => Promise<void>;
  clearCartLocally: () => void;
}

const triggerConfetti = (e?: React.MouseEvent) => {
  const x = e ? e.clientX / window.innerWidth : 0.8;
  const y = e ? e.clientY / window.innerHeight : 0.8;

  confetti({
    particleCount: 35,
    spread: 60,
    origin: { x, y },
    colors: ['#D4AF37', '#E6C687', '#FFFFFF', '#8A6D3B'],
  });
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  isOpen: false,
  isLoading: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/cart');
      set({
        items: res.data.items || [],
        subtotal: res.data.subtotal || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity = 1, size = null, event) => {
    try {
      const res = await api.post('/cart/add', { productId, quantity, size });
      set({
        items: res.data.items || [],
        subtotal: res.data.subtotal || 0,
        isOpen: true,
      });
      triggerConfetti(event);
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Added to Cart',
        message: 'Item added to your shopping bag',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Could not add product to cart';
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Cart Error',
        message,
      });
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${cartItemId}`, { quantity });
      set({
        items: res.data.items || [],
        subtotal: res.data.subtotal || 0,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error updating quantity';
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Update Error',
        message,
      });
    }
  },

  removeItem: async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      set({
        items: res.data.items || [],
        subtotal: res.data.subtotal || 0,
      });
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Item Removed',
        message: 'Item removed from your cart',
      });
    } catch (error: any) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Remove Error',
        message: 'Could not remove item',
      });
    }
  },

  mergeCart: async () => {
    const guestId = localStorage.getItem('luxe_guest_id');
    if (!guestId) return;
    try {
      const res = await api.post('/cart/merge', { guestId });
      set({
        items: res.data.items || [],
        subtotal: res.data.subtotal || 0,
      });
    } catch (error) {
      // ignore
    }
  },

  clearCartLocally: () => set({ items: [], subtotal: 0 }),
}));
