'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

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
  length: z.string().optional(),
  occasion: z.string().optional(),
  careInstructions: z.string().optional(),
  active: z.boolean(),
  featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  sections: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string; sectionId: string }>;
  initialData?: ProductFormData & { id: string };
}

export default function ProductForm({ sections, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

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
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="e.g., Elegant Banarasi Silk Saree"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="Describe the saree in detail..."
                disabled={loading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Price, Section, and Category */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  id="price"
                  {...register('price')}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                  placeholder="5999.00"
                  disabled={loading}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  id="sectionId"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                  disabled={loading}
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select section first to filter categories
                </p>
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="categoryId"
                  {...register('categoryId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
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
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                )}
              </div>
            </div>

            {/* Discount Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Discount Type */}
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    {...register('discountType')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
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
                    <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-2">
                      Discount Value {discountType === 'PERCENTAGE' ? '(%)' : '(₹)'}
                    </label>
                    <input
                      type="number"
                      id="discountValue"
                      {...register('discountValue')}
                      step="0.01"
                      min="0"
                      max={discountType === 'PERCENTAGE' ? '100' : undefined}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                      placeholder={discountType === 'PERCENTAGE' ? '0' : '0.00'}
                      disabled={loading}
                    />
                    {errors.discountValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Calculation Summary */}
              {discountType !== 'NONE' && Number(discountValue) > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Price Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="font-medium">₹{Number(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-red-600">
                        {discountType === 'PERCENTAGE' && `${discountValue}%`}
                        {discountType === 'FIXED' && `₹${Number(discountValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        {discountPercentage > 0 && ` (${discountPercentage.toFixed(1)}% off)`}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="font-semibold text-green-900">Final Price:</span>
                      <span className="font-bold text-green-900 text-lg">₹{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Additional Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material */}
            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                id="material"
                {...register('material')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="e.g., Pure Silk"
                disabled={loading}
              />
            </div>

            {/* Length */}
            <div>
              <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-2">
                Length
              </label>
              <input
                type="text"
                id="length"
                {...register('length')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="e.g., 6.5 meters"
                disabled={loading}
              />
            </div>

            {/* Occasion */}
            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700 mb-2">
                Occasion
              </label>
              <input
                type="text"
                id="occasion"
                {...register('occasion')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="e.g., Wedding, Festival"
                disabled={loading}
              />
            </div>

            {/* Care Instructions */}
            <div>
              <label htmlFor="careInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                Care Instructions
              </label>
              <input
                type="text"
                id="careInstructions"
                {...register('careInstructions')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="e.g., Dry clean only"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Status & Visibility */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status & Visibility
          </h2>

          <div className="space-y-4">
            {/* Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                {...register('active')}
                className="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-maroon"
                disabled={loading}
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                Active (product visible in store)
              </label>
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                {...register('featured')}
                className="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-maroon"
                disabled={loading}
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured (show on homepage)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/products"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-maroon text-white rounded-md font-semibold hover:bg-deep-maroon transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
