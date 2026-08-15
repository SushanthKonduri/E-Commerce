import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Check, CreditCard, Truck, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { api } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCartLocally } = useCartStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Shipping, 2: Payment, 3: Review, 4: Confirmed
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'authenticating' | 'success'>('idle');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Form State
  const [shippingInfo, setShippingInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    addressLine1: '742 Evergreen Terrace',
    addressLine2: 'Suite 400',
    city: 'Springfield',
    state: 'OR',
    postalCode: '97477',
    country: 'United States',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '123',
    cardHolder: user?.name || 'Alexander Luxe',
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.addressLine1) {
      addToast({ type: 'error', title: 'Missing Info', message: 'Please complete all required shipping fields' });
      return;
    }
    setStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setPaymentStatus('processing');
    
    // Simulate payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentStatus('authenticating');
    
    // Simulate 3D secure/bank authentication
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentStatus('success');
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const orderPayload = {
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        shippingAddress: {
          addressLine1: shippingInfo.addressLine1,
          addressLine2: shippingInfo.addressLine2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postalCode: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, size: i.size })),
        paymentMethod: 'stripe',
        guestId: localStorage.getItem('luxe_guest_id'),
      };

      const res = await api.post('/orders/checkout', orderPayload);
      setPlacedOrder(res.data.order);
      clearCartLocally();
      setStep(4);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E6C687', '#FFFFFF', '#10B981'],
      });

      addToast({
        type: 'success',
        title: 'Order Placed!',
        message: `Order #${res.data.order.orderNumber} successfully processed`,
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Checkout Failed',
        message: error.response?.data?.message || 'Could not place order',
      });
    } finally {
      setLoading(false);
      setPaymentStatus('idle');
    }
  };

  if (step === 4 && placedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-luxe-gold">Order Confirmed</span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-100">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-luxe-muted max-w-md mx-auto">
            Order <span className="font-mono text-luxe-gold font-bold">#{placedOrder.orderNumber}</span> has been confirmed and is currently being prepared for express dispatch.
          </p>
        </div>

        {/* Summary Box */}
        <div className="bg-luxe-card border border-luxe-border rounded-3xl p-6 text-left space-y-4 shadow-2xl">
          <div className="flex justify-between items-center pb-4 border-b border-luxe-border text-xs text-luxe-muted">
            <span>Customer: <strong className="text-slate-100">{placedOrder.customerName}</strong></span>
            <span>Status: <strong className="text-emerald-400 font-bold">PAID (Express Dispatch)</strong></span>
          </div>

          <div className="space-y-3">
            {placedOrder.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-200">{item.product?.name} {item.size ? `(Size: ${item.size})` : ''} x {item.quantity}</span>
                <span className="font-semibold text-luxe-gold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-luxe-border flex justify-between items-center text-sm font-bold">
            <span className="text-slate-100">Total Paid</span>
            <span className="text-luxe-gold text-lg">₹{placedOrder.totalAmount?.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 rounded-xl bg-luxe-gold text-black font-semibold text-xs hover:bg-luxe-goldHover transition-all"
          >
            View Order History
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 rounded-xl bg-luxe-card border border-luxe-border text-slate-200 hover:text-white text-xs font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-100">Your Cart is Empty</h2>
        <p className="text-xs text-luxe-muted">Add some items to your bag before checking out.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 rounded-xl bg-luxe-gold text-black font-semibold text-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
      
      {/* Payment Processing Modal */}
      <AnimatePresence>
        {paymentStatus !== 'idle' && step !== 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-luxe-card border border-luxe-border rounded-2xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
            >
              <div className="relative w-16 h-16 mx-auto">
                {paymentStatus === 'success' ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/50">
                    <Check className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="absolute inset-0 border-4 border-luxe-gold border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-100">
                  {paymentStatus === 'processing' && 'Processing Payment...'}
                  {paymentStatus === 'authenticating' && 'Authenticating with Bank...'}
                  {paymentStatus === 'success' && 'Payment Successful!'}
                </h3>
                <p className="text-xs text-luxe-muted">
                  {paymentStatus === 'authenticating' 
                    ? 'Please do not refresh or close this window.'
                    : 'Securely connecting to payment gateway.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar Header */}
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-luxe-border -z-10" />

          {[
            { num: 1, label: 'Shipping' },
            { num: 2, label: 'Payment' },
            { num: 3, label: 'Review' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1.5 bg-luxe-bg px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step > s.num
                  ? 'bg-emerald-500 text-black'
                  : step === s.num
                  ? 'bg-luxe-gold text-black shadow-lg shadow-luxe-gold/30 scale-110'
                  : 'bg-luxe-card border border-luxe-border text-luxe-muted'
              }`}>
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs font-medium ${step >= s.num ? 'text-slate-100' : 'text-luxe-muted'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
        
        {/* Left Interactive Step Forms */}
        <div className="lg:col-span-7 bg-luxe-card border border-luxe-border rounded-3xl p-6 sm:p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Shipping */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleShippingSubmit}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 font-heading font-bold text-lg text-slate-100 pb-2 border-b border-luxe-border">
                  <Truck className="w-5 h-5 text-luxe-gold" />
                  <span>Shipping Address & Contact</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-luxe-muted mb-1">Full Name</label>
                    <input
                      type="text"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-luxe-muted mb-1">Email Address</label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-luxe-muted mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={shippingInfo.addressLine1}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                    className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-luxe-muted mb-1">City</label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-luxe-muted mb-1">State</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-luxe-muted mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                      className="w-full bg-luxe-bg border border-luxe-border rounded-xl px-3 py-2.5 text-xs text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 mt-4 rounded-xl bg-luxe-gold text-black font-semibold text-xs hover:bg-luxe-goldHover transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePaymentSubmit}
                className="space-y-6"
              >
                <div className="flex items-center justify-between pb-2 border-b border-luxe-border">
                  <div className="flex items-center gap-2 font-heading font-bold text-lg text-slate-100">
                    <CreditCard className="w-5 h-5 text-luxe-gold" />
                    <span>Secure Card Payment</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    256-Bit Encrypted
                  </span>
                </div>

                {/* Interactive Card & Form Container */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Interactive Animated Credit Card Preview */}
                  <div className="md:col-span-6 flex justify-center perspective-1000">
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d' }}
                      className="w-full max-w-sm h-48 rounded-2xl bg-gradient-to-tr from-slate-900 via-zinc-900 to-amber-950/80 border border-luxe-gold/40 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Decorative Background Elements */}
                      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-luxe-gold/10 blur-2xl pointer-events-none" />
                      
                      {!isFlipped ? (
                        /* Front of Card */
                        <div className="flex flex-col justify-between h-full relative z-10">
                          <div className="flex justify-between items-center">
                            <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 flex items-center justify-center shadow">
                              <div className="w-8 h-5 border border-black/30 rounded" />
                            </div>
                            <span className="font-heading font-bold text-xs tracking-widest text-luxe-gold uppercase">
                              VELORA LUXE
                            </span>
                          </div>

                          <div className="font-mono text-base tracking-widest text-slate-100 drop-shadow">
                            {paymentInfo.cardNumber
                              ? paymentInfo.cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()
                              : '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-end text-xs">
                            <div>
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Card Holder</span>
                              <span className="font-medium text-slate-200 uppercase tracking-wide truncate max-w-[150px] block">
                                {paymentInfo.cardHolder || 'VALUED CUSTOMER'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Expires</span>
                              <span className="font-mono text-slate-200 font-bold">
                                {paymentInfo.cardExpiry || 'MM/YY'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Back of Card */
                        <div
                          style={{ transform: 'rotateY(180deg)' }}
                          className="flex flex-col justify-between h-full relative z-10 py-1"
                        >
                          <div className="w-full h-8 bg-slate-950 -mx-5 mt-2" />
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase text-slate-400 block text-right pr-2">CVV Security Code</span>
                            <div className="w-full bg-slate-100 text-black font-mono font-bold text-right px-4 py-1.5 rounded text-sm tracking-widest">
                              {paymentInfo.cardCvc || '•••'}
                            </div>
                          </div>
                          <div className="text-[9px] text-slate-500 text-center">
                            This card is protected by Velora Bank Encryption Guarantee.
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Form Inputs */}
                  <div className="md:col-span-6 space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-luxe-muted mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={paymentInfo.cardHolder}
                        onFocus={() => setIsFlipped(false)}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolder: e.target.value })}
                        className="w-full bg-luxe-bg border border-luxe-border focus:border-luxe-gold rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-luxe-muted mb-1">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4532 1234 5678 9010"
                        value={paymentInfo.cardNumber}
                        onFocus={() => setIsFlipped(false)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
                          setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
                        }}
                        className="w-full bg-luxe-bg border border-luxe-border focus:border-luxe-gold rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-luxe-muted mb-1">Expiry Date</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="12/28"
                          value={paymentInfo.cardExpiry}
                          onFocus={() => setIsFlipped(false)}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, '');
                            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                            setPaymentInfo({ ...paymentInfo, cardExpiry: val });
                          }}
                          className="w-full bg-luxe-bg border border-luxe-border focus:border-luxe-gold rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase text-luxe-muted mb-1">CVV / CVC</label>
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="123"
                          value={paymentInfo.cardCvc}
                          onFocus={() => setIsFlipped(true)}
                          onBlur={() => setIsFlipped(false)}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cardCvc: e.target.value.replace(/\D/g, '') })}
                          className="w-full bg-luxe-bg border border-luxe-border focus:border-luxe-gold rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl bg-luxe-bg border border-luxe-border text-xs text-slate-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl bg-luxe-gold text-black font-semibold text-xs hover:bg-luxe-goldHover transition-all flex items-center justify-center gap-2"
                  >
                    <span>Review Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 font-heading font-bold text-lg text-slate-100 pb-2 border-b border-luxe-border">
                  <ShieldCheck className="w-5 h-5 text-luxe-gold" />
                  <span>Review Order & Place Order</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-luxe-bg p-4 rounded-2xl border border-luxe-border">
                  <div>
                    <h5 className="font-semibold text-luxe-gold uppercase tracking-wider text-[10px] mb-1">Ship To</h5>
                    <p className="text-slate-200">{shippingInfo.name}</p>
                    <p className="text-luxe-muted">{shippingInfo.addressLine1}, {shippingInfo.city}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-luxe-gold uppercase tracking-wider text-[10px] mb-1">Payment Method</h5>
                    <p className="text-slate-200 font-mono">Stripe •••• 4242</p>
                    <p className="text-emerald-400 text-[10px]">Encrypted & Verified</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-xl bg-luxe-bg border border-luxe-border text-xs text-slate-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 py-4 rounded-xl bg-luxe-gold text-black font-bold text-sm hover:bg-luxe-goldHover transition-all shadow-xl shadow-luxe-gold/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Confirm & Pay ₹{subtotal.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 bg-luxe-card border border-luxe-border rounded-3xl p-6 space-y-6 shadow-2xl">
          <h3 className="font-heading font-bold text-base text-slate-100 border-b border-luxe-border pb-3">
            Order Summary ({items.length} items)
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 items-center text-xs">
                <img
                  src={item.product.images?.[0]?.url}
                  alt={item.product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-luxe-border"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-200 truncate">{item.product.name} {item.size ? `(Size: ${item.size})` : ''}</h4>
                  <p className="text-luxe-muted">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-luxe-gold">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-luxe-border space-y-2 text-xs">
            <div className="flex justify-between text-luxe-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-200">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-luxe-muted">
              <span>Express Insured Shipping</span>
              <span className="text-emerald-400 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-100 pt-3 border-t border-luxe-border">
              <span>Total Amount</span>
              <span className="text-luxe-gold text-lg">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
