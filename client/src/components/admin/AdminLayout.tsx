import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingCart, Users, ClipboardList, Shield, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products Catalog', path: '/admin/products', icon: Package },
    { label: 'Orders Management', path: '/admin/orders', icon: ShoppingCart },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Inventory Audit Logs', path: '/admin/inventory', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#07070B] text-slate-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#0E0E17] border-r border-[#1F1F30] flex flex-col justify-between p-6 flex-shrink-0">
        <div className="space-y-8">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-luxe-gold flex items-center justify-center text-black font-extrabold font-heading text-xl shadow-lg shadow-luxe-gold/20">
              V
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-slate-100 tracking-wider">VELORA ADMIN</h2>
              <span className="text-[10px] uppercase font-bold text-luxe-gold bg-luxe-gold/10 px-2 py-0.5 rounded border border-luxe-gold/30">
                Control Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-luxe-gold text-black shadow-lg shadow-luxe-gold/15 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-[#161624]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-[#1F1F30] space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-luxe-gold hover:bg-[#161624] transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>

          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8">
        {/* Admin Top Header */}
        <div className="flex justify-between items-center bg-[#0E0E17] border border-[#1F1F30] p-4 px-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-luxe-gold" />
            <span className="text-xs text-slate-300 font-medium">Logged in as Administrator</span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-luxe-gold object-cover"
            />
            <span className="text-xs font-bold text-slate-100">{user?.name}</span>
          </div>
        </div>

        {children}
      </main>

    </div>
  );
};
