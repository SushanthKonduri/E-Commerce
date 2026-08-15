import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilterPanel, FilterState } from '../components/product/ProductFilterPanel';
import { ProductGridSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const initialFilters: FilterState = {
    category: searchParams.get('category') || '',
    minPrice: 0,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : 200000,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : 0,
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'newest',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const search = searchParams.get('search') || '';
  const isFeatured = searchParams.get('featured') === 'true';
  const isNew = searchParams.get('isNew') === 'true';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', pagination.page.toString());
        params.append('limit', '12');
        if (search) params.append('search', search);
        if (filters.category) params.append('category', filters.category);
        if (filters.maxPrice < 2000) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.minRating > 0) params.append('minRating', filters.minRating.toString());
        if (filters.inStock) params.append('inStock', 'true');
        if (isFeatured) params.append('featured', 'true');
        if (isNew) params.append('isNew', 'true');
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const res = await api.get(`/products?${params.toString()}`);
        setProducts(res.data.products || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, search, isFeatured, isNew, pagination.page]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 200000,
      minRating: 0,
      inStock: false,
      sortBy: 'newest',
    });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-luxe-border pb-6">
        <div>
          <h1 className="font-heading font-bold text-3xl sm:text-4xl text-slate-100">
            {search
              ? `Search Results for "${search}"`
              : filters.category
              ? `Category: ${filters.category.replace('-', ' ')}`
              : isFeatured
              ? 'Featured Flagship Collection'
              : isNew
              ? 'New Arrivals'
              : 'All Luxe Products'}
          </h1>
          <p className="text-xs text-luxe-muted mt-1">
            Showing {pagination.total} premium products
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-luxe-card border border-luxe-border text-xs font-semibold text-slate-200"
        >
          <SlidersHorizontal className="w-4 h-4 text-luxe-gold" />
          <span>Filters & Sort</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <ProductFilterPanel
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Products Column */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              type="search"
              title="No Products Found"
              description="No products match your selected filters or search terms. Try clearing filters to see more results."
              actionText="Reset Filters"
              actionLink="#"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <ProductCard key={prod.id} {...prod} />
                ))}
              </div>

              {/* Pagination Bar */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-8 border-t border-luxe-border">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    className="p-2.5 rounded-xl bg-luxe-card border border-luxe-border hover:border-luxe-gold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-semibold text-slate-300 px-4">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    className="p-2.5 rounded-xl bg-luxe-card border border-luxe-border hover:border-luxe-gold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* Mobile Filter Slide-In Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 h-full w-4/5 max-w-xs bg-luxe-card border-r border-luxe-border p-6 overflow-y-auto z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-bold text-lg text-slate-100">Filters</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProductFilterPanel
                categories={categories}
                filters={filters}
                onFilterChange={(updated) => {
                  handleFilterChange(updated);
                  setIsMobileFilterOpen(false);
                }}
                onResetFilters={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
