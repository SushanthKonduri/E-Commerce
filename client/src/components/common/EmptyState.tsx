import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Search, PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'search' | 'orders';
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText = 'Explore Products',
  actionLink = '/products',
}) => {
  const getIcon = () => {
    switch (type) {
      case 'cart':
        return <ShoppingBag className="w-12 h-12 text-luxe-gold" />;
      case 'wishlist':
        return <Heart className="w-12 h-12 text-luxe-gold" />;
      case 'search':
        return <Search className="w-12 h-12 text-luxe-gold" />;
      case 'orders':
        return <PackageX className="w-12 h-12 text-luxe-gold" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'cart':
        return 'Your Cart is Empty';
      case 'wishlist':
        return 'Your Wishlist is Empty';
      case 'search':
        return 'No Products Found';
      case 'orders':
        return 'No Orders Yet';
    }
  };

  const getDefaultDesc = () => {
    switch (type) {
      case 'cart':
        return 'Looks like you haven’t added anything to your cart yet. Discover our latest collection.';
      case 'wishlist':
        return 'Save your favorite items here to purchase later or keep track of price drops.';
      case 'search':
        return 'We couldn’t find any products matching your search criteria. Try checking spelling or adjusting filters.';
      case 'orders':
        return 'You have not placed any orders yet. Start exploring our premium store catalog.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 py-16 bg-luxe-card/40 border border-luxe-border rounded-3xl backdrop-blur-sm max-w-md mx-auto my-8"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center mb-6 shadow-inner"
      >
        {getIcon()}
      </motion.div>

      <h3 className="text-xl font-heading font-semibold text-slate-100 mb-2">
        {title || getDefaultTitle()}
      </h3>

      <p className="text-sm text-luxe-muted mb-6 leading-relaxed max-w-xs">
        {description || getDefaultDesc()}
      </p>

      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-luxe-gold text-black font-semibold hover:bg-luxe-goldHover transition-all shadow-lg hover:shadow-luxe-gold/20"
        >
          {actionText}
        </Link>
      )}
    </motion.div>
  );
};
