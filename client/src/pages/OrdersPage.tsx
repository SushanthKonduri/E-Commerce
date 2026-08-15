import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToastStore } from '../store/useToastStore';
import { useCartStore } from '../store/useCartStore';
import { EmptyState } from '../components/common/EmptyState';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToastStore();
  const { addToCart } = useCartStore();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      addToast({ type: 'success', title: 'Order Cancelled', message: 'Order has been cancelled and refunded' });
      fetchOrders();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Cancel Failed',
        message: error.response?.data?.message || 'Could not cancel order',
      });
    }
  };

  const handleReorder = async (order: any) => {
    for (const item of order.items) {
      await addToCart(item.productId, item.quantity);
    }
    addToast({ type: 'success', title: 'Items Added to Bag', message: 'Order items re-added to your cart' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered</span>
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40">
            <Truck className="w-3.5 h-3.5" />
            <span>In Transit</span>
          </span>
        );
      case 'PAID':
      case 'PENDING':
      case 'PLACED':
      case 'PACKED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-luxe-gold border border-luxe-gold/40">
            <Clock className="w-3.5 h-3.5" />
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-luxe-border pb-6 flex justify-between items-center">
        <div>
          <h1 className="font-heading font-bold text-3xl text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Package className="w-7 h-7 text-luxe-gold" />
            <span>My Order History</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-luxe-muted mt-1">Track and manage your past luxury acquisitions</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-luxe-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          type="orders"
          title="No Orders Found"
          description="You haven’t placed any orders yet. Discover our latest collection and experience luxury."
          actionText="Browse Collection"
          actionLink="/products"
        />
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-luxe-card border border-slate-200 dark:border-luxe-border rounded-3xl p-6 shadow-xl space-y-4"
              >
                {/* Order Top Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-luxe-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">
                        Order #{order.orderNumber}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-luxe-muted">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-luxe-muted">Total Amount</span>
                    <h4 className="font-heading font-bold text-xl text-luxe-gold">
                      ₹{order.totalAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>

                {/* 5-Step Visual Order Tracker */}
                {order.status !== 'CANCELLED' ? (
                  <div className="py-4 px-2 sm:px-6 bg-slate-50 dark:bg-luxe-bg/60 rounded-2xl border border-slate-200 dark:border-luxe-border/60">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-luxe-gold" />
                        <span>Live Delivery Tracker</span>
                      </span>
                      <span className="text-[11px] font-bold text-luxe-gold uppercase">
                        Current Status: {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {(() => {
                      const stages = [
                        { id: 'PLACED', label: 'Placed' },
                        { id: 'PACKED', label: 'Packed' },
                        { id: 'SHIPPED', label: 'Shipped' },
                        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                        { id: 'DELIVERED', label: 'Delivered' },
                      ];

                      const statusOrder: Record<string, number> = {
                        PENDING: 1,
                        PAID: 1,
                        PLACED: 1,
                        PACKED: 2,
                        SHIPPED: 3,
                        OUT_FOR_DELIVERY: 4,
                        DELIVERED: 5,
                      };

                      const currentStep = statusOrder[order.status] || 1;

                      return (
                        <div className="relative flex items-center justify-between w-full pt-2 pb-1">
                          {/* Connector Bar */}
                          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 -z-0" />
                          <div
                            className="absolute top-1/2 left-4 h-1 bg-luxe-gold -translate-y-1/2 transition-all duration-500 -z-0"
                            style={{
                              width: `${((currentStep - 1) / (stages.length - 1)) * 90}%`,
                            }}
                          />

                          {stages.map((stage, idx) => {
                            const stepNum = idx + 1;
                            const isCompleted = stepNum <= currentStep;
                            const isCurrent = stepNum === currentStep;

                            return (
                              <div key={stage.id} className="relative z-10 flex flex-col items-center gap-1.5">
                                <div
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                                    isCurrent
                                      ? 'bg-luxe-gold text-black shadow-lg shadow-luxe-gold/40 ring-4 ring-luxe-gold/20 scale-110'
                                      : isCompleted
                                      ? 'bg-emerald-500 text-black'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  {isCompleted && !isCurrent ? (
                                    <CheckCircle2 className="w-4 h-4 text-black" />
                                  ) : (
                                    stepNum
                                  )}
                                </div>
                                <span
                                  className={`text-[9px] sm:text-[11px] font-medium text-center ${
                                    isCurrent
                                      ? 'text-luxe-gold font-bold'
                                      : isCompleted
                                      ? 'text-slate-800 dark:text-slate-200'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                >
                                  {stage.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center text-xs text-rose-500 dark:text-rose-400 font-medium">
                    This order was cancelled. Restock refund processed.
                  </div>
                )}

                {/* Items List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-3 items-center bg-slate-50 dark:bg-luxe-bg p-3 rounded-2xl border border-slate-200 dark:border-luxe-border/60">
                      <img
                        src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                        alt={item.product?.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-luxe-border"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product?.slug}`} className="font-semibold text-xs text-slate-900 dark:text-slate-200 hover:text-luxe-gold truncate block">
                          {item.product?.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 dark:text-luxe-muted">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-luxe-border/40">
                  {order.status !== 'CANCELLED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
                    >
                      Cancel Order
                    </button>
                  )}

                  <button
                    onClick={() => handleReorder(order)}
                    className="px-4 py-2 rounded-xl bg-luxe-gold/10 border border-luxe-gold/30 text-luxe-gold hover:bg-luxe-gold/20 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder Items</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
};
