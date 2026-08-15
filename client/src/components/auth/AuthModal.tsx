import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Shield, KeyRound, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FlowMode = 'login' | 'register' | 'forgot' | 'otp' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<FlowMode>(initialMode as FlowMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Forgot password flow state
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState(['', '', '', '', '', '']);
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resetError, setResetError] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // Show OTP in toast for demo

  const { login: setAuthLogin } = useAuthStore();
  const { mergeCart } = useCartStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  // Reset form input values and errors whenever modal opens or mode changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode as FlowMode);
      setFormData({ name: '', email: '', password: '' });
      setErrors({});
      setFpEmail('');
      setFpOtp(['', '', '', '', '', '']);
      setFpNewPassword('');
      setFpConfirmPassword('');
      setOtpError('');
      setResetError('');
      setShowPassword(false);
      setShowNewPassword(false);
    }
  }, [isOpen, initialMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const normalizedData = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
    };

    try {
      if (mode === 'login') {
        loginSchema.parse({ email: normalizedData.email, password: normalizedData.password });
      } else {
        registerSchema.parse(normalizedData);
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const formatted: Record<string, string> = {};
        err.errors.forEach((e) => { if (e.path[0]) formatted[e.path[0].toString()] = e.message; });
        setErrors(formatted);
        return;
      }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, normalizedData);
      const { user, accessToken, refreshToken } = res.data;
      setAuthLogin(user, accessToken, refreshToken);
      await mergeCart();
      addToast({ type: 'success', title: mode === 'login' ? 'Welcome Back!' : 'Account Created!', message: `Signed in as ${user.name}` });
      onClose();
      if (user.role === 'ADMIN') navigate('/admin');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Authentication failed. Please check details.';
      addToast({ type: 'error', title: 'Auth Error', message });
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD FLOW ---

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: fpEmail.trim().toLowerCase() });
      setDemoOtp(res.data.otp || '');
      addToast({
        type: 'success',
        title: 'OTP Sent!',
        message: `Your OTP code is: ${res.data.otp} (valid 10 mins)`,
      });
      setMode('otp');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      addToast({ type: 'error', title: 'Error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const updated = [...fpOtp];
    updated[idx] = val;
    setFpOtp(updated);
    setOtpError('');
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !fpOtp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setFpOtp(pasted.split(''));
      document.getElementById('otp-5')?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = fpOtp.join('');
    if (otpCode.length < 6) { setOtpError('Please enter the full 6-digit OTP.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: fpEmail.trim().toLowerCase(), otp: otpCode });
      addToast({ type: 'success', title: 'OTP Verified!', message: 'Enter your new password.' });
      setMode('reset');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setOtpError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fpNewPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
    if (fpNewPassword !== fpConfirmPassword) { setResetError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const otp = fpOtp.join('');
      await api.post('/auth/reset-password', { email: fpEmail.trim().toLowerCase(), otp, newPassword: fpNewPassword });
      addToast({ type: 'success', title: 'Password Updated!', message: 'Please log in with your new password.' });
      setMode('login');
      setFpEmail(''); setFpOtp(['', '', '', '', '', '']); setFpNewPassword(''); setFpConfirmPassword('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password. Please restart.';
      setResetError(msg);
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    setMode('login');
    setFpEmail(''); setFpOtp(['', '', '', '', '', '']);
    setFpNewPassword(''); setFpConfirmPassword('');
    setOtpError(''); setResetError('');
  };

  const inputClass = "w-full bg-slate-50 dark:bg-luxe-bg border border-slate-300 dark:border-luxe-border focus:border-luxe-gold rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-luxe-muted outline-none transition-all";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-luxe-card border border-slate-200 dark:border-luxe-border rounded-3xl p-8 shadow-2xl z-50 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-luxe-gold/5 rounded-full blur-2xl pointer-events-none" />

            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-luxe-bg transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* ---- LOGIN / REGISTER ---- */}
            {(mode === 'login' || mode === 'register') && (
              <>
                {/* Tabs */}
                <div className="flex items-center justify-center gap-6 mb-8 border-b border-slate-200 dark:border-luxe-border pb-4">
                  {(['login', 'register'] as const).map((tab) => (
                    <button key={tab} onClick={() => { setMode(tab); setErrors({}); }}
                      className={`font-heading font-bold text-lg transition-colors relative pb-2 ${mode === tab ? 'text-luxe-gold' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                      {tab === 'login' ? 'Sign In' : 'Create Account'}
                      {mode === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-luxe-gold" />}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                      <div className="relative">
                        <input type="text" name="name" placeholder="Your full name" value={formData.name} onChange={handleInputChange} className={inputClass} />
                        <UserIcon className="w-4 h-4 text-slate-400 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
                      </div>
                      {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <input type="email" name="email" placeholder="name@example.com" value={formData.email} onChange={handleInputChange} className={inputClass} />
                      <Mail className="w-4 h-4 text-slate-400 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                      {mode === 'login' && (
                        <button type="button" onClick={() => { setMode('forgot'); setFpEmail(formData.email); }}
                          className="text-xs text-luxe-gold hover:underline font-medium">
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} className={`${inputClass} pr-11`} />
                      <Lock className="w-4 h-4 text-slate-400 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                  </div>

                  <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                    className="w-full py-3.5 mt-2 rounded-xl bg-luxe-gold text-black font-semibold text-sm hover:bg-luxe-goldHover transition-all shadow-lg shadow-luxe-gold/20 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>}
                  </motion.button>
                </form>
              </>
            )}

            {/* ---- FORGOT PASSWORD ---- */}
            {mode === 'forgot' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-luxe-gold/20 border border-luxe-gold/30 flex items-center justify-center mx-auto">
                    <KeyRound className="w-7 h-7 text-luxe-gold" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-slate-100">Forgot Password?</h3>
                  <p className="text-xs text-slate-500 dark:text-luxe-muted">Enter your registered email and we'll send a 6-digit OTP verification code.</p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <input type="email" placeholder="name@example.com" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} required
                        className={inputClass} />
                      <Mail className="w-4 h-4 text-slate-400 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-luxe-gold text-black font-semibold text-sm hover:bg-luxe-goldHover transition-all flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><RefreshCw className="w-4 h-4" /><span>Send OTP Code</span></>}
                  </button>
                  <button type="button" onClick={backToLogin} className="w-full flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </form>
              </div>
            )}

            {/* ---- OTP VERIFICATION ---- */}
            {mode === 'otp' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <Mail className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-slate-100">Enter OTP Code</h3>
                  <p className="text-xs text-slate-500 dark:text-luxe-muted">
                    A 6-digit code was sent to <span className="font-semibold text-luxe-gold">{fpEmail}</span>. Check your toast notification for the demo OTP.
                  </p>
                  {demoOtp && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-mono font-bold">
                      Demo OTP: {demoOtp}
                    </div>
                  )}
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center">Enter 6-Digit Verification Code</label>
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {fpOtp.map((digit, idx) => (
                        <input key={idx} id={`otp-${idx}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 bg-slate-50 dark:bg-luxe-bg text-slate-900 dark:text-slate-100 outline-none transition-all ${digit ? 'border-luxe-gold' : 'border-slate-300 dark:border-luxe-border'} focus:border-luxe-gold`}
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-xs text-rose-500 mt-2 text-center font-medium">{otpError}</p>}
                  </div>

                  <button type="submit" disabled={loading || fpOtp.join('').length < 6}
                    className="w-full py-3.5 rounded-xl bg-luxe-gold text-black font-semibold text-sm hover:bg-luxe-goldHover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /><span>Verify OTP</span></>}
                  </button>

                  <div className="flex items-center justify-between text-xs">
                    <button type="button" onClick={backToLogin} className="flex items-center gap-1 text-slate-500 dark:text-luxe-muted hover:text-luxe-gold transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>
                    <button type="button" onClick={() => setMode('forgot')} className="text-luxe-gold hover:underline">
                      Resend OTP
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ---- RESET PASSWORD ---- */}
            {mode === 'reset' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-luxe-gold/20 border border-luxe-gold/30 flex items-center justify-center mx-auto">
                    <Lock className="w-7 h-7 text-luxe-gold" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-slate-100">Set New Password</h3>
                  <p className="text-xs text-slate-500 dark:text-luxe-muted">OTP verified ✓ — Create a new strong password for your account.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                    <div className="relative">
                      <input type={showNewPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={fpNewPassword}
                        onChange={(e) => { setFpNewPassword(e.target.value); setResetError(''); }} required className={`${inputClass} pr-11`} />
                      <Lock className="w-4 h-4 text-slate-400 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input type="password" placeholder="Repeat new password" value={fpConfirmPassword}
                        onChange={(e) => { setFpConfirmPassword(e.target.value); setResetError(''); }} required className={inputClass} />
                      <Lock className="w-4 h-4 text-slate-400 dark:text-luxe-muted absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {resetError && <p className="text-xs text-rose-500 mt-1 font-medium">{resetError}</p>}
                  </div>

                  {/* Password strength hint */}
                  {fpNewPassword && (
                    <div className="flex gap-1.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                          fpNewPassword.length >= 12 ? 'bg-emerald-500'
                          : fpNewPassword.length >= 8 ? (i < 3 ? 'bg-amber-400' : 'bg-slate-300 dark:bg-luxe-border')
                          : fpNewPassword.length >= 6 ? (i < 2 ? 'bg-rose-400' : 'bg-slate-300 dark:bg-luxe-border')
                          : (i === 0 ? 'bg-rose-400' : 'bg-slate-300 dark:bg-luxe-border')
                        }`} />
                      ))}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-luxe-gold text-black font-semibold text-sm hover:bg-luxe-goldHover transition-all flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /><span>Update Password</span></>}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
