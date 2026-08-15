import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-luxe-card border border-luxe-border rounded-2xl overflow-hidden p-4 flex flex-col gap-3 shadow-lg">
      <div className="skeleton-box w-full aspect-square rounded-xl" />
      <div className="flex justify-between items-center">
        <div className="skeleton-box h-3 w-1/3 rounded" />
        <div className="skeleton-box h-3 w-1/4 rounded" />
      </div>
      <div className="skeleton-box h-5 w-4/5 rounded" />
      <div className="skeleton-box h-4 w-1/2 rounded" />
      <div className="flex justify-between items-center mt-2">
        <div className="skeleton-box h-6 w-1/3 rounded" />
        <div className="skeleton-box h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-luxe-card border border-luxe-border rounded-2xl p-6 flex flex-col gap-3">
          <div className="skeleton-box h-4 w-1/2 rounded" />
          <div className="skeleton-box h-8 w-3/4 rounded" />
          <div className="skeleton-box h-3 w-1/3 rounded" />
        </div>
      ))}
    </div>
  );
};
