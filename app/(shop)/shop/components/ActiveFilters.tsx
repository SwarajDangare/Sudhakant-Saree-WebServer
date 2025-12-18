'use client';

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
}

interface ActiveFiltersProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  filterOptions,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters: Array<{ type: string; value?: string; label: string }> = [];

  // Sections
  filters.sections.forEach(sectionId => {
    const section = filterOptions.sections.find(s => s.id === sectionId);
    if (section) {
      activeFilters.push({
        type: 'section',
        value: sectionId,
        label: section.name,
      });
    }
  });

  // Categories
  filters.categories.forEach(categoryId => {
    const category = filterOptions.categories.find(c => c.id === categoryId);
    if (category) {
      activeFilters.push({
        type: 'category',
        value: categoryId,
        label: category.name,
      });
    }
  });

  // Price
  if (
    filters.priceMin !== filterOptions.priceRange.min ||
    filters.priceMax !== filterOptions.priceRange.max
  ) {
    activeFilters.push({
      type: 'price',
      label: `₹${filters.priceMin.toLocaleString('en-IN')} - ₹${filters.priceMax.toLocaleString('en-IN')}`,
    });
  }

  // Colors
  filters.colors.forEach(color => {
    activeFilters.push({
      type: 'color',
      value: color,
      label: color,
    });
  });

  // Materials
  filters.materials.forEach(material => {
    activeFilters.push({
      type: 'material',
      value: material,
      label: material,
    });
  });

  // Occasions
  filters.occasions.forEach(occasion => {
    activeFilters.push({
      type: 'occasion',
      value: occasion,
      label: occasion,
    });
  });

  // Work Types
  filters.workTypes.forEach(workType => {
    activeFilters.push({
      type: 'workType',
      value: workType,
      label: workType,
    });
  });

  // Border Types
  filters.borderTypes.forEach(borderType => {
    activeFilters.push({
      type: 'borderType',
      value: borderType,
      label: borderType,
    });
  });

  // Blouse Piece
  if (filters.blousePieceIncluded !== null) {
    activeFilters.push({
      type: 'blousePiece',
      label: filters.blousePieceIncluded ? 'With Blouse Piece' : 'Without Blouse Piece',
    });
  }

  // In Stock
  if (filters.inStockOnly) {
    activeFilters.push({
      type: 'inStock',
      label: 'In Stock Only',
    });
  }

  // On Sale
  if (filters.onSale) {
    activeFilters.push({
      type: 'onSale',
      label: 'On Sale',
    });
  }

  // Discount Range
  if (filters.discountRange) {
    activeFilters.push({
      type: 'discountRange',
      label: `${filters.discountRange}% OFF`,
    });
  }

  // Search
  if (filters.search) {
    activeFilters.push({
      type: 'search',
      label: `Search: "${filters.search}"`,
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-gray-700">Active Filters:</span>

        {activeFilters.map((filter, index) => (
          <button
            key={`${filter.type}-${filter.value || index}`}
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-saffron/10 text-maroon rounded-full text-sm font-medium hover:bg-saffron/20 transition group"
          >
            <span>{filter.label}</span>
            <svg
              className="w-4 h-4 group-hover:text-red-600 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ))}

        <button
          onClick={onClearAll}
          className="ml-auto px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition underline"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
