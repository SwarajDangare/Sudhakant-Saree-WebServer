'use client';

import { useState } from 'react';

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
  discountRange: string | null; // '10-20', '20-50', '40-50', null
}

interface ProductFiltersProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onFilterChange: (filters: Partial<Filters>) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    sections: true,
    categories: true,
    price: true,
    discount: true,
    colors: false,
    materials: false,
    occasions: false,
    workTypes: false,
    borderTypes: false,
    other: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (filterType: keyof Filters, value: string) => {
    const currentValues = filters[filterType] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange({ [filterType]: newValues });
  };

  // Get categories for selected sections or all if none selected
  const visibleCategories = filters.sections.length > 0
    ? filterOptions.categories.filter(cat => filters.sections.includes(cat.sectionId))
    : filterOptions.categories;

  // Count active filters
  const activeFilterCount =
    filters.sections.length +
    filters.categories.length +
    filters.colors.length +
    filters.materials.length +
    filters.occasions.length +
    filters.workTypes.length +
    filters.borderTypes.length +
    (filters.priceMin !== filterOptions.priceRange.min || filters.priceMax !== filterOptions.priceRange.max ? 1 : 0) +
    (filters.blousePieceIncluded !== null ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (filters.discountRange ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">FILTER BY</h2>
          {activeFilterCount > 0 && (
            <span className="bg-maroon text-white text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-maroon transition font-medium uppercase tracking-wide"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {/* Sections Filter */}
        <FilterSection
          title="Collection"
          isExpanded={expandedSections.sections}
          onToggle={() => toggleSection('sections')}
        >
          <div className="space-y-2">
            {filterOptions.sections.map(section => (
              <label key={section.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.sections.includes(section.id)}
                  onChange={() => handleCheckboxChange('sections', section.id)}
                  className="w-4 h-4 rounded border-gray-300 text-maroon focus:ring-saffron cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                  {section.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categories Filter */}
        {visibleCategories.length > 0 && (
          <FilterSection
            title="Category"
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {visibleCategories.map(category => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCheckboxChange('categories', category.id)}
                    className="w-4 h-4 rounded border-gray-300 text-maroon focus:ring-saffron cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection
          title="Price Range"
          isExpanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => onFilterChange({ priceMin: Number(e.target.value) })}
                min={filterOptions.priceRange.min}
                max={filters.priceMax}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-saffron focus:border-saffron"
                placeholder="Min"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => onFilterChange({ priceMax: Number(e.target.value) })}
                min={filters.priceMin}
                max={filterOptions.priceRange.max}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-saffron focus:border-saffron"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min={filterOptions.priceRange.min}
              max={filterOptions.priceRange.max}
              value={filters.priceMax}
              onChange={(e) => onFilterChange({ priceMax: Number(e.target.value) })}
              className="w-full accent-maroon"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹{filterOptions.priceRange.min.toLocaleString('en-IN')}</span>
              <span>₹{filterOptions.priceRange.max.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </FilterSection>

        {/* Discount */}
        <FilterSection
          title="Discount"
          isExpanded={expandedSections.discount}
          onToggle={() => toggleSection('discount')}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="discount"
                checked={filters.discountRange === '10-20'}
                onChange={() => onFilterChange({ discountRange: '10-20' })}
                className="w-4 h-4 text-maroon focus:ring-saffron cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                10-20%
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="discount"
                checked={filters.discountRange === '20-50'}
                onChange={() => onFilterChange({ discountRange: '20-50' })}
                className="w-4 h-4 text-maroon focus:ring-saffron cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                20-50%
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="discount"
                checked={filters.discountRange === '40-50'}
                onChange={() => onFilterChange({ discountRange: '40-50' })}
                className="w-4 h-4 text-maroon focus:ring-saffron cursor-pointer"
              />
              <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                40-50%
              </span>
            </label>
            {filters.discountRange && (
              <button
                onClick={() => onFilterChange({ discountRange: null })}
                className="text-xs text-gray-500 hover:text-maroon transition mt-2"
              >
                Clear discount filter
              </button>
            )}
          </div>
        </FilterSection>

        {/* Colors */}
        {filterOptions.colors.length > 0 && (
          <FilterSection
            title="Colors"
            isExpanded={expandedSections.colors}
            onToggle={() => toggleSection('colors')}
          >
            <div className="grid grid-cols-5 gap-2">
              {filterOptions.colors.map(({ color, colorCode }) => (
                <button
                  key={color}
                  onClick={() => handleCheckboxChange('colors', color)}
                  className={`group relative w-10 h-10 rounded-full border-2 transition-all ${
                    filters.colors.includes(color)
                      ? 'border-maroon scale-110 shadow-lg'
                      : 'border-gray-300 hover:border-saffron hover:scale-105'
                  }`}
                  title={color}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: colorCode }}
                  />
                  {filters.colors.includes(color) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {color}
                  </div>
                </button>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Materials */}
        {filterOptions.materials.length > 0 && (
          <FilterSection
            title="Material"
            isExpanded={expandedSections.materials}
            onToggle={() => toggleSection('materials')}
          >
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.materials.map(material => (
                <label key={material} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.materials.includes(material)}
                    onChange={() => handleCheckboxChange('materials', material)}
                    className="w-4 h-4 rounded border-gray-300 text-maroon focus:ring-saffron cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                    {material}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Occasions */}
        {filterOptions.occasions.length > 0 && (
          <FilterSection
            title="Occasion"
            isExpanded={expandedSections.occasions}
            onToggle={() => toggleSection('occasions')}
          >
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.occasions.map(occasion => (
                <label key={occasion} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.occasions.includes(occasion)}
                    onChange={() => handleCheckboxChange('occasions', occasion)}
                    className="w-4 h-4 rounded border-gray-300 text-maroon focus:ring-saffron cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                    {occasion}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Work Types */}
        {filterOptions.workTypes.length > 0 && (
          <FilterSection
            title="Work Type"
            isExpanded={expandedSections.workTypes}
            onToggle={() => toggleSection('workTypes')}
          >
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.workTypes.map(workType => (
                <label key={workType} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.workTypes.includes(workType)}
                    onChange={() => handleCheckboxChange('workTypes', workType)}
                    className="w-4 h-4 rounded border-gray-300 text-maroon focus:ring-saffron cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                    {workType}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Border Types */}
        {filterOptions.borderTypes.length > 0 && (
          <FilterSection
            title="Border Type"
            isExpanded={expandedSections.borderTypes}
            onToggle={() => toggleSection('borderTypes')}
          >
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filterOptions.borderTypes.map(borderType => (
                <label key={borderType} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.borderTypes.includes(borderType)}
                    onChange={() => handleCheckboxChange('borderTypes', borderType)}
                    className="w-4 h-4 rounded border-gray-300 text-maroon focus:ring-saffron cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                    {borderType}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Other Filters */}
        <FilterSection
          title="Other Filters"
          isExpanded={expandedSections.other}
          onToggle={() => toggleSection('other')}
        >
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                Blouse Piece Included
              </span>
              <button
                onClick={() => {
                  if (filters.blousePieceIncluded === null) {
                    onFilterChange({ blousePieceIncluded: true });
                  } else if (filters.blousePieceIncluded === true) {
                    onFilterChange({ blousePieceIncluded: false });
                  } else {
                    onFilterChange({ blousePieceIncluded: null });
                  }
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  filters.blousePieceIncluded === true
                    ? 'bg-green-500'
                    : filters.blousePieceIncluded === false
                    ? 'bg-red-500'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    filters.blousePieceIncluded === true
                      ? 'translate-x-7'
                      : filters.blousePieceIncluded === false
                      ? 'translate-x-1'
                      : 'translate-x-4'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                In Stock Only
              </span>
              <button
                onClick={() => onFilterChange({ inStockOnly: !filters.inStockOnly })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  filters.inStockOnly ? 'bg-maroon' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    filters.inStockOnly ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-gray-700 group-hover:text-maroon transition">
                On Sale
              </span>
              <button
                onClick={() => onFilterChange({ onSale: !filters.onSale })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  filters.onSale ? 'bg-saffron' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    filters.onSale ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

// Helper component for collapsible sections
function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-maroon transition">
          {title}
        </h3>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && <div>{children}</div>}
    </div>
  );
}
