'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import VariantManagement, { ProductVariantData } from './VariantManagement';

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a positive number',
  }),
  discountType: z.enum(['NONE', 'PERCENTAGE', 'FIXED']),
  discountValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Discount must be a non-negative number',
  }),
  categoryId: z.string().min(1, 'Please select a category'),
  material: z.string().optional(),
  fabricComposition: z.string().optional(),
  weight: z.string().optional(),
  length: z.string().optional(),
  blousePieceIncluded: z.boolean(),
  workType: z.string().optional(),
  borderType: z.string().optional(),
  palluDetails: z.string().optional(),
  occasion: z.string().optional(),
  careInstructions: z.string().optional(),
  washCare: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.string().optional(),
  tags: z.string().optional(),
  metaDescription: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  sections: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; sectionId: string }>;
  initialData?: ProductFormData & { id: string; variants?: ProductVariantData[]; hasSizes?: boolean };
}

export default function CompactProductForm({ sections, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [variants, setVariants] = useState<ProductVariantData[]>(initialData?.variants || []);
  const [hasSizes, setHasSizes] = useState(initialData?.hasSizes || false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'seo'>('basic');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      active: true,
      featured: false,
      discountType: 'NONE',
      discountValue: '0',
      blousePieceIncluded: false,
    },
  });

  const price = watch('price');
  const discountType = watch('discountType');
  const discountValue = watch('discountValue');

  const calculateFinalPrice = () => {
    const priceNum = Number(price) || 0;
    const discountNum = Number(discountValue) || 0;

    if (discountType === 'PERCENTAGE') {
      return priceNum - (priceNum * discountNum / 100);
    } else if (discountType === 'FIXED') {
      return Math.max(0, priceNum - discountNum);
    }
    return priceNum;
  };

  const finalPrice = calculateFinalPrice();

  useEffect(() => {
    if (initialData?.categoryId) {
      const category = categories.find(cat => cat.id === initialData.categoryId);
      if (category) {
        setSelectedSectionId(category.sectionId);
      }
    }
  }, [initialData, categories]);

  const filteredCategories = selectedSectionId
    ? categories.filter(cat => cat.sectionId === selectedSectionId)
    : categories;

  const onSubmit = async (data: ProductFormData) => {
    setError('');
    setLoading(true);

    try {
      // Validate Variants
      if (variants.length === 0) {
        throw new Error('Please add at least one color variant');
      }

      for (const variant of variants) {
        if (!variant.color.trim()) throw new Error('All colors must have a name');
        if (!variant.colorCode.trim()) throw new Error('All colors must have a color code');
        if (variant.images.length === 0) throw new Error(`Color "${variant.color}" must have at least one image`);

        if (hasSizes) {
            if (variant.sizes.length === 0) {
                throw new Error(`Color "${variant.color}" must have at least one size variant`);
            }
            for (const s of variant.sizes) {
                if (!s.size.trim()) throw new Error(`Size name cannot be empty in "${variant.color}"`);
                if (s.quantity < 0) throw new Error(`Quantity cannot be negative for size "${s.size}"`);
            }
        } else {
            if (variant.quantity !== undefined && variant.quantity < 0) {
                throw new Error(`Quantity cannot be negative for "${variant.color}"`);
            }
        }
      }

      const endpoint = initialData
        ? `/api/products/${initialData.id}`
        : '/api/products';

      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          variants: variants,
          hasSizes: hasSizes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Basic Information
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  placeholder="e.g., Elegant Banarasi Silk Saree"
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  placeholder="Product description..."
                  disabled={loading}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('categoryId')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    disabled={loading || !selectedSectionId}
                  >
                    <option value="">{selectedSectionId ? 'Select' : 'Select section first'}</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Pricing & Inventory
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('price')}
                    step="0.01"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="5999"
                    disabled={loading}
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    {...register('sku')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="SAR-001"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Stock</label>
                  <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-semibold">
                    {variants.reduce((sum, v) => {
                      if (hasSizes && v.sizes) {
                        return sum + v.sizes.reduce((s, size) => s + (size.quantity || 0), 0);
                      } else {
                        return sum + (v.quantity || 0);
                      }
                    }, 0)}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Auto-calculated from variants</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                  <select
                    {...register('discountType')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    disabled={loading}
                  >
                    <option value="NONE">No Discount</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>

                {discountType !== 'NONE' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Value {discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                    </label>
                    <input
                      type="number"
                      {...register('discountValue')}
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              {discountType !== 'NONE' && Number(discountValue) > 0 && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Original:</span>
                    <span className="font-medium">₹{Number(price || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Final Price:</span>
                    <span>₹{finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs for Additional Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                    activeTab === 'basic'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Fabric Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                    activeTab === 'details'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Care & Specs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('seo')}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition ${
                    activeTab === 'seo'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  SEO & Tags
                </button>
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'basic' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
                      <input
                        type="text"
                        {...register('material')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="Pure Silk"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Fabric Composition</label>
                      <input
                        type="text"
                        {...register('fabricComposition')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="100% Silk"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Weight/GSM</label>
                      <input
                        type="text"
                        {...register('weight')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="450 GSM"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Length</label>
                      <input
                        type="text"
                        {...register('length')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="6.5 meters"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Work Type</label>
                      <input
                        type="text"
                        {...register('workType')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="Handloom"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Border Type</label>
                      <input
                        type="text"
                        {...register('borderType')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="Zari Border"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pallu Details</label>
                    <textarea
                      {...register('palluDetails')}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                      placeholder="Pallu design description..."
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded">
                    <input
                      type="checkbox"
                      id="blousePieceIncluded"
                      {...register('blousePieceIncluded')}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      disabled={loading}
                    />
                    <label htmlFor="blousePieceIncluded" className="text-xs font-medium text-gray-900 cursor-pointer">
                      Blouse Piece Included
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Occasion</label>
                    <input
                      type="text"
                      {...register('occasion')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                      placeholder="Wedding, Festival, Party"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quick Care Tips</label>
                    <input
                      type="text"
                      {...register('careInstructions')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                      placeholder="Dry clean only"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Wash Care</label>
                    <textarea
                      {...register('washCare')}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                      placeholder="Detailed washing instructions..."
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      {...register('metaDescription')}
                      rows={2}
                      maxLength={160}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                      placeholder="SEO description (max 160 chars)"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">For search engines and social media</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tags / Keywords</label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 outline-none"
                      placeholder="silk saree, wedding, banarasi"
                      disabled={loading}
                    />
                    <p className="mt-1 text-xs text-gray-500">Comma-separated keywords</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color Variants */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-pink-100 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Color Variants & Images
              <span className="ml-auto text-xs text-gray-500">{variants.length} variants</span>
            </h3>
            
            {/* Has Sizes Toggle */}
            <div className="flex items-center mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
              <input 
                type="checkbox" 
                id="hasSizes" 
                checked={hasSizes} 
                onChange={(e) => setHasSizes(e.target.checked)} 
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div className="ml-2">
                <label htmlFor="hasSizes" className="text-xs font-bold text-indigo-900 cursor-pointer">This product has sizes (e.g. S, M, L)</label>
                <p className="text-xs text-indigo-700">Check this for dresses/blouses. Uncheck for standard Sarees.</p>
              </div>
            </div>
            
            <VariantManagement variants={variants} onChange={setVariants} hasSizes={hasSizes} disabled={loading} />
          </div>
        </div>

        {/* Right Column - Quick Actions & Status */}
        <div className="space-y-4">
          {/* Save Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {initialData ? 'Update Product' : 'Create Product'}
                  </span>
                )}
              </button>

              <Link
                href="/admin/products"
                className="w-full block text-center px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition">
                <input
                  type="checkbox"
                  id="active"
                  {...register('active')}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  disabled={loading}
                />
                <label htmlFor="active" className="text-xs font-medium text-gray-900 cursor-pointer flex-1">
                  Active
                </label>
                <span className="text-xs text-green-600 font-medium">Visible</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 transition">
                <input
                  type="checkbox"
                  id="featured"
                  {...register('featured')}
                  className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  disabled={loading}
                />
                <label htmlFor="featured" className="text-xs font-medium text-gray-900 cursor-pointer flex-1">
                  Featured
                </label>
                <span className="text-xs text-amber-600 font-medium">Homepage</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-sm border border-purple-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Colors:</span>
                <span className="font-semibold text-purple-600">{variants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Images:</span>
                <span className="font-semibold text-purple-600">
                  {variants.reduce((acc, v) => acc + v.images.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Stock:</span>
                <span className="font-semibold text-purple-600">
                  {variants.reduce((sum, v) => {
                    if (hasSizes && v.sizes) {
                      return sum + v.sizes.reduce((s, size) => s + (size.quantity || 0), 0);
                    } else {
                      return sum + (v.quantity || 0);
                    }
                  }, 0)}
                </span>
              </div>
              {discountType !== 'NONE' && Number(discountValue) > 0 && (
                <div className="flex justify-between pt-2 border-t border-purple-200">
                  <span className="text-gray-600">Final Price:</span>
                  <span className="font-bold text-green-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
