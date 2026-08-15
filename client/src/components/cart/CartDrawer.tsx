import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();

  const handleCheckoutClick = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-luxe-card border-l border-luxe-border shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-luxe-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center text-luxe-gold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-100">Shopping Bag</h3>
                  <p className="text-xs text-luxe-muted">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-luxe-bg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center text-luxe-gold mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-slate-100 mb-1">Your cart is currently empty</h4>
                  <p className="text-xs text-luxe-muted mb-6">Discover our luxury acoustic gear, timepieces, and apparel.</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-luxe-gold text-black font-semibold text-xs hover:bg-luxe-goldHover transition-all shadow-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-4 p-3 rounded-2xl bg-luxe-bg/60 border border-luxe-border/70 relative group"
                  >
                    <img
                      src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-luxe-border"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">
                            {item.product.name} {item.size ? `(Size: ${item.size})` : ''}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-luxe-gold font-bold mt-0.5">
                          ₹{item.product.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-luxe-border rounded-lg bg-luxe-card">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 text-slate-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold px-2 text-slate-100">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 text-slate-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-200">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-luxe-border bg-luxe-card/80 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-luxe-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-200">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-luxe-muted">
                    <span>Shipping</span>
                    <span className="text-emerald-400 font-semibold">Free Express</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-luxe-border">
                    <span>Total</span>
                    <span className="text-luxe-gold text-base">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckoutClick}
                  className="w-full py-3.5 rounded-xl bg-luxe-gold text-black font-semibold text-sm flex items-center justify-center gap-2 hover:bg-luxe-goldHover transition-all shadow-xl shadow-luxe-gold/15"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-luxe-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>256-Bit Encrypted SSL Checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
