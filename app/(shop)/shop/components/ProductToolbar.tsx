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
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition"
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

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 hidden md:block">Sort:</label>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-saffron transition bg-white cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="newest">New Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A-Z</option>
            <option value="name-desc">Name: Z-A</option>
          </select>
        </div>

        {/* View Mode Toggle (Desktop only) */}
        <div className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onFilterChange({ viewMode: 'grid' })}
            className={`p-2 rounded transition ${
              filters.viewMode === 'grid'
                ? 'bg-maroon text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Grid View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => onFilterChange({ viewMode: 'list' })}
            className={`p-2 rounded transition ${
              filters.viewMode === 'list'
                ? 'bg-maroon text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="List View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Grid Columns (Desktop Grid View only) */}
        {filters.viewMode === 'grid' && (
          <div className="hidden lg:flex items-center gap-1 border border-gray-300 rounded-lg p-1">
            {[2, 3, 4].map((cols) => (
              <button
                key={cols}
                onClick={() => onFilterChange({ gridCols: cols as 2 | 3 | 4 })}
                className={`px-3 py-2 text-sm font-medium rounded transition ${
                  filters.gridCols === cols
                    ? 'bg-maroon text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cols}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
          {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={onMobileFilterToggle}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-maroon text-white rounded-lg hover:bg-deep-maroon transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );
}
