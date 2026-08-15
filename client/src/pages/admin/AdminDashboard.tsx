import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DashboardStatsSkeleton } from '../../components/common/Skeleton';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Page Title */}
        <div>
          <h1 className="font-heading font-bold text-3xl text-slate-100">Executive Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time revenue, order fulfillment metrics, and stock alerts</p>
        </div>

        {loading ? (
          <DashboardStatsSkeleton />
        ) : (
          <>
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-2xl flex items-center justify-between shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
                  <h3 className="font-heading font-extrabold text-2xl text-luxe-gold">
                    ₹{data?.stats?.totalRevenue?.toFixed(2) || '0.00'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Live from DB
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-luxe-gold/10 border border-luxe-gold/30 flex items-center justify-center font-bold text-xl text-luxe-gold">
                  ₹
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-2xl flex items-center justify-between shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Total Orders</span>
                  <h3 className="font-heading font-extrabold text-2xl text-slate-100">
                    {data?.stats?.totalOrders || 0}
                  </h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Real customer purchases
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-2xl flex items-center justify-between shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Active Products</span>
                  <h3 className="font-heading font-extrabold text-2xl text-slate-100">
                    {data?.stats?.totalProducts || 0}
                  </h3>
                  <span className="text-[10px] text-slate-400">Database Catalog</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Package className="w-6 h-6" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-2xl flex items-center justify-between shadow-xl"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Registered Users</span>
                  <h3 className="font-heading font-extrabold text-2xl text-slate-100">
                    {data?.stats?.totalUsers || 0}
                  </h3>
                  <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {data?.stats?.lowStockCount || 0} Low Stock Alerts
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
              </motion.div>

            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Revenue Trend Area Chart */}
              <div className="lg:col-span-8 bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-bold text-base text-slate-100">7-Day Revenue Trend</h3>
                  <span className="text-xs font-bold text-luxe-gold bg-luxe-gold/10 px-3 py-1 rounded-full border border-luxe-gold/30">
                    Gross Sales (₹)
                  </span>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.revenueTrend || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#13131C', borderColor: '#262636', color: '#F8FAFC' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Distribution Pie Chart */}
              <div className="lg:col-span-4 bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                <h3 className="font-heading font-bold text-base text-slate-100">Order Status Breakdown</h3>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.orderStatusDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data?.orderStatusDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#13131C', borderColor: '#262636', color: '#F8FAFC' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#1F1F30]">
                  {data?.orderStatusDistribution?.map((item: any, idx: number) => (
                    <div key={item.name} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-slate-300 font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-100">{item.value} orders</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Low Stock Warning Table & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-6 bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 font-heading font-bold text-base text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Low Inventory Warnings (≤ 5 units)</span>
                </div>

                <div className="space-y-2">
                  {data?.lowStockProducts?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">All product stocks are healthy!</p>
                  ) : (
                    data?.lowStockProducts?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-[#161624] border border-[#262636] text-xs">
                        <div>
                          <h4 className="font-semibold text-slate-200">{item.name}</h4>
                          <span className="text-[10px] text-slate-400">SKU: {item.sku}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          {item.stock} left
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 bg-[#0E0E17] border border-[#1F1F30] p-6 rounded-3xl space-y-4 shadow-xl">
                <h3 className="font-heading font-bold text-base text-slate-100">Top Performing Products</h3>
                <div className="space-y-2">
                  {data?.topProducts?.map((prod: any, idx: number) => (
                    <div key={prod.productId} className="flex justify-between items-center p-3 rounded-xl bg-[#161624] border border-[#262636] text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-luxe-gold/20 text-luxe-gold font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-slate-200">{prod.name}</h4>
                          <span className="text-[10px] text-slate-400">{prod.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-luxe-gold">₹{prod.totalRevenue.toFixed(2)}</span>
                        <span className="block text-[10px] text-slate-400">{prod.quantitySold} units sold</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
};
