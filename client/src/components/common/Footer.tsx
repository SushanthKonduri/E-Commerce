import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Headset, ArrowRight, Github, Twitter, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-luxe-card border-t border-slate-200 dark:border-luxe-border pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Props Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-16 border-b border-slate-200 dark:border-luxe-border">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-luxe-bg/40 border border-slate-200 dark:border-luxe-border/60">
            <div className="w-12 h-12 rounded-xl bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center text-luxe-gold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Complimentary Express</h4>
              <p className="text-xs text-slate-500 dark:text-luxe-muted">Free shipping on orders over ₹1,499</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-luxe-bg/40 border border-slate-200 dark:border-luxe-border/60">
            <div className="w-12 h-12 rounded-xl bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center text-luxe-gold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">2-Year Warranty</h4>
              <p className="text-xs text-slate-500 dark:text-luxe-muted">Comprehensive international guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-luxe-bg/40 border border-slate-200 dark:border-luxe-border/60">
            <div className="w-12 h-12 rounded-xl bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center text-luxe-gold">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">30-Day Returns</h4>
              <p className="text-xs text-slate-500 dark:text-luxe-muted">Seamless return & exchange service</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-luxe-bg/40 border border-slate-200 dark:border-luxe-border/60">
            <div className="w-12 h-12 rounded-xl bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center text-luxe-gold">
              <Headset className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">24/7 Concierge</h4>
              <p className="text-xs text-slate-500 dark:text-luxe-muted">Dedicated expert customer assistance</p>
            </div>
          </div>
        </div>

        {/* Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16">
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-luxe-gold flex items-center justify-center text-black font-bold font-heading">
                V
              </div>
              <span className="font-heading font-bold text-xl tracking-widest text-slate-900 dark:text-slate-100">VELORA</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-luxe-muted leading-relaxed max-w-sm">
              VELORA curates thoughtfully selected fashion, electronics, accessories, and lifestyle essentials for those who appreciate exceptional quality.
            </p>

            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-luxe-bg border border-slate-200 dark:border-luxe-border flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-luxe-gold hover:border-luxe-gold transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-luxe-bg border border-slate-200 dark:border-luxe-border flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-luxe-gold hover:border-luxe-gold transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-100 dark:bg-luxe-bg border border-slate-200 dark:border-luxe-border flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-luxe-gold hover:border-luxe-gold transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <h5 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">Catalog</h5>
            <Link to="/products?category=mens-clothing" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Men's Fashion</Link>
            <Link to="/products?category=womens-clothing" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Women's Fashion</Link>
            <Link to="/products?category=mobile-phones" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Mobile Phones</Link>
            <Link to="/products?category=laptops" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Laptops & Computers</Link>
            <Link to="/products?category=headphones" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Audio & Headphones</Link>
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <h5 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">Customer Care</h5>
            <a href="#" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Shipping Policy</a>
            <a href="#" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Returns & Refunds</a>
            <a href="#" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Product Authenticity</a>
            <a href="#" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Warranty Claim</a>
            <a href="#" className="text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">Contact Concierge</a>
          </div>

          <div className="md:col-span-4 flex flex-col gap-4">
            <h5 className="font-heading font-semibold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider">Velora Insider</h5>
            <p className="text-xs text-slate-500 dark:text-luxe-muted">Subscribe to receive private invitations to limited release drops and private sales.</p>
            
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                className="flex-1 bg-slate-100 dark:bg-luxe-bg border border-slate-300 dark:border-luxe-border rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-luxe-gold transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-luxe-gold text-black font-semibold text-xs flex items-center gap-1 hover:bg-luxe-goldHover transition-all"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-luxe-border/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-luxe-muted">
          <p>© 2026 VELORA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-luxe-gold">Privacy Policy</a>
            <a href="#" className="hover:text-luxe-gold">Terms of Service</a>
            <Link to="/admin/login" className="hover:text-luxe-gold font-semibold transition-colors">Admin Login</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
