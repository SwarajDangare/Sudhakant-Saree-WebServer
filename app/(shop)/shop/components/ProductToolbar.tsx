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
    <div className="bg-white border-b border-gray-200">
      {/* Desktop Toolbar */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        {/* Left: Grid View Options */}
        <div className="flex items-center gap-3">
          {/* Grid Column Toggles */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => onFilterChange({ gridCols: 2 })}
              className={`p-2.5 transition-colors ${filters.gridCols === 2
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              title="2 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <rect x="3" y="13" width="8" height="8" rx="1" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ gridCols: 3 })}
              className={`p-2.5 transition-colors ${filters.gridCols === 3
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              title="3 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="5" height="8" rx="1" />
                <rect x="9" y="3" width="5" height="8" rx="1" />
                <rect x="16" y="3" width="5" height="8" rx="1" />
                <rect x="2" y="13" width="5" height="8" rx="1" />
                <rect x="9" y="13" width="5" height="8" rx="1" />
                <rect x="16" y="13" width="5" height="8" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ gridCols: 4 })}
              className={`p-2.5 transition-colors ${filters.gridCols === 4
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              title="4 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="4" height="8" rx="0.5" />
                <rect x="7" y="3" width="4" height="8" rx="0.5" />
                <rect x="12" y="3" width="4" height="8" rx="0.5" />
                <rect x="17" y="3" width="4" height="8" rx="0.5" />
                <rect x="2" y="13" width="4" height="8" rx="0.5" />
                <rect x="7" y="13" width="4" height="8" rx="0.5" />
                <rect x="12" y="13" width="4" height="8" rx="0.5" />
                <rect x="17" y="13" width="4" height="8" rx="0.5" />
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ gridCols: 6 })}
              className={`p-2.5 transition-colors ${filters.gridCols === 6
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              title="6 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="2.5" height="8" rx="0.5" />
                <rect x="6" y="3" width="2.5" height="8" rx="0.5" />
                <rect x="10" y="3" width="2.5" height="8" rx="0.5" />
                <rect x="14" y="3" width="2.5" height="8" rx="0.5" />
                <rect x="18" y="3" width="2.5" height="8" rx="0.5" />
                <rect x="2" y="13" width="2.5" height="8" rx="0.5" />
                <rect x="6" y="13" width="2.5" height="8" rx="0.5" />
                <rect x="10" y="13" width="2.5" height="8" rx="0.5" />
                <rect x="14" y="13" width="2.5" height="8" rx="0.5" />
                <rect x="18" y="13" width="2.5" height="8" rx="0.5" />
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ viewMode: 'list' })}
              className={`p-2.5 transition-colors ${filters.viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: Product Count */}
        <div className="text-sm text-gray-600 font-medium">
          {totalProducts} PRODUCTS
        </div>

        {/* Right: Sort By and Filter */}
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">SORT BY</label>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value })}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-maroon transition bg-white cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest to Oldest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Discount: High to Low</option>
              <option value="name-desc">Discount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="lg:hidden px-4 py-3 space-y-3">
        {/* Top Row: Filter and Sort */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMobileFilterToggle}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            FILTER
          </button>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-maroon transition bg-white cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          {/* Grid Toggle for Mobile */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => onFilterChange({ gridCols: 2 })}
              className={`p-2 transition-colors ${filters.gridCols === 2
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600'
                }`}
              title="2 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ gridCols: 4 })}
              className={`p-2 transition-colors ${filters.gridCols === 4
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600'
                }`}
              title="4 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="4" height="8" rx="0.5" />
                <rect x="7" y="3" width="4" height="8" rx="0.5" />
                <rect x="12" y="3" width="4" height="8" rx="0.5" />
                <rect x="17" y="3" width="4" height="8" rx="0.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Count */}
        <div className="text-center text-sm text-gray-600">
          {totalProducts} PRODUCTS
        </div>
      </div>
    </div>
  );
}
