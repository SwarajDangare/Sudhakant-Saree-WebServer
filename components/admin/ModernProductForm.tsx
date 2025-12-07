'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import ColorManagement, { ColorVariantData } from './ColorManagement';

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
  initialData?: ProductFormData & { id: string; colors?: ColorVariantData[] };
}

export default function ModernProductForm({ sections, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [colors, setColors] = useState<ColorVariantData[]>(initialData?.colors || []);

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

  // Watch price and discount fields for live calculation
  const price = watch('price');
  const discountType = watch('discountType');
  const discountValue = watch('discountValue');

  // Calculate final price
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

  const calculateDiscountPercentage = () => {
    const priceNum = Number(price) || 0;
    const discountNum = Number(discountValue) || 0;

    if (priceNum === 0) return 0;

    if (discountType === 'PERCENTAGE') {
      return discountNum;
    } else if (discountType === 'FIXED') {
      return (discountNum / priceNum) * 100;
    }
    return 0;
  };

  const finalPrice = calculateFinalPrice();
  const discountPercentage = calculateDiscountPercentage();

  // When editing a product, pre-select the section based on the category
  useEffect(() => {
    if (initialData?.categoryId) {
      const category = categories.find(cat => cat.id === initialData.categoryId);
      if (category) {
        setSelectedSectionId(category.sectionId);
      }
    }
  }, [initialData, categories]);

  // Filter categories by selected section
  const filteredCategories = selectedSectionId
    ? categories.filter(cat => cat.sectionId === selectedSectionId)
    : categories;

  const onSubmit = async (data: ProductFormData) => {
    setError('');
    setLoading(true);

    try {
      // Validate colors
      if (colors.length === 0) {
        setError('Please add at least one color variant');
        setLoading(false);
        return;
      }

      // Validate each color has required fields
      for (const color of colors) {
        if (!color.color.trim()) {
          setError('All colors must have a name');
          setLoading(false);
          return;
        }
        if (!color.colorCode.trim()) {
          setError('All colors must have a color code');
          setLoading(false);
          return;
        }
        if (color.images.length === 0) {
          setError(`Color "${color.color}" must have at least one image`);
          setLoading(false);
          return;
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
          colors: colors,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 soft-shadow">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-500">Essential product details</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="e.g., Elegant Banarasi Silk Saree"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={5}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Describe the saree in detail - fabric, design, craftsmanship, and unique features..."
              disabled={loading}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Meta Description for SEO */}
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-semibold text-gray-700 mb-2">
              SEO Meta Description
            </label>
            <textarea
              id="metaDescription"
              {...register('metaDescription')}
              rows={3}
              maxLength={160}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Brief description for search engines (max 160 characters)"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">Used for SEO and social media previews</p>
          </div>
        </div>
      </div>

      {/* Pricing & Categorization */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pricing & Category</h2>
            <p className="text-sm text-gray-500">Set price, discounts, and product classification</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Price, SKU, Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                {...register('price')}
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="5999.00"
                disabled={loading}
              />
              {errors.price && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-semibold text-gray-700 mb-2">
                SKU / Product Code
              </label>
              <input
                type="text"
                id="sku"
                {...register('sku')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., SAR-001"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Unique identifier for tracking</p>
            </div>

            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                id="stockQuantity"
                {...register('stockQuantity')}
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="100"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Available quantity in stock</p>
            </div>
          </div>

          {/* Section and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sectionId" className="block text-sm font-semibold text-gray-700 mb-2">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                id="sectionId"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                disabled={loading}
              >
                <option value="">Select a section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">Select section first to filter categories</p>
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                disabled={loading || !selectedSectionId}
              >
                <option value="">
                  {selectedSectionId ? 'Select a category' : 'Select section first'}
                </option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.categoryId.message}
                </p>
              )}
            </div>
          </div>

          {/* Discount Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Discount & Offers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discount Type */}
              <div>
                <label htmlFor="discountType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  id="discountType"
                  {...register('discountType')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                >
                  <option value="NONE">No Discount</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              {discountType !== 'NONE' && (
                <div>
                  <label htmlFor="discountValue" className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    id="discountValue"
                    {...register('discountValue')}
                    step="0.01"
                    min="0"
                    max={discountType === 'PERCENTAGE' ? '100' : undefined}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder={discountType === 'PERCENTAGE' ? '0' : '0.00'}
                    disabled={loading}
                  />
                  {errors.discountValue && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.discountValue.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price Calculation Summary */}
            {discountType !== 'NONE' && Number(discountValue) > 0 && (
              <div className="mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <h4 className="text-sm font-bold text-green-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Price Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Original Price:</span>
                    <span className="font-semibold text-gray-900">₹{Number(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-semibold text-red-600">
                      {discountType === 'PERCENTAGE' && `${discountValue}%`}
                      {discountType === 'FIXED' && `₹${Number(discountValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      {discountPercentage > 0 && ` (${discountPercentage.toFixed(1)}% off)`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-green-300">
                    <span className="font-bold text-green-900">Final Price:</span>
                    <span className="font-bold text-green-900 text-xl">₹{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 text-xs">You save:</span>
                    <span className="text-green-700 text-xs font-semibold">₹{(Number(price || 0) - finalPrice).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fabric & Specifications */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fabric & Specifications</h2>
            <p className="text-sm text-gray-500">Material details and product specifications</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Material, Composition, Weight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="material" className="block text-sm font-semibold text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                id="material"
                {...register('material')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Pure Silk"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="fabricComposition" className="block text-sm font-semibold text-gray-700 mb-2">
                Fabric Composition
              </label>
              <input
                type="text"
                id="fabricComposition"
                {...register('fabricComposition')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 100% Silk, Cotton-Silk Blend"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-semibold text-gray-700 mb-2">
                Weight / GSM
              </label>
              <input
                type="text"
                id="weight"
                {...register('weight')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 450 GSM"
                disabled={loading}
              />
            </div>
          </div>

          {/* Length, Work Type, Border Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="length" className="block text-sm font-semibold text-gray-700 mb-2">
                Length
              </label>
              <input
                type="text"
                id="length"
                {...register('length')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., 6.5 meters with blouse"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="workType" className="block text-sm font-semibold text-gray-700 mb-2">
                Work Type
              </label>
              <input
                type="text"
                id="workType"
                {...register('workType')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Handloom, Embroidery, Print"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="borderType" className="block text-sm font-semibold text-gray-700 mb-2">
                Border Type
              </label>
              <input
                type="text"
                id="borderType"
                {...register('borderType')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Zari Border, Contrast Border"
                disabled={loading}
              />
            </div>
          </div>

          {/* Pallu Details */}
          <div>
            <label htmlFor="palluDetails" className="block text-sm font-semibold text-gray-700 mb-2">
              Pallu Details
            </label>
            <textarea
              id="palluDetails"
              {...register('palluDetails')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Describe the pallu design, patterns, and embellishments..."
              disabled={loading}
            />
          </div>

          {/* Blouse Piece Included */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <input
              type="checkbox"
              id="blousePieceIncluded"
              {...register('blousePieceIncluded')}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              disabled={loading}
            />
            <div>
              <label htmlFor="blousePieceIncluded" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                Blouse Piece Included
              </label>
              <p className="text-xs text-gray-600">Check if this product comes with a matching blouse piece</p>
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label htmlFor="occasion" className="block text-sm font-semibold text-gray-700 mb-2">
              Occasion / Usage
            </label>
            <input
              type="text"
              id="occasion"
              {...register('occasion')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="e.g., Wedding, Festival, Casual, Party"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Care Instructions */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Care Instructions</h2>
            <p className="text-sm text-gray-500">How to maintain and care for this product</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Care Instructions */}
          <div>
            <label htmlFor="careInstructions" className="block text-sm font-semibold text-gray-700 mb-2">
              Quick Care Tips
            </label>
            <input
              type="text"
              id="careInstructions"
              {...register('careInstructions')}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="e.g., Dry clean only, Hand wash in cold water"
              disabled={loading}
            />
          </div>

          {/* Detailed Wash Care */}
          <div>
            <label htmlFor="washCare" className="block text-sm font-semibold text-gray-700 mb-2">
              Detailed Wash Care Instructions
            </label>
            <textarea
              id="washCare"
              {...register('washCare')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Detailed washing, drying, ironing, and storage instructions..."
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* SEO & Tags */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Keywords & Tags</h2>
            <p className="text-sm text-gray-500">Help customers find this product</p>
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2">
            Product Tags / Keywords
          </label>
          <input
            type="text"
            id="tags"
            {...register('tags')}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            placeholder="e.g., silk saree, wedding saree, banarasi, handloom"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-gray-500">Separate tags with commas. Used for search and filtering.</p>
        </div>
      </div>

      {/* Status & Visibility */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Visibility & Status</h2>
            <p className="text-sm text-gray-500">Control where this product appears</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Active */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
              disabled={loading}
            />
            <div className="flex-1">
              <label htmlFor="active" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                Active Product
              </label>
              <p className="text-xs text-gray-600 mt-1">Enable this to make the product visible in your online store</p>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">Visibility</span>
          </div>

          {/* Featured */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg hover:shadow-md transition">
            <input
              type="checkbox"
              id="featured"
              {...register('featured')}
              className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 mt-0.5"
              disabled={loading}
            />
            <div className="flex-1">
              <label htmlFor="featured" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                Featured Product
              </label>
              <p className="text-xs text-gray-600 mt-1">Show this product on the homepage and in featured collections</p>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Highlight</span>
          </div>
        </div>
      </div>

      {/* Color Variants & Images */}
      <div className="bg-white rounded-xl soft-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Color Variants & Images</h2>
            <p className="text-sm text-gray-500">Add color options with their respective images</p>
          </div>
        </div>

        <ColorManagement
          colors={colors}
          onChange={setColors}
          disabled={loading}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 sticky bottom-6 bg-white rounded-xl soft-shadow p-6 border border-gray-200">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{colors.length}</span> color variant{colors.length !== 1 ? 's' : ''} added
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {initialData ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
