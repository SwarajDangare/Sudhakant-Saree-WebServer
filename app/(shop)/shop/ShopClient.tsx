'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductFilters from './components/ProductFilters';
import ProductToolbar from './components/ProductToolbar';
import ActiveFilters from './components/ActiveFilters';
import ProductGrid from './components/ProductGrid';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  material: string | null;
  occasion: string | null;
  workType: string | null;
  borderType: string | null;
  blousePieceIncluded: boolean;
  discountType: 'NONE' | 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  categoryName: string;
  categorySlug: string;
  sectionName: string;
  sectionSlug: string;
  sectionId: string | null;
  categoryId: string | null;
  colors: Array<{
    id: string;
    color: string;
    colorCode: string;
    inStock: boolean;
  }>;
}

interface FilterOptions {
  sections: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string; sectionId: string }>;
  materials: string[];
  occasions: string[];
  workTypes: string[];
  borderTypes: string[];
  colors: Array<{ color: string; colorCode: string }>;
  priceRange: { min: number; max: number };
}

interface Filters {
  sections: string[];
  categories: string[];
  priceMin: number;
  priceMax: number;
  colors: string[];
  materials: string[];
  occasions: string[];
  workTypes: string[];
  borderTypes: string[];
  blousePieceIncluded: boolean | null;
  inStockOnly: boolean;
  onSale: boolean;
  discountRange: string | null;
  search: string;
  sort: string;
  viewMode: 'grid' | 'list';
  gridCols: 2 | 3 | 4 | 6;
}

interface ShopClientProps {
  products: Product[];
  filterOptions: FilterOptions;
}

export default function ShopClient({ products, filterOptions }: ShopClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<Filters>({
    sections: searchParams.get('sections')?.split(',').filter(Boolean) || [],
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    priceMin: Number(searchParams.get('priceMin')) || filterOptions.priceRange.min,
    priceMax: Number(searchParams.get('priceMax')) || filterOptions.priceRange.max,
    colors: searchParams.get('colors')?.split(',').filter(Boolean) || [],
    materials: searchParams.get('materials')?.split(',').filter(Boolean) || [],
    occasions: searchParams.get('occasions')?.split(',').filter(Boolean) || [],
    workTypes: searchParams.get('workTypes')?.split(',').filter(Boolean) || [],
    borderTypes: searchParams.get('borderTypes')?.split(',').filter(Boolean) || [],
    blousePieceIncluded: searchParams.get('blousePiece') === 'true' ? true : searchParams.get('blousePiece') === 'false' ? false : null,
    inStockOnly: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
    discountRange: searchParams.get('discount') || null,
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'featured',
    viewMode: (searchParams.get('view') as 'grid' | 'list') || 'grid',
    gridCols: (Number(searchParams.get('cols')) as 2 | 3 | 4 | 6) || 4,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.sections.length > 0) params.set('sections', filters.sections.join(','));
    if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
    if (filters.priceMin !== filterOptions.priceRange.min) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== filterOptions.priceRange.max) params.set('priceMax', filters.priceMax.toString());
    if (filters.colors.length > 0) params.set('colors', filters.colors.join(','));
    if (filters.materials.length > 0) params.set('materials', filters.materials.join(','));
    if (filters.occasions.length > 0) params.set('occasions', filters.occasions.join(','));
    if (filters.workTypes.length > 0) params.set('workTypes', filters.workTypes.join(','));
    if (filters.borderTypes.length > 0) params.set('borderTypes', filters.borderTypes.join(','));
    if (filters.blousePieceIncluded !== null) params.set('blousePiece', filters.blousePieceIncluded.toString());
    if (filters.inStockOnly) params.set('inStock', 'true');
    if (filters.onSale) params.set('onSale', 'true');
    if (filters.discountRange) params.set('discount', filters.discountRange);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort !== 'featured') params.set('sort', filters.sort);
    if (filters.viewMode !== 'grid') params.set('view', filters.viewMode);
    if (filters.gridCols !== 6) params.set('cols', filters.gridCols.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });
  }, [filters, pathname, router, filterOptions.priceRange]);

  // Apply all filters to products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.categoryName.toLowerCase().includes(searchLower) ||
        p.sectionName.toLowerCase().includes(searchLower)
      );
    }

    // Section filter
    if (filters.sections.length > 0) {
      result = result.filter(p => p.sectionId && filters.sections.includes(p.sectionId));
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(p => p.categoryId && filters.categories.includes(p.categoryId));
    }

    // Price filter
    result = result.filter(p => {
      const price = Number(p.price);
      return price >= filters.priceMin && price <= filters.priceMax;
    });

    // Color filter
    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.colors.some(c => filters.colors.includes(c.color))
      );
    }

    // Material filter
    if (filters.materials.length > 0) {
      result = result.filter(p => p.material && filters.materials.includes(p.material));
    }

    // Occasion filter
    if (filters.occasions.length > 0) {
      result = result.filter(p => p.occasion && filters.occasions.includes(p.occasion));
    }

    // Work type filter
    if (filters.workTypes.length > 0) {
      result = result.filter(p => p.workType && filters.workTypes.includes(p.workType));
    }

    // Border type filter
    if (filters.borderTypes.length > 0) {
      result = result.filter(p => p.borderType && filters.borderTypes.includes(p.borderType));
    }

    // Blouse piece filter
    if (filters.blousePieceIncluded !== null) {
      result = result.filter(p => p.blousePieceIncluded === filters.blousePieceIncluded);
    }

    // In stock filter
    if (filters.inStockOnly) {
      result = result.filter(p => p.colors.some(c => c.inStock));
    }

    // On sale filter
    if (filters.onSale) {
      result = result.filter(p => p.discountType !== 'NONE');
    }

    // Discount range filter
    if (filters.discountRange) {
      const discountRange = filters.discountRange;
      result = result.filter(p => {
        if (p.discountType === 'NONE') return false;

        const price = Number(p.price);
        let discountPercentage = 0;

        if (p.discountType === 'PERCENTAGE') {
          discountPercentage = Number(p.discountValue);
        } else if (p.discountType === 'FIXED') {
          discountPercentage = (Number(p.discountValue) / price) * 100;
        }

        const [min, max] = discountRange.split('-').map(Number);
        return discountPercentage >= min && discountPercentage <= max;
      });
    }

    // Sorting
    switch (filters.sort) {
      case 'price-asc':
        result.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        result.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => {
          if (a.featured === b.featured) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.featured ? -1 : 1;
        });
        break;
    }

    return result;
  }, [products, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      sections: [],
      categories: [],
      priceMin: filterOptions.priceRange.min,
      priceMax: filterOptions.priceRange.max,
      colors: [],
      materials: [],
      occasions: [],
      workTypes: [],
      borderTypes: [],
      blousePieceIncluded: null,
      inStockOnly: false,
      onSale: false,
      discountRange: null,
      search: '',
      sort: 'featured',
      viewMode: 'grid',
      gridCols: 6,
    });
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'section':
        setFilters(prev => ({
          ...prev,
          sections: prev.sections.filter(s => s !== value),
        }));
        break;
      case 'category':
        setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c !== value),
        }));
        break;
      case 'color':
        setFilters(prev => ({
          ...prev,
          colors: prev.colors.filter(c => c !== value),
        }));
        break;
      case 'material':
        setFilters(prev => ({
          ...prev,
          materials: prev.materials.filter(m => m !== value),
        }));
        break;
      case 'occasion':
        setFilters(prev => ({
          ...prev,
          occasions: prev.occasions.filter(o => o !== value),
        }));
        break;
      case 'workType':
        setFilters(prev => ({
          ...prev,
          workTypes: prev.workTypes.filter(w => w !== value),
        }));
        break;
      case 'borderType':
        setFilters(prev => ({
          ...prev,
          borderTypes: prev.borderTypes.filter(b => b !== value),
        }));
        break;
      case 'price':
        setFilters(prev => ({
          ...prev,
          priceMin: filterOptions.priceRange.min,
          priceMax: filterOptions.priceRange.max,
        }));
        break;
      case 'blousePiece':
        setFilters(prev => ({ ...prev, blousePieceIncluded: null }));
        break;
      case 'inStock':
        setFilters(prev => ({ ...prev, inStockOnly: false }));
        break;
      case 'onSale':
        setFilters(prev => ({ ...prev, onSale: false }));
        break;
      case 'discountRange':
        setFilters(prev => ({ ...prev, discountRange: null }));
        break;
      case 'search':
        setFilters(prev => ({ ...prev, search: '' }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs / Minimal Top Header - optional, can be dynamic based on category */}
      <div className="pt-24 md:pt-28 pb-4 px-6 md:px-8 border-b border-gray-100 mb-0">
        <nav className="flex text-xs text-gray-500 uppercase tracking-widest font-medium">
          <span className="hover:text-gray-900 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">New Arrivals</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Toolbar */}
        <ProductToolbar
          totalProducts={filteredProducts.length}
          filters={filters}
          onFilterChange={handleFilterChange}
          onMobileFilterToggle={() => setIsMobileFilterOpen(true)}
        />

        {/* Active Filters Bar - Only show if filters active */}
        <ActiveFilters
          filters={filters}
          filterOptions={filterOptions}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearFilters}
        />

        <div className="flex relative">
          {/* Desktop Filter Sidebar - Hidden by default in new design, strictly using Drawer/Overlay style or conditional visibility?? 
               ByShree actually has a "Filter" button that opens a Drawer even on desktop in some views, OR a sidebar. 
               The user asked to "clone" the layout. The screenshot shows "FILTER" button on the right. 
               This implies a DRAWER or toggle-able sidebar. 
               I will match that behavior: Hide sidebar by default, rely on the drawer I already have logic for (or make desktop drawer).
               
               For now, I will keep the sidebar logic BUT only show it if a state triggers, OR just use the Mobile Drawer for all sizes if that's the desired "Filter" button behavior. 
               
               Let's stick to the reference: The Screenshot has a "Filter" button. This usually implies a Click-to-Open interaction (Drawer).
           */}

          {/* Using Mobile Drawer for Desktop too for the "Filter" button experience */}

          {/* Main Product Grid */}
          <main className="flex-1 min-w-0 px-2 md:px-6 py-6">
            <ProductGrid
              products={paginatedProducts}
              totalProducts={filteredProducts.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              viewMode={filters.viewMode}
              gridCols={filters.gridCols}
            />
          </main>
        </div>
      </div>

      {/* Filter Drawer - Universal for Mobile & Desktop */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isMobileFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Backdrop - Only visible when open */}
        {isMobileFilterOpen && (
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />
        )}

        {/* Drawer Content */}
        <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col h-full transform transition-transform delay-75 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-900">Filters</h2>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <ProductFilters
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-[#8B1538] text-white font-bold uppercase tracking-widest text-xs py-4 hover:bg-[#6e112d] transition-colors"
            >
              View {filteredProducts.length} Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
