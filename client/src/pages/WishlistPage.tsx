import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCartStore } from '../store/useCartStore';
import { EmptyState } from '../components/common/EmptyState';

export const WishlistPage: React.FC = () => {
  const { items, fetchWishlist, toggleWishlist, isLoading } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-luxe-border pb-6 flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-slate-100 flex items-center gap-3">
            <Heart className="w-7 h-7 text-luxe-gold fill-luxe-gold" />
            <span>Saved Favorites</span>
          </h1>
          <p className="text-xs text-luxe-muted mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved in your luxury wishlist
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-luxe-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          type="wishlist"
          title="Your Wishlist is Empty"
          description="Explore our catalog and click the heart icon on any item to save it for later."
          actionText="Discover Products"
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map(({ id, productId, product }) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-luxe-card border border-luxe-border hover:border-luxe-gold/40 rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-xl relative group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-luxe-bg mb-4">
                  <img
                    src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleWishlist(productId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-rose-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-luxe-gold uppercase tracking-wider font-semibold">
                    {product.category?.name || 'Category'}
                  </span>
                  <Link to={`/products/${product.slug}`} className="block hover:text-luxe-gold transition-colors">
                    <h3 className="font-heading font-semibold text-sm text-slate-100 line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-heading font-bold text-base text-luxe-gold">
                    ₹{product.price.toFixed(2)}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-luxe-border flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(productId, 1, null)}
                    className="w-full py-2.5 rounded-xl bg-luxe-gold text-black font-semibold text-xs hover:bg-luxe-goldHover transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
