import React, { useEffect, useState } from 'react';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminInventory: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/inventory/logs');
        setLogs(res.data.logs || []);
      } catch (error) {
        console.error('Error fetching inventory logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#1F1F30] pb-6">
          <h1 className="font-heading font-bold text-3xl text-slate-100">Inventory Audit Logs</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time stock deduction, restock tracking, and order audit trail</p>
        </div>

        {/* Audit Log Table */}
        <div className="bg-[#0E0E17] border border-[#1F1F30] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F1F30] bg-[#161624] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Product Item</th>
                  <th className="py-4 px-6">Action</th>
                  <th className="py-4 px-6">Change</th>
                  <th className="py-4 px-6">Previous</th>
                  <th className="py-4 px-6">New Stock</th>
                  <th className="py-4 px-6">Reason / Note</th>
                  <th className="py-4 px-6">Responsible</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1F1F30]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">Loading audit trail...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">No inventory logs recorded yet.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#161624]/60 transition-colors">
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-200">
                        {log.product?.name}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-luxe-gold/10 text-luxe-gold border border-luxe-gold/30">
                          {log.changeType}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          log.quantityChange > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400">
                        {log.previousStock}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-100">
                        {log.newStock}
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        {log.reason || 'N/A'}
                      </td>

                      <td className="py-4 px-6 text-slate-400 font-medium">
                        {log.admin?.name || 'System / Customer'}
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
