'use client';

import { useState, useEffect } from 'react';

interface Filters {
  search: string;
  sort: string;
  viewMode: 'grid' | 'list';
  gridCols: 2 | 3 | 4;
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
      {/* Search Bar - Mobile */}
      <div className="lg:hidden mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search sarees..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition bg-white"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side - Mobile Filter Button / Desktop Search */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={onMobileFilterToggle}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-maroon text-white rounded-lg hover:bg-deep-maroon transition font-medium text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            FILTER BY
          </button>

          {/* Desktop Search */}
          <div className="hidden lg:block flex-1 min-w-[300px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search sarees..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition bg-white text-sm"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Sort and Product Count */}
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 uppercase whitespace-nowrap">
              SORT BY:
            </label>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition bg-white cursor-pointer text-sm"
            >
              <option value="featured">Top Sellers</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm font-medium text-gray-600 whitespace-nowrap hidden sm:block">
            {totalProducts} Products Found
          </div>
        </div>
      </div>
    </div>
  );
}
