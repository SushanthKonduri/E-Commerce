import React from 'react';
import { SlidersHorizontal, RotateCcw, Check, Star } from 'lucide-react';

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStock: boolean;
  sortBy: string;
}

interface ProductFilterPanelProps {
  categories: { id: string; name: string; slug: string; _count?: { products: number } }[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="bg-luxe-card border border-luxe-border rounded-2xl p-6 flex flex-col gap-6 shadow-xl sticky top-24">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-luxe-border pb-4">
        <div className="flex items-center gap-2 text-slate-100 font-heading font-semibold">
          <SlidersHorizontal className="w-4 h-4 text-luxe-gold" />
          <span>Refine Catalog</span>
        </div>

        <button
          onClick={onResetFilters}
          className="text-xs text-luxe-muted hover:text-luxe-gold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-luxe-muted mb-2">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          className="w-full bg-luxe-bg border border-luxe-border focus:border-luxe-gold rounded-xl py-2.5 px-3 text-xs text-slate-200 outline-none transition-all cursor-pointer"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popularity">Most Popular</option>
        </select>
      </div>

      {/* Category List */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-luxe-muted mb-2">
          Categories
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ category: '' })}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-all ${
              filters.category === ''
                ? 'bg-luxe-gold/20 text-luxe-gold font-semibold border border-luxe-gold/30'
                : 'text-slate-300 hover:bg-luxe-bg hover:text-slate-100'
            }`}
          >
            <span>All Categories</span>
            {filters.category === '' && <Check className="w-3.5 h-3.5 text-luxe-gold" />}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onFilterChange({ category: cat.slug })}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex justify-between items-center transition-all ${
                filters.category === cat.slug
                  ? 'bg-luxe-gold/20 text-luxe-gold font-semibold border border-luxe-gold/30'
                  : 'text-slate-300 hover:bg-luxe-bg hover:text-slate-100'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {filters.category === cat.slug ? (
                <Check className="w-3.5 h-3.5 text-luxe-gold" />
              ) : (
                <span className="text-[10px] text-luxe-muted">({cat._count?.products || 0})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-luxe-muted">
            Max Price (₹)
          </label>
          <span className="text-xs font-bold text-luxe-gold">₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="500"
          max="200000"
          step="500"
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: parseFloat(e.target.value) })}
          className="w-full accent-luxe-gold cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-luxe-muted mt-1">
          <span>₹500</span>
          <span>₹2,00,000+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-luxe-muted mb-2">
          Minimum Rating
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 3, 4, 4.5].map((ratingVal) => (
            <button
              key={ratingVal}
              onClick={() => onFilterChange({ minRating: ratingVal })}
              className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                filters.minRating === ratingVal
                  ? 'bg-luxe-gold text-black'
                  : 'bg-luxe-bg border border-luxe-border text-slate-300 hover:border-luxe-gold'
              }`}
            >
              <span>{ratingVal === 0 ? 'All' : `${ratingVal}+`}</span>
              {ratingVal > 0 && <Star className="w-3 h-3 fill-current" />}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="pt-2 border-t border-luxe-border">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFilterChange({ inStock: e.target.checked })}
            className="w-4 h-4 rounded accent-luxe-gold bg-luxe-bg border-luxe-border cursor-pointer"
          />
          <span className="text-xs font-medium text-slate-200">In Stock Only</span>
        </label>
      </div>

    </div>
  );
};
