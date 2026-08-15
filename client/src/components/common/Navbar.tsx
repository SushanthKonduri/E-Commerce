import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, User as UserIcon, Sun, Moon, Menu, X, Shield, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useThemeStore } from '../../store/useThemeStore';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items: cartItems, setIsOpen: setIsCartOpen } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { theme, toggleTheme } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Debounced search autocomplete fetch
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        const data = await res.json();
        setSuggestions(data.products || []);
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-luxe-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-xl bg-luxe-gold flex items-center justify-center shadow-lg shadow-luxe-gold/20 flex-shrink-0"
          >
            <span className="font-heading font-black text-black text-xl">V</span>
          </motion.div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-2xl tracking-widest text-slate-900 dark:text-slate-100 group-hover:text-luxe-gold transition-colors">
              VELORA
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-luxe-muted font-bold">
              Aesthetic Store
            </span>
          </div>
        </Link>

        {/* Search Bar with Dynamic Autocomplete - Desktop */}
        <div className="hidden md:block flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products by name or keyword..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              className="w-full bg-slate-100 dark:bg-luxe-bg border border-slate-300 dark:border-luxe-border focus:border-luxe-gold focus:bg-white dark:focus:bg-luxe-card rounded-full py-2.5 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none transition-all shadow-inner font-medium"
            />
            <Search className="w-4 h-4 text-slate-500 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
          </form>

          {/* Dynamic Autocomplete Suggestion Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0E0E17] border border-slate-200 dark:border-luxe-border rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
              >
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-luxe-muted px-3 py-1.5 flex justify-between items-center border-b border-slate-100 dark:border-luxe-border/50">
                  <span>Product Suggestions</span>
                  {searchLoading && <span className="animate-pulse text-luxe-gold">Searching...</span>}
                </div>

                {suggestions.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-luxe-border/40 max-h-80 overflow-y-auto">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-luxe-card rounded-xl transition-colors group"
                      >
                        <img
                          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-luxe-border"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-luxe-gold truncate">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-luxe-muted">
                            {product.category?.name || 'Category'}
                          </p>
                        </div>
                        <span className="font-heading font-bold text-xs text-luxe-gold">
                          ₹{product.price.toFixed(2)}
                        </span>
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        setIsSearchFocused(false);
                        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                      }}
                      className="w-full text-center py-2.5 text-xs font-bold text-luxe-gold hover:bg-slate-100 dark:hover:bg-luxe-card rounded-xl transition-colors"
                    >
                      View all results for "{searchQuery}" →
                    </button>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-luxe-muted font-medium">
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm">
          <Link
            to="/products"
            className={`transition-colors hover:text-luxe-gold ${
              location.pathname === '/products'
                ? 'text-luxe-gold font-bold'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            Catalog
          </Link>
          <Link
            to="/products?featured=true"
            className="text-slate-800 dark:text-slate-200 hover:text-luxe-gold transition-colors"
          >
            Featured
          </Link>
          <Link
            to="/products?isNew=true"
            className="text-slate-800 dark:text-slate-200 hover:text-luxe-gold transition-colors"
          >
            New Arrivals
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-luxe-card/60 dark:hover:bg-luxe-card border border-slate-300 dark:border-luxe-border text-slate-800 dark:text-slate-200 hover:text-luxe-gold transition-all shadow-sm"
            title="Toggle light/dark theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
          </motion.button>

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-luxe-card/60 dark:hover:bg-luxe-card border border-slate-300 dark:border-luxe-border text-slate-800 dark:text-slate-200 hover:text-luxe-gold transition-all shadow-sm"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistItems.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-luxe-gold text-black font-extrabold text-[10px] flex items-center justify-center shadow-md"
              >
                {wishlistItems.length}
              </motion.span>
            )}
          </Link>

          {/* Cart Icon Drawer Trigger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-luxe-card/60 dark:hover:bg-luxe-card border border-slate-300 dark:border-luxe-border text-slate-800 dark:text-slate-200 hover:text-luxe-gold transition-all shadow-sm"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <motion.span
                key={totalCartCount}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-luxe-gold text-black font-extrabold text-[10px] flex items-center justify-center shadow-md"
              >
                {totalCartCount}
              </motion.span>
            )}
          </motion.button>

          {/* User Profile / Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-luxe-card border border-slate-300 dark:border-luxe-border hover:border-luxe-gold/50 transition-all shadow-sm"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-luxe-gold/60"
                />
                <span className="hidden md:inline font-bold text-xs text-slate-900 dark:text-slate-100 max-w-[110px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {isUserDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0E0E17] border border-slate-200 dark:border-luxe-border rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-luxe-border">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-luxe-muted truncate font-medium">{user.email}</p>
                      {user.role === 'ADMIN' && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-luxe-gold/20 text-luxe-gold border border-luxe-gold/40">
                          Admin Access
                        </span>
                      )}
                    </div>

                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-luxe-gold hover:bg-slate-50 dark:hover:bg-luxe-card rounded-xl transition-all"
                    >
                      <Package className="w-4 h-4 text-luxe-gold" />
                      My Orders
                    </Link>

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-luxe-gold hover:bg-slate-50 dark:hover:bg-luxe-card rounded-xl transition-all"
                      >
                        <Shield className="w-4 h-4 text-luxe-gold" />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all w-full text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-luxe-gold text-black text-xs font-extrabold hover:bg-luxe-goldHover transition-all shadow-md hover:shadow-luxe-gold/20 uppercase tracking-wider"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </motion.button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-800 dark:text-slate-200 hover:text-luxe-gold"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-luxe-border px-4 py-4 bg-white/95 dark:bg-luxe-card/95 backdrop-blur-xl flex flex-col gap-4"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-luxe-bg border border-slate-300 dark:border-luxe-border rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none font-medium"
              />
              <Search className="w-4 h-4 text-slate-500 dark:text-luxe-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <nav className="flex flex-col gap-3 font-semibold text-sm">
              <Link
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-luxe-border/40 text-slate-800 dark:text-slate-200 hover:text-luxe-gold"
              >
                All Products
              </Link>
              <Link
                to="/products?featured=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-luxe-border/40 text-slate-800 dark:text-slate-200 hover:text-luxe-gold"
              >
                Featured Items
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-slate-100 dark:border-luxe-border/40 text-slate-800 dark:text-slate-200 hover:text-luxe-gold flex justify-between items-center"
              >
                <span>Saved Favorites</span>
                <span className="px-2 py-0.5 rounded-full bg-luxe-gold/20 text-luxe-gold text-xs font-bold">
                  {wishlistItems.length}
                </span>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2 border-b border-slate-100 dark:border-luxe-border/40 text-luxe-gold font-bold flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
