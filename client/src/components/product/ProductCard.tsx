import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  images: { url: string; isPrimary?: boolean }[];
  category?: { name: string; slug?: string };
  rating: number;
  reviewCount: number;
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  images,
  category,
  rating,
  reviewCount,
  stock,
  isNew,
  isFeatured,
}) => {
  const { addToCart, items } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const wishlisted = isWishlisted(id);
  const isInCart = items.some((item) => item.productId === id);
  const primaryImg = images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative bg-white dark:bg-luxe-card border border-slate-200 dark:border-luxe-border hover:border-luxe-gold/50 rounded-2xl overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl hover:shadow-luxe-gold/10 transition-all"
    >
      {/* Top Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-luxe-bg">
        
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {isNew && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-luxe-gold text-black shadow-md">
              New Arrival
            </span>
          )}
          {isFeatured && !isNew && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-luxe-gold border border-luxe-gold/40 backdrop-blur-md">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          }}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-md border transition-all ${
            wishlisted
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-500'
              : 'bg-black/40 border-white/10 text-slate-300 hover:text-rose-400 hover:bg-black/60'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500' : ''}`} />
        </motion.button>

        {/* Product Image Link */}
        <Link to={`/products/${slug}`} className="block w-full h-full">
          <motion.img
            src={primaryImg}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Quick Add Slide-In Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={stock <= 0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(id, 1, null, e);
            }}
            className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xl backdrop-blur-md transition-all ${
              stock <= 0
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : isInCart
                ? 'bg-emerald-500 text-black'
                : 'bg-luxe-gold text-black hover:bg-luxe-goldHover'
            }`}
          >
            {isInCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            <span>{stock <= 0 ? 'Out of Stock' : isInCart ? 'In Shopping Bag' : 'Quick Add'}</span>
          </motion.button>
        </div>

      </div>

      {/* Content Details */}
      <div className="p-5 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-luxe-muted">
          <span>{category?.name || 'Velora'}</span>
          <div className="flex items-center gap-1 text-luxe-gold">
            <Star className="w-3.5 h-3.5 fill-luxe-gold" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 dark:text-luxe-muted">({reviewCount})</span>
          </div>
        </div>

        <Link to={`/products/${slug}`} className="group-hover:text-luxe-gold transition-colors">
          <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
            {name}
          </h3>
        </Link>

        <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 dark:border-luxe-border/60 mt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-luxe-gold">
              ₹{price.toFixed(2)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-slate-400 dark:text-luxe-muted line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <span className={`text-[10px] font-semibold ${stock <= 5 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {stock <= 0 ? 'Sold Out' : stock <= 5 ? `Only ${stock} left` : 'In Stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
