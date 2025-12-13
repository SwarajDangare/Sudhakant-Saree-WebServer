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
  search: string;
  sort: string;
  viewMode: 'grid' | 'list';
  gridCols: 2 | 3 | 4;
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
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'featured',
    viewMode: (searchParams.get('view') as 'grid' | 'list') || 'grid',
    gridCols: (Number(searchParams.get('cols')) as 2 | 3 | 4) || 3,
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
    if (filters.search) params.set('search', filters.search);
    if (filters.sort !== 'featured') params.set('sort', filters.sort);
    if (filters.viewMode !== 'grid') params.set('view', filters.viewMode);
    if (filters.gridCols !== 3) params.set('cols', filters.gridCols.toString());

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
      search: '',
      sort: 'featured',
      viewMode: 'grid',
      gridCols: 3,
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
      case 'search':
        setFilters(prev => ({ ...prev, search: '' }));
        break;
    }
  };

  return (
    <div className="min-h-screen bg-silk-white">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-maroon via-indian-red to-saffron text-white pattern-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shop All Sarees
            </h1>
            <p className="text-xl text-silk-white max-w-2xl mx-auto">
              Browse our complete collection of handcrafted sarees
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <ProductToolbar
          totalProducts={filteredProducts.length}
          filters={filters}
          onFilterChange={handleFilterChange}
          onMobileFilterToggle={() => setIsMobileFilterOpen(true)}
        />

        {/* Active Filters */}
        <ActiveFilters
          filters={filters}
          filterOptions={filterOptions}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={handleClearFilters}
        />

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
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

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-maroon">Filters</h2>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <ProductFilters
                filters={filters}
                filterOptions={filterOptions}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Apply Button */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full btn-primary"
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
