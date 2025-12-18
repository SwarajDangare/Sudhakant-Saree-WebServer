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
  initialData?: ProductFormData & { id: string; colors?: any[], variants?: any[] };
}

export default function ProductForm({ sections, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  
  // New state for variants
  const [variants, setVariants] = useState<ProductVariantData[]>([]);
  const [hasSizes, setHasSizes] = useState(false);

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

  // Watch fields
  const price = watch('price');
  const discountType = watch('discountType');
  const discountValue = watch('discountValue');

  // Initialize Data
  useEffect(() => {
    if (initialData) {
      if (initialData.categoryId) {
        const category = categories.find(cat => cat.id === initialData.categoryId);
        if (category) {
          setSelectedSectionId(category.sectionId);
        }
      }

      // Transform initialData.colors/variants into ProductVariantData structure
      // Note: This logic depends on how the API returns data. 
      // Assuming API returns colors with nested variants or strictly flat variants.
      // For now, if we are editing an old product, it might just have colors.
      if (initialData.colors) {
           // Basic mapping from old structure to new
           const mappedVariants: ProductVariantData[] = initialData.colors.map((c: any) => ({
             id: c.id,
             color: c.color,
             colorCode: c.colorCode,
             images: c.images || [],
             inStock: c.inStock,
             // Look for variants linked to this color
             sizes: c.variants ? c.variants.map((v: any) => ({
                 size: v.size,
                 quantity: v.stockQuantity,
                 sku: v.sku
             })) : [],
             quantity: c.stockQuantity || 0 // Fallback if no sizes
           }));
           setVariants(mappedVariants);
           
           // Detect if it has sizes
           const detectedHasSizes = mappedVariants.some(v => v.sizes && v.sizes.length > 0 && v.sizes[0].size);
           setHasSizes(detectedHasSizes);
      }
    }
  }, [initialData, categories]);

  // Calculations
  const calculateFinalPrice = () => {
    const priceNum = Number(price) || 0;
    const discountNum = Number(discountValue) || 0;
    if (discountType === 'PERCENTAGE') return priceNum - (priceNum * discountNum / 100);
    if (discountType === 'FIXED') return Math.max(0, priceNum - discountNum);
    return priceNum;
  };

  const calculateDiscountPercentage = () => {
    const priceNum = Number(price) || 0;
    const discountNum = Number(discountValue) || 0;
    if (priceNum === 0) return 0;
    if (discountType === 'PERCENTAGE') return discountNum;
    if (discountType === 'FIXED') return (discountNum / priceNum) * 100;
    return 0;
  };

  const finalPrice = calculateFinalPrice();
  const discountPercentage = calculateDiscountPercentage();

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

      const endpoint = initialData ? `/api/products/${initialData.id}` : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Number(data.price),
          variants: variants, // Send the full variant structure
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
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="e.g., Elegant Banarasi Silk Saree"
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                placeholder="Describe the saree in detail..."
                disabled={loading}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                <input
                  type="number"
                  id="price"
                  {...register('price')}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                  placeholder="5999.00"
                  disabled={loading}
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              <div>
                <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700 mb-2">Section *</label>
                <select
                  id="sectionId"
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                  disabled={loading}
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  id="categoryId"
                  {...register('categoryId')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                  disabled={loading || !selectedSectionId}
                >
                  <option value="">{selectedSectionId ? 'Select a category' : 'Select section first'}</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
              </div>
            </div>

            {/* Discount Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                      disabled={loading}
                    />
                    {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue.message}</p>}
                  </div>
                )}
              </div>
              
               {discountType !== 'NONE' && Number(discountValue) > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Price Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                       <span className="text-gray-600">Original:</span>
                       <span className="font-medium">₹{Number(price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-gray-600">Final Price:</span>
                       <span className="font-bold text-green-900">₹{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div>
           <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <input type="text" {...register('material')} className="w-full px-4 py-2 border rounded-md" disabled={loading} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                    <input type="text" {...register('length')} className="w-full px-4 py-2 border rounded-md" disabled={loading} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label>
                    <input type="text" {...register('occasion')} className="w-full px-4 py-2 border rounded-md" disabled={loading} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Instructions</label>
                    <input type="text" {...register('careInstructions')} className="w-full px-4 py-2 border rounded-md" disabled={loading} />
                </div>
           </div>
        </div>
        
        {/* Status flags */}
        <div>
           <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
           <div className="space-y-2">
               <div className="flex items-center">
                    <input type="checkbox" id="active" {...register('active')} className="w-4 h-4 text-maroon rounded" />
                    <label htmlFor="active" className="ml-2">Active</label>
               </div>
               <div className="flex items-center">
                    <input type="checkbox" id="featured" {...register('featured')} className="w-4 h-4 text-maroon rounded" />
                    <label htmlFor="featured" className="ml-2">Featured</label>
               </div>
           </div>
        </div>
      </div>

      {/* Variant Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
         <div className="flex items-center mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
             <input 
                type="checkbox" 
                id="hasSizes" 
                checked={hasSizes} 
                onChange={(e) => setHasSizes(e.target.checked)} 
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
             />
             <div className="ml-3">
                 <label htmlFor="hasSizes" className="text-sm font-bold text-indigo-900 cursor-pointer">This product has sizes (e.g. S, M, L)</label>
                 <p className="text-xs text-indigo-700">Check this for dresses/blouses. Uncheck for standard Sarees.</p>
             </div>
         </div>
      
        <VariantManagement
          variants={variants}
          onChange={setVariants}
          hasSizes={hasSizes}
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link href="/admin/products" className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</Link>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-maroon text-white rounded-md hover:bg-deep-maroon disabled:opacity-50">
          {loading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
