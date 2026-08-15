import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeleton';

export interface HomePageProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVisitorLoginPopup, setShowVisitorLoginPopup] = useState(false);

  useEffect(() => {
    // Check authentication and show mandatory login popup for unauthenticated visitors on home page entry
    const token = localStorage.getItem('luxe_access_token');
    const dismissed = sessionStorage.getItem('luxe_visitor_dismissed');
    if (!token && !dismissed) {
      const timer = setTimeout(() => {
        setShowVisitorLoginPopup(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catRes, featuredRes, newRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=true&limit=4'),
          api.get('/products?isNew=true&limit=4'),
        ]);

        setCategories(catRes.data.categories || []);
        setFeaturedProducts(featuredRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
      } catch (error) {
        console.error('Error loading homepage data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-slate-100 dark:bg-hero-gradient border border-slate-200 dark:border-luxe-border/60 mx-4 sm:mx-6 lg:mx-8 my-4 p-8 sm:p-12 shadow-xl">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-luxe-gold/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse-glow" />

        <div className="relative z-10 max-w-4xl text-center flex flex-col items-center gap-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-luxe-gold/10 border border-luxe-gold/30 text-luxe-gold text-xs font-semibold uppercase tracking-widest backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✦ Curated Autumn 2026 Collection</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading font-extrabold text-4xl sm:text-6xl lg:text-7xl text-slate-900 dark:text-slate-100 tracking-tight leading-none"
          >
            Refined Style & <br />
            <span className="text-transparent bg-clip-text bg-gold-gradient">
              Timeless Luxury
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-luxe-muted max-w-2xl leading-relaxed"
          >
            Discover thoughtfully curated fashion, accessories, and lifestyle essentials designed for those who appreciate exceptional quality and effortless style.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link
              to="/products"
              className="px-8 py-4 rounded-2xl bg-luxe-gold text-black font-semibold text-sm hover:bg-luxe-goldHover transition-all shadow-xl shadow-luxe-gold/20 flex items-center gap-2 group"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/products?isNew=true"
              className="px-8 py-4 rounded-2xl bg-white dark:bg-luxe-card/80 border border-slate-300 dark:border-luxe-border text-slate-800 dark:text-slate-200 hover:text-luxe-gold hover:border-luxe-gold/40 font-semibold text-sm transition-all backdrop-blur-md shadow-md"
            >
              View New Arrivals
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100">
              Browse Categories
            </h2>
            <p className="text-xs text-slate-500 dark:text-luxe-muted mt-1">Explore our precision-crafted luxury verticals</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-luxe-gold hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/products?category=${cat.slug}`)}
              className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-luxe-border cursor-pointer shadow-lg"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                <h3 className="font-heading font-semibold text-sm text-slate-100 group-hover:text-luxe-gold transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-luxe-muted">
                  {cat._count?.products || 0} Products
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-luxe-gold">Curated Highlights</span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 mt-1">
              Featured Flagships
            </h2>
          </div>
          <Link to="/products?featured=true" className="text-xs font-semibold text-luxe-gold hover:underline flex items-center gap-1">
            <span>Explore All Featured</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        )}
      </section>

      {/* Luxury Story Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-white dark:bg-luxe-card border border-slate-200 dark:border-luxe-border p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-luxe-gold text-xs font-semibold">
              <Award className="w-4 h-4" />
              <span>Unmatched Quality Assurance</span>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 leading-tight">
              Designed with Purpose, Engineered to Endure.
            </h2>

            <p className="text-sm text-slate-600 dark:text-luxe-muted leading-relaxed">
              Every item in our collection undergoes rigorous acoustic calibration, stress tests, and materials auditing before receiving the VELORA seal of authenticity.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-luxe-border">
              <div>
                <h4 className="font-heading font-bold text-xl text-luxe-gold">100%</h4>
                <p className="text-[11px] text-slate-500 dark:text-luxe-muted">Authentic Materials</p>
              </div>
              <div>
                <h4 className="font-heading font-bold text-xl text-luxe-gold">24/7</h4>
                <p className="text-[11px] text-slate-500 dark:text-luxe-muted">Global Support</p>
              </div>
              <div>
                <h4 className="font-heading font-bold text-xl text-luxe-gold">30 Days</h4>
                <p className="text-[11px] text-slate-500 dark:text-luxe-muted">Risk-Free Returns</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-luxe-border relative">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000"
              alt="Craftsmanship"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-luxe-gold">Fresh In Store</span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 mt-1">
              New Arrivals
            </h2>
          </div>
          <Link to="/products?isNew=true" className="text-xs font-semibold text-luxe-gold hover:underline flex items-center gap-1">
            <span>View All New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        )}
      </section>

      {/* Visitor Mandatory Login Modal Popup */}
      {showVisitorLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-[#0E0E17] border border-slate-200 dark:border-luxe-border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxe-gold/10 rounded-full blur-2xl pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-luxe-gold/20 text-luxe-gold border border-luxe-gold/40 flex items-center justify-center mx-auto shadow-lg shadow-luxe-gold/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-slate-100">
                Welcome to Velora
              </h3>
              <p className="text-xs text-slate-600 dark:text-luxe-muted leading-relaxed">
                Please <span className="text-luxe-gold font-semibold">Sign In</span> or <span className="text-luxe-gold font-semibold">Create an Account</span> to explore our exclusive Indian luxury catalog, manage your wishlist, and place orders.
              </p>
            </div>

            <div className="space-y-3 relative z-10">
              <button
                onClick={() => {
                  setShowVisitorLoginPopup(false);
                  sessionStorage.setItem('luxe_visitor_dismissed', 'true');
                  if (onOpenAuth) onOpenAuth('login');
                }}
                className="w-full py-3.5 rounded-2xl bg-luxe-gold text-black font-bold text-sm hover:bg-luxe-goldHover transition-all shadow-xl shadow-luxe-gold/20 flex items-center justify-center gap-2"
              >
                <span>Sign In / Log In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setShowVisitorLoginPopup(false);
                  sessionStorage.setItem('luxe_visitor_dismissed', 'true');
                  if (onOpenAuth) onOpenAuth('register');
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-luxe-card border border-slate-300 dark:border-luxe-border text-slate-800 dark:text-slate-200 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-luxe-bg transition-all"
              >
                Create New Account
              </button>

              <button
                onClick={() => {
                  setShowVisitorLoginPopup(false);
                  sessionStorage.setItem('luxe_visitor_dismissed', 'true');
                }}
                className="w-full text-center text-xs text-slate-400 dark:text-slate-500 hover:underline pt-1"
              >
                Continue browsing catalog as guest
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
