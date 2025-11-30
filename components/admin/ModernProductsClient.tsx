'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  material: string | null;
  occasion: string | null;
  featured: boolean;
  active: boolean;
  discountType: string | null;
  discountValue: string | null;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
  primaryImage: {
    url: string;
    altText: string | null;
  } | null;
  colorCount: number;
  colors: Array<{
    id: string;
    color: string;
    colorCode: string;
  }>;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  featured: number;
  lowStock: number;
}

interface ModernProductsClientProps {
  products: Product[];
  sections: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  materials: string[];
  stats: Stats;
  searchParams: any;
}

export default function ModernProductsClient({
  products,
  sections,
  categories,
  materials,
  stats,
  searchParams,
}: ModernProductsClientProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const calculateDiscountedPrice = (product: Product) => {
    const price = Number(product.price);
    if (product.discountType === 'PERCENTAGE' && product.discountValue) {
      return price - (price * Number(product.discountValue)) / 100;
    } else if (product.discountType === 'FIXED' && product.discountValue) {
      return price - Number(product.discountValue);
    }
    return price;
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your saree catalog
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="px-6 py-3 bg-gradient-to-r from-maroon to-deep-maroon text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          {/* Total Products */}
          <div className="bg-white rounded-xl soft-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="bg-white rounded-xl soft-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          {/* Inactive */}
          <div className="bg-white rounded-xl soft-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Inactive</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✕</span>
              </div>
            </div>
          </div>

          {/* Featured */}
          <div className="bg-white rounded-xl soft-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Featured</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.featured}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-xl soft-shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="bg-white rounded-xl soft-shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <form action="/admin/products" method="get">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchParams.search}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                {/* Keep other filters as hidden inputs */}
                {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
                {searchParams.section && <input type="hidden" name="section" value={searchParams.section} />}
                {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
              </form>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  showFilters ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎯 Filters
              </button>

              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {selectedProducts.length > 0 && (
                <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all">
                  Delete ({selectedProducts.length})
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <form action="/admin/products" method="get" className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    name="section"
                    defaultValue={searchParams.section}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Sections</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    defaultValue={searchParams.category}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material/Fabric</label>
                  <select
                    name="material"
                    defaultValue={searchParams.material}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Materials</option>
                    {materials.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    defaultValue={searchParams.status}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={searchParams.minPrice}
                    placeholder="₹0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={searchParams.maxPrice}
                    placeholder="₹10,000"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Featured */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Only</label>
                  <select
                    name="featured"
                    defaultValue={searchParams.featured}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">All Products</option>
                    <option value="true">Featured Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
                >
                  Apply Filters
                </button>
                <Link
                  href="/admin/products"
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
                >
                  Clear All
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl soft-shadow p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {Object.keys(searchParams).length > 0
                ? 'Try adjusting your filters'
                : 'Get started by adding your first saree to the catalog'}
            </p>
            <Link
              href="/admin/products/new"
              className="inline-block px-6 py-3 bg-maroon text-white rounded-lg font-semibold hover:bg-deep-maroon transition-all"
            >
              Add Your First Product
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product);
              const hasDiscount = product.discountType !== 'NONE' && discountedPrice < Number(product.price);

              return (
                <div key={product.id} className="bg-white rounded-xl soft-shadow overflow-hidden hover:shadow-lg transition-all group">
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage.url}
                        alt={product.primaryImage.altText || product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-6xl">👗</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.featured && (
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                          ⭐ FEATURED
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          {product.discountType === 'PERCENTAGE' ? `${product.discountValue}% OFF` : `₹${product.discountValue} OFF`}
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        product.active ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                        {product.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    {/* Selection Checkbox */}
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-5 h-5 rounded border-2 border-white shadow-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

                    {/* Category */}
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded mb-3">
                      {product.category?.name || 'Uncategorized'}
                    </span>

                    {/* Colors */}
                    {product.colorCount > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Colors:</span>
                        <div className="flex gap-1">
                          {product.colors.slice(0, 5).map((color) => (
                            <div
                              key={color.id}
                              className="w-5 h-5 rounded-full border-2 border-gray-200"
                              style={{ backgroundColor: color.colorCode }}
                              title={color.color}
                            />
                          ))}
                          {product.colorCount > 5 && (
                            <span className="text-xs text-gray-500">+{product.colorCount - 5}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{discountedPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white text-center rounded-lg font-medium hover:bg-indigo-700 transition-all text-sm"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/product/${product.id}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-xl soft-shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Colors</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const discountedPrice = calculateDiscountedPrice(product);
                  const hasDiscount = product.discountType !== 'NONE' && discountedPrice < Number(product.price);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.primaryImage ? (
                              <Image
                                src={product.primaryImage.url}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <span className="text-2xl">👗</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-md">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {product.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasDiscount ? (
                          <div>
                            <p className="font-bold text-gray-900">₹{discountedPrice.toLocaleString('en-IN')}</p>
                            <p className="text-sm text-gray-500 line-through">₹{Number(product.price).toLocaleString('en-IN')}</p>
                          </div>
                        ) : (
                          <p className="font-bold text-gray-900">₹{Number(product.price).toLocaleString('en-IN')}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.colorCount > 0 ? (
                          <div className="flex gap-1">
                            {product.colors.slice(0, 3).map((color) => (
                              <div
                                key={color.id}
                                className="w-6 h-6 rounded-full border-2 border-gray-200"
                                style={{ backgroundColor: color.colorCode }}
                                title={color.color}
                              />
                            ))}
                            {product.colorCount > 3 && (
                              <span className="text-sm text-gray-500">+{product.colorCount - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No colors</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded inline-block ${
                            product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                          {product.featured && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded inline-block">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 font-medium text-sm"
                          >
                            Edit
                          </Link>
                          <span className="text-gray-300">|</span>
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="text-green-600 hover:text-green-900 font-medium text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {products.length > 0 && (
          <div className="mt-6 bg-white rounded-xl soft-shadow p-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> product(s)
              {selectedProducts.length > 0 && (
                <> • <span className="font-semibold text-indigo-600">{selectedProducts.length}</span> selected</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
