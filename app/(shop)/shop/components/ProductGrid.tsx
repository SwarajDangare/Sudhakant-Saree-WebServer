'use client';

import ShopProductCard from './ShopProductCard';
import Link from 'next/link';

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
  colors: Array<{
    id: string;
    color: string;
    colorCode: string;
    inStock: boolean;
  }>;
}

interface ProductGridProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  viewMode: 'grid' | 'list';
  gridCols: 2 | 3 | 4 | 6;
}

export default function ProductGrid({
  products,
  totalProducts,
  currentPage,
  totalPages,
  onPageChange,
  viewMode,
  gridCols,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <svg
          className="w-24 h-24 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Products Found</h3>
        <p className="text-gray-500 mb-6">
          We couldn't find any products matching your filters. Try adjusting your search or filters.
        </p>
        <Link href="/shop" className="btn-primary inline-block">
          Clear All Filters
        </Link>
      </div>
    );
  }

  // Map products to include category (ProductCard expects 'category' not 'categoryName')
  const productsForCard = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    material: p.material,
    length: null, // Not used in ProductCard but required by type
    occasion: p.occasion,
    careInstructions: null, // Not used in ProductCard but required by type
    category: p.categoryName,
    categoryName: p.categoryName,
    featured: p.featured,
    active: p.active,
    createdAt: p.createdAt,
    discountType: p.discountType,
    discountValue: p.discountValue,
    colors: p.colors.map(c => ({
      id: c.id,
      color: c.color,
      colorCode: c.colorCode,
      inStock: c.inStock,
      images: [],
    })),
  }));

  const getGridColsClass = () => {
    if (viewMode === 'list') {
      return 'grid-cols-1';
    }
    switch (gridCols) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    }
  };

  return (
    <div>
      {/* Product Grid */}
      <div className={`grid ${getGridColsClass()} gap-4 mb-8`}>
        {products.map(product => (
          <ShopProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page Info */}
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 24 + 1} to{' '}
              {Math.min(currentPage * 24, totalProducts)} of {totalProducts} products
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-maroon hover:text-white hover:border-maroon'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers(currentPage, totalPages).map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  const pageNum = Number(page);
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === pageNum
                          ? 'bg-maroon text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-maroon hover:text-white hover:border-maroon'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-maroon hover:text-white hover:border-maroon'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Jump to Page */}
            <div className="flex items-center gap-2">
              <label htmlFor="page-jump" className="text-sm text-gray-600 whitespace-nowrap">
                Go to:
              </label>
              <select
                id="page-jump"
                value={currentPage}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-saffron focus:border-saffron cursor-pointer"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {currentPage > 1 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-maroon text-white p-4 rounded-full shadow-lg hover:bg-deep-maroon transition-all hover:scale-110 z-40"
          title="Scroll to Top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    pages.push(totalPages);
  }

  return pages;
}
