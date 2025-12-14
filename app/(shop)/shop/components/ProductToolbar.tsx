'use client';

import { useState, useEffect } from 'react';

interface Filters {
  search: string;
  sort: string;
  viewMode: 'grid' | 'list';
  gridCols: 2 | 3 | 4 | 5 | 6;
}

interface ProductToolbarProps {
  totalProducts: number;
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onMobileFilterToggle: () => void;
}

export default function ProductToolbar({
  totalProducts,
  filters,
  onFilterChange,
  onMobileFilterToggle,
}: ProductToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchInput });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onFilterChange]);

  return (
    <div className="bg-white border-b border-gray-100">
      {/* Desktop Toolbar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        {/* Left: Product Count */}
        <div className="text-sm font-medium text-gray-900">
          {totalProducts} PRODUCTS
        </div>

        {/* Right: Sort By */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer relative">
            <label className="text-xs tracking-widest text-gray-500 font-medium uppercase">Sort By:</label>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value })}
              className="appearance-none pl-2 pr-8 py-1 text-sm font-medium text-gray-900 border-none focus:ring-0 bg-transparent cursor-pointer hover:text-[var(--maroon)] transition-colors"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Discount: High to Low</option>
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="lg:hidden grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
        {/* Sort Button (Native Select) */}
        <div className="relative flex items-center justify-center p-3">
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 z-10"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 uppercase tracking-wide">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Sort</span>
          </div>
        </div>

        {/* Filter Trigger */}
        <button
          onClick={onMobileFilterToggle}
          className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-gray-900 uppercase tracking-wide"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filter</span>
        </button>
      </div>

      {/* Mobile Product Count (Subtle) */}
      <div className="lg:hidden text-center py-2 bg-gray-50 text-xs text-gray-500 border-b border-gray-100">
        {totalProducts} Products
      </div>
    </div>
  );
}
