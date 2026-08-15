import { create } from 'zustand';
import { api } from '../services/api';
import { useToastStore } from './useToastStore';
import { useAuthStore } from './useAuthStore';

export interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: { url: string }[];
    category?: { name: string };
    rating: number;
    stock: number;
  };
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    if (!useAuthStore.getState().isAuthenticated) return;
    set({ isLoading: true });
    try {
      const res = await api.get('/wishlist');
      set({ items: res.data.items || [], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (productId) => {
    if (!useAuthStore.getState().isAuthenticated) {
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to save items to your wishlist',
      });
      return;
    }

    try {
      const res = await api.post('/wishlist/toggle', { productId });
      await get().fetchWishlist();
      
      useToastStore.getState().addToast({
        type: 'success',
        title: res.data.added ? 'Saved to Wishlist' : 'Removed from Wishlist',
        message: res.data.added ? 'Item added to your saved favorites' : 'Item removed from your favorites',
      });
    } catch (error: any) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Wishlist Error',
        message: error.response?.data?.message || 'Could not update wishlist',
      });
    }
  },

  isWishlisted: (productId) => {
    return get().items.some((item) => item.productId === productId);
  },
}));
