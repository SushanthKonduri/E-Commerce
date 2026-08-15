import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, Eye, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToastStore } from '../../store/useToastStore';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToastStore();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      addToast({ type: 'success', title: 'Status Updated', message: `Order status set to ${status}` });
      fetchOrders();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Update Error', message: 'Could not update order status' });
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#1F1F30] pb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-slate-100">Orders Management</h1>
            <p className="text-xs text-slate-400 mt-1">Review customer orders, update shipping states, and audit receipts</p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-[#161624] border border-[#262636] text-slate-300 hover:text-luxe-gold"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by order #, customer name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E0E17] border border-[#1F1F30] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-luxe-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Table */}
        <div className="bg-[#0E0E17] border border-[#1F1F30] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F1F30] bg-[#161624] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Order Number</th>
                  <th className="py-4 px-6">Customer Details</th>
                  <th className="py-4 px-6">Items Purchased</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Order Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1F1F30]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading orders...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#161624]/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-100">
                        #{o.orderNumber}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-200 block">{o.customerName}</span>
                        <span className="text-[10px] text-slate-400">{o.customerEmail}</span>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        {o.items?.map((item: any) => (
                          <div key={item.id} className="text-[11px] text-slate-300">
                            • {item.product?.name || 'Product'} × {item.quantity} (₹{item.price.toFixed(2)})
                          </div>
                        ))}
                      </td>

                      <td className="py-4 px-6 font-bold text-luxe-gold text-sm">
                        ₹{o.totalAmount.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="bg-[#161624] border border-luxe-gold/30 rounded-xl px-3 py-1.5 text-xs text-luxe-gold font-semibold outline-none focus:border-luxe-gold cursor-pointer"
                        >
                          <option value="PLACED">Placed</option>
                          <option value="PACKED">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};
