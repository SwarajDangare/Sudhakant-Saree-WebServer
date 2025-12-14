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
    <div className="mb-6">
      {/* Main Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - View Switcher */}
        <div className="flex items-center gap-2">
          {/* Grid View Buttons */}
          <div className="hidden lg:flex items-center gap-1 border border-gray-300 rounded p-1">
            <button
              onClick={() => onFilterChange({ gridCols: 2 })}
              className={`p-2 rounded transition ${
                filters.gridCols === 2
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="2 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="8" height="18" rx="1"/>
                <rect x="13" y="3" width="8" height="18" rx="1"/>
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ gridCols: 4 })}
              className={`p-2 rounded transition ${
                filters.gridCols === 4
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="4 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="4" height="4" rx="0.5"/>
                <rect x="10" y="3" width="4" height="4" rx="0.5"/>
                <rect x="17" y="3" width="4" height="4" rx="0.5"/>
                <rect x="3" y="10" width="4" height="4" rx="0.5"/>
                <rect x="10" y="10" width="4" height="4" rx="0.5"/>
                <rect x="17" y="10" width="4" height="4" rx="0.5"/>
                <rect x="3" y="17" width="4" height="4" rx="0.5"/>
                <rect x="10" y="17" width="4" height="4" rx="0.5"/>
                <rect x="17" y="17" width="4" height="4" rx="0.5"/>
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ gridCols: 6 })}
              className={`p-2 rounded transition ${
                filters.gridCols === 6
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="6 Columns"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="3" width="3" height="3" rx="0.5"/>
                <rect x="7" y="3" width="3" height="3" rx="0.5"/>
                <rect x="12" y="3" width="3" height="3" rx="0.5"/>
                <rect x="17" y="3" width="3" height="3" rx="0.5"/>
                <rect x="2" y="8" width="3" height="3" rx="0.5"/>
                <rect x="7" y="8" width="3" height="3" rx="0.5"/>
                <rect x="12" y="8" width="3" height="3" rx="0.5"/>
                <rect x="17" y="8" width="3" height="3" rx="0.5"/>
                <rect x="2" y="13" width="3" height="3" rx="0.5"/>
                <rect x="7" y="13" width="3" height="3" rx="0.5"/>
                <rect x="12" y="13" width="3" height="3" rx="0.5"/>
                <rect x="17" y="13" width="3" height="3" rx="0.5"/>
              </svg>
            </button>
            <button
              onClick={() => onFilterChange({ viewMode: 'list' })}
              className={`p-2 rounded transition ${
                filters.viewMode === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={onMobileFilterToggle}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            FILTER
          </button>
        </div>

        {/* Center - Product Count */}
        <div className="text-sm text-gray-600 font-medium hidden md:block">
          {totalProducts} PRODUCTS
        </div>

        {/* Right Side - Sort and Filter */}
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 whitespace-nowrap hidden sm:block">
              SORT BY
            </label>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded bg-white cursor-pointer text-sm focus:outline-none focus:ring-2 focus:ring-maroon"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>

          {/* Desktop Filter Button */}
          <button
            onClick={onMobileFilterToggle}
            className="hidden lg:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            FILTER
          </button>
        </div>
      </div>
    </div>
  );
}
