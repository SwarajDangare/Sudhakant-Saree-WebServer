'use client';

import { useState, useEffect } from 'react';

interface Filters {
  search: string;
  sort: string;
  viewMode: 'grid' | 'list';
  gridCols: 2 | 3 | 4 | 6;
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

  /* logic to track header visibility matching ScrollWrapper */
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Match ScrollWrapper logic: hide on scroll down > 50px, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`bg-white border-b border-gray-100 sticky z-40 transition-all duration-300 ${isHeaderVisible ? 'top-20' : 'top-0'}`}
    >
      {/* Desktop Toolbar */}
      <div className="hidden lg:flex items-stretch justify-between h-14">
        {/* Left: View Options */}
        <div className="flex items-center px-6 gap-4">
          <div className="flex items-center gap-2">
            {/* 2 Columns */}
            <button
              onClick={() => onFilterChange({ gridCols: 2, viewMode: 'grid' })}
              className={`p-1.5 transition-colors ${filters.gridCols === 2 && filters.viewMode === 'grid' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              title="2 Columns"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h7v7H4V4zM13 4h7v7h-7V4zM4 13h7v7H4v-7zM13 13h7v7h-7v-7z" />
              </svg>
            </button>

            {/* 3 Columns */}
            <button
              onClick={() => onFilterChange({ gridCols: 3, viewMode: 'grid' })}
              className={`p-1.5 transition-colors ${filters.gridCols === 3 && filters.viewMode === 'grid' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              title="3 Columns"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zM10 4h4v4h-4V4zM16 4h4v4h-4V4zM4 10h4v4H4v-4zM10 10h4v4h-4v-4zM16 10h4v4h-4v-4zM4 16h4v4H4v-4zM10 16h4v4h-4v-4zM16 16h4v4h-4v-4z" />
              </svg>
            </button>

            {/* 4 Columns */}
            <button
              onClick={() => onFilterChange({ gridCols: 4, viewMode: 'grid' })}
              className={`p-1.5 transition-colors ${filters.gridCols === 4 && filters.viewMode === 'grid' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              title="4 Columns"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {/* 4x4 Grid of squares: 4px size, 2px gap. Origin (1,1) */}
                {/* Row 1 */}
                <rect x="1" y="1" width="4" height="4" />
                <rect x="7" y="1" width="4" height="4" />
                <rect x="13" y="1" width="4" height="4" />
                <rect x="19" y="1" width="4" height="4" />

                {/* Row 2 */}
                <rect x="1" y="7" width="4" height="4" />
                <rect x="7" y="7" width="4" height="4" />
                <rect x="13" y="7" width="4" height="4" />
                <rect x="19" y="7" width="4" height="4" />

                {/* Row 3 */}
                <rect x="1" y="13" width="4" height="4" />
                <rect x="7" y="13" width="4" height="4" />
                <rect x="13" y="13" width="4" height="4" />
                <rect x="19" y="13" width="4" height="4" />

                {/* Row 4 */}
                <rect x="1" y="19" width="4" height="4" />
                <rect x="7" y="19" width="4" height="4" />
                <rect x="13" y="19" width="4" height="4" />
                <rect x="19" y="19" width="4" height="4" />
              </svg>
            </button>

            {/* List View */}
            <button
              onClick={() => onFilterChange({ viewMode: 'list' })}
              className={`p-1.5 transition-colors ${filters.viewMode === 'list' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Center: Count */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">
            {totalProducts} Products
          </span>
        </div>

        {/* Right: Sort & Filter */}
        <div className="flex items-stretch border-l border-gray-100">
          {/* Sort */}
          <div className="flex items-center px-6 border-r border-gray-100 relative group cursor-pointer">
            <span className="text-xs font-medium tracking-widest text-gray-500 uppercase mr-2">Sort By</span>
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value })}
              className="appearance-none bg-transparent border-none text-xs font-medium uppercase text-gray-900 focus:ring-0 cursor-pointer pr-4"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <svg className="w-3 h-3 text-gray-400 absolute right-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Filter */}
          <button
            onClick={onMobileFilterToggle} // Re-using mobile toggle for desktop sidebar trigger
            className="flex items-center px-8 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs font-medium tracking-widest text-gray-500 uppercase">Filter</span>
          </button>
        </div>
      </div>

      {/* Mobile Toolbar (Simplified) */}
      <div className="lg:hidden grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
        <div className="relative flex items-center justify-center p-3">
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="absolute inset-0 w-full h-full opacity-0 z-10"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Low to High</option>
            <option value="price-desc">High to Low</option>
          </select>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-900">
            <span>Sort By</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <button
          onClick={onMobileFilterToggle}
          className="flex items-center justify-center gap-2 p-3 text-xs font-medium uppercase tracking-widest text-gray-900"
        >
          <span>Filter</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
