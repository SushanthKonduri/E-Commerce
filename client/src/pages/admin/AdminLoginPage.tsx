import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, KeyRound } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuthStore();
  const { addToast } = useToastStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clear inputs on mount
  React.useEffect(() => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password });
      const { user, accessToken, refreshToken } = res.data;

      if (user.role !== 'ADMIN') {
        addToast({
          type: 'error',
          title: 'Access Denied',
          message: 'Access Denied. This is a Customer account. Only authorized Administrators are permitted to sign in here.',
        });
        setLoading(false);
        return;
      }

      setAuthLogin(user, accessToken, refreshToken);
      addToast({
        type: 'success',
        title: 'Admin Access Granted',
        message: `Welcome back to VELORA Command Center, ${user.name}`,
      });

      setEmail('');
      setPassword('');
      navigate('/admin');
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || 'Authentication error occurred';
      addToast({
        type: 'error',
        title: 'Admin Login Failed',
        message: serverMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('admin123');
    addToast({
      type: 'info',
      title: 'Credentials Loaded',
      message: `Loaded credentials for ${adminEmail}. Click "Authenticate & Access Dashboard".`,
    });
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxe-gold/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0E0E17] border border-[#1F1F30] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Portal Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-luxe-gold/10 border border-luxe-gold/40 flex items-center justify-center text-luxe-gold mx-auto shadow-xl shadow-luxe-gold/10">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-heading font-black text-2xl text-slate-100 tracking-wider">
              VELORA ADMIN PORTAL
            </h1>
            <p className="text-xs text-luxe-muted mt-1">
              Restricted Control Center & Infrastructure
            </p>
          </div>
        </div>

        {/* Quick Admin Credential Presets */}
        <div className="p-3 bg-[#161624] border border-[#2B2B40] rounded-2xl space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-luxe-gold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Authorized Admin Accounts:</span>
          </div>
          <div className="flex flex-col gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleFillAdmin('admin@velora.com')}
              className="flex justify-between items-center px-3 py-2 bg-[#0E0E17] hover:bg-[#1F1F30] border border-[#2B2B40] rounded-xl text-left transition-all"
            >
              <span className="font-semibold text-slate-200">admin@velora.com</span>
              <span className="text-[10px] bg-luxe-gold/20 text-luxe-gold px-2 py-0.5 rounded font-bold">Auto-Fill</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillAdmin('sushanthkonduri10@gmail.com')}
              className="flex justify-between items-center px-3 py-2 bg-[#0E0E17] hover:bg-[#1F1F30] border border-[#2B2B40] rounded-xl text-left transition-all"
            >
              <span className="font-semibold text-slate-200">sushanthkonduri10@gmail.com</span>
              <span className="text-[10px] bg-luxe-gold/20 text-luxe-gold px-2 py-0.5 rounded font-bold">Auto-Fill</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Administrator Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@velora.com"
                className="w-full bg-[#161624] border border-[#2B2B40] focus:border-luxe-gold rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-luxe-gold absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Security Password</label>
              <button
                type="button"
                onClick={() => navigate('/?forgot=1')}
                className="text-xs text-luxe-gold hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#161624] border border-[#2B2B40] focus:border-luxe-gold rounded-xl py-3 pl-11 pr-11 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-luxe-gold absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-luxe-gold text-black font-bold text-sm hover:bg-luxe-goldHover transition-all shadow-xl shadow-luxe-gold/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Authenticate & Access Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Back to Customer Storefront */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
          >
            ← Return to Customer Storefront
          </button>
        </div>
      </motion.div>
    </div>
  );
};

