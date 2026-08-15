import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, User as UserIcon, Calendar, ShoppingBag, Edit, Trash2, X, Check, Mail, Key } from 'lucide-react';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToastStore } from '../../store/useToastStore';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  createdAt: string;
  _count?: {
    orders?: number;
    reviews?: number;
  };
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToastStore();

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN' });
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersSilent = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (error) {
      // Background auto-refresh silent error handler
    }
  };

  useEffect(() => {
    fetchUsers();

    // Live auto-refresh every 5 seconds so new logins and account updates show automatically
    const interval = setInterval(() => {
      fetchUsersSilent();
    }, 5000);

    // Auto-update when switching back to the admin user directory tab
    const handleFocus = () => fetchUsersSilent();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const getFormattedName = (user: UserItem): string => {
    if (user.name && user.name.trim() && !user.name.toLowerCase().startsWith('testuser_')) {
      return user.name.trim();
    }
    if (user.email && user.email.includes('@')) {
      const prefix = user.email.split('@')[0];
      const cleaned = prefix.replace(/[0-9_.]+/g, ' ').trim();
      if (cleaned) {
        return cleaned
          .split(' ')
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }
    }
    return user.name || 'Customer Account';
  };


  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'CUSTOMER',
    });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editForm.name.trim()) {
      addToast({ type: 'error', title: 'Validation Error', message: 'User name cannot be empty.' });
      return;
    }
    if (!editForm.email.trim()) {
      addToast({ type: 'error', title: 'Validation Error', message: 'User email address cannot be empty.' });
      return;
    }

    setUpdating(true);
    try {
      const res = await api.put(`/admin/users/${editingUser.id}`, editForm);
      addToast({
        type: 'success',
        title: 'User Updated',
        message: res.data.message || 'User account details updated successfully.',
      });
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error.response?.data?.message || 'Could not update user details.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'CUSTOMER' : 'ADMIN';
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      addToast({ type: 'success', title: 'Role Updated', message: `User role changed to ${nextRole}` });
      fetchUsers();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Update Error', message: error.response?.data?.message || 'Could not change user role' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      addToast({ type: 'success', title: 'User Deleted', message: 'User account removed successfully.' });
      setDeletingId(null);
      fetchUsers();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Delete Error', message: error.response?.data?.message || 'Could not delete user account' });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.id && u.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#1F1F30] pb-6 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-bold text-3xl text-slate-100 flex items-center gap-3">
              <Users className="w-7 h-7 text-luxe-gold" />
              <span>User Directory & Account Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              View, edit, and manage registered customer and administrator accounts ({users.length} total users)
            </p>
          </div>

          <div className="px-4 py-2 bg-[#161624] border border-[#262636] rounded-2xl text-xs text-luxe-gold font-bold">
            Total Accounts: {users.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search users by name, email, or account ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E0E17] border border-[#1F1F30] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-luxe-gold transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Table */}
        <div className="bg-[#0E0E17] border border-[#1F1F30] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F1F30] bg-[#161624] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">User Account</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role Privilege</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Orders Count</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1F1F30]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading user directory...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No matching user accounts found.</td>
                  </tr>
                ) : filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#161624]/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-luxe-gold/20 border border-luxe-gold/40 flex items-center justify-center text-luxe-gold font-bold text-sm overflow-hidden flex-shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={getFormattedName(u)} className="w-full h-full object-cover" />
                          ) : (
                            <span>{getFormattedName(u).charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block text-sm">{getFormattedName(u)}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {u.id?.slice(0, 13)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {u.email}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-luxe-gold/20 text-luxe-gold border border-luxe-gold/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        <Shield className="w-3 h-3" />
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                        <ShoppingBag className="w-3.5 h-3.5 text-luxe-gold" />
                        <span>{u._count?.orders || 0} orders</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 rounded-xl bg-[#161624] border border-[#262636] text-slate-300 hover:text-luxe-gold hover:border-luxe-gold/40 transition-all flex items-center gap-1.5 text-xs font-semibold px-3"
                          title="Edit User Account"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        {/* Promote / Demote */}
                        <button
                          onClick={() => handleRoleToggle(u.id, u.role)}
                          className="px-3 py-2 rounded-xl bg-[#161624] border border-[#262636] text-xs font-semibold text-slate-300 hover:text-luxe-gold hover:border-luxe-gold/40 transition-all"
                        >
                          {u.role === 'ADMIN' ? 'Demote' : 'Promote'}
                        </button>

                        {/* Delete Button */}
                        {deletingId === u.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-600 text-white font-bold text-[10px] hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeletingId(u.id)}
                            className="p-2 rounded-xl bg-[#161624] border border-[#262636] text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#12121C] border border-[#262638] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#262638] pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-luxe-gold/10 text-luxe-gold border border-luxe-gold/30">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-100">Edit User Account</h3>
                    <p className="text-xs text-slate-400">Update account details, name, email, and privileges</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-xl bg-[#1A1A2B] text-slate-400 hover:text-slate-100 hover:bg-[#262638] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveUser} className="space-y-4">
                
                {/* Account ID Badge */}
                <div className="bg-[#1A1A2B] border border-[#262638] px-3.5 py-2 rounded-xl text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Account User ID</span>
                  <span className="font-mono text-luxe-gold">{editingUser.id}</span>
                </div>

                {/* User Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="e.g. Sushanth Konduri"
                      required
                      className="w-full bg-[#0A0A10] border border-[#262638] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-luxe-gold transition-colors"
                    />
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="user@example.com"
                      required
                      className="w-full bg-[#0A0A10] border border-[#262638] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-luxe-gold transition-colors"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Account Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Role Privilege <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'CUSTOMER' | 'ADMIN' })}
                      className="w-full bg-[#0A0A10] border border-[#262638] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-luxe-gold transition-colors appearance-none"
                    >
                      <option value="CUSTOMER">CUSTOMER - Storefront Access</option>
                      <option value="ADMIN">ADMIN - Full Portal & Store Control</option>
                    </select>
                    <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#262638] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl bg-[#1A1A2B] border border-[#262638] text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-[#262638] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-luxe-gold text-slate-950 font-bold text-xs hover:bg-luxe-gold/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{updating ? 'Saving Changes...' : 'Save User Account'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

