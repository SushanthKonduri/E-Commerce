import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Upload, X, Check, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToastStore } from '../../store/useToastStore';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    sku: '',
    categoryId: '',
    isFeatured: false,
    isNew: false,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  });

  const { addToast } = useToastStore();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching admin products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      stock: '25',
      sku: `LX-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryId: categories[0]?.id || '',
      isFeatured: false,
      isNew: true,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      stock: product.stock.toString(),
      sku: product.sku,
      categoryId: product.categoryId,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      imageUrl: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/products/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, imageUrl: res.data.url }));
      addToast({ type: 'success', title: 'Image Uploaded', message: 'Uploaded successfully' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: 'Could not upload image file' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock, 10),
        sku: formData.sku,
        categoryId: formData.categoryId,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        images: [{ url: formData.imageUrl, isPrimary: true }],
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        addToast({ type: 'success', title: 'Product Updated', message: `${formData.name} updated` });
      } else {
        await api.post('/products', payload);
        addToast({ type: 'success', title: 'Product Created', message: `${formData.name} created` });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: error.response?.data?.message || 'Error saving product details',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/products/${id}`);
      addToast({ type: 'success', title: 'Product Deleted', message: `${name} deleted` });
      fetchProducts();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: 'Could not delete product' });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F30] pb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-slate-100">Product Management</h1>
            <p className="text-xs text-slate-400 mt-1">Add, edit, modify stock, and upload product assets</p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-3 rounded-xl bg-luxe-gold text-black font-semibold text-xs flex items-center gap-2 hover:bg-luxe-goldHover transition-all shadow-lg shadow-luxe-gold/15 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Product</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0E0E17] border border-[#1F1F30] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 outline-none focus:border-luxe-gold"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Data Table */}
        <div className="bg-[#0E0E17] border border-[#1F1F30] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1F1F30] bg-[#161624] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">SKU</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#1F1F30]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading catalog...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No products match your search.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#161624]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#262636]"
                          />
                          <div>
                            <span className="font-semibold text-slate-100 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Rating: {p.rating}★</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-300">
                        {p.category?.name || 'General'}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-400">
                        {p.sku}
                      </td>

                      <td className="py-4 px-6 font-bold text-luxe-gold">
                        ₹{p.price.toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <span className={`font-semibold px-2.5 py-1 rounded-full text-[10px] ${
                          p.stock <= 5 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {p.stock} units
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex gap-1">
                          {p.isFeatured && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-luxe-gold/20 text-luxe-gold">Featured</span>}
                          {p.isNew && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400">New</span>}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 rounded-lg bg-[#161624] border border-[#262636] text-slate-300 hover:text-luxe-gold transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-lg bg-[#161624] border border-[#262636] text-slate-300 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Create / Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0E0E17] border border-[#1F1F30] rounded-3xl p-8 shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-[#1F1F30] mb-6">
                <h3 className="font-heading font-bold text-xl text-slate-100">
                  {editingProduct ? 'Edit Product' : 'Create New Product'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Title</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2.5 text-slate-100 font-mono outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Original Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-luxe-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stock Qty</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-luxe-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-luxe-gold cursor-pointer"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161624] border border-[#262636] rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-luxe-gold"
                    required
                  />
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Image URL / Local Upload</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 bg-[#161624] border border-[#262636] rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-luxe-gold"
                    />
                    <label className="px-4 py-2 rounded-xl bg-luxe-gold/20 text-luxe-gold font-semibold flex items-center gap-1 cursor-pointer border border-luxe-gold/40 hover:bg-luxe-gold/30">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-[#262636]">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-luxe-gold w-4 h-4 rounded"
                    />
                    <span className="text-slate-200">Featured Drop</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="accent-luxe-gold w-4 h-4 rounded"
                    />
                    <span className="text-slate-200">New Arrival Tag</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-3 border-t border-[#1F1F30]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#161624] border border-[#262636] text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-luxe-gold text-black font-semibold hover:bg-luxe-goldHover"
                  >
                    {editingProduct ? 'Save Changes' : 'Publish Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
};
