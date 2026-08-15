import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

import { HomePage } from './pages/HomePage';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Admin Protected Route Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxe-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-luxe-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Scroll to Top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Customer Protected Route Guard
const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxe-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-luxe-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');

  const { checkAuth, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    checkAuth();
    fetchCart();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Handle ?forgot=1 redirect from Admin Login page
  useEffect(() => {
    if (searchParams.get('forgot') === '1') {
      setAuthMode('forgot');
      setIsAuthModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams]);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-luxe-gold selection:text-black">
      <ScrollToTop />
      
      {!isAdminRoute && <Navbar onOpenAuth={handleOpenAuth} />}

      <div className="flex-1">
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<HomePage onOpenAuth={handleOpenAuth} />} />
          
          {/* Protected Shopping Experience Routes */}
          <Route path="/products" element={<ProtectedCustomerRoute><ProductListPage /></ProtectedCustomerRoute>} />
          <Route path="/products/:slug" element={<ProtectedCustomerRoute><ProductDetailPage /></ProtectedCustomerRoute>} />
          <Route path="/wishlist" element={<ProtectedCustomerRoute><WishlistPage /></ProtectedCustomerRoute>} />
          <Route path="/checkout" element={<ProtectedCustomerRoute><CheckoutPage /></ProtectedCustomerRoute>} />
          <Route path="/orders" element={<ProtectedCustomerRoute><OrdersPage /></ProtectedCustomerRoute>} />

          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin Panel Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <AdminProducts />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrders />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedAdminRoute>
                <AdminInventory />
              </ProtectedAdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!isAdminRoute && <Footer />}

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode as any}
      />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
