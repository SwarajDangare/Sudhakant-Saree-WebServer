'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

export interface ColorImage {
  id?: string;
  url: string;
  publicId: string;
  altText: string;
  displayOrder: number;
}

export interface SizeVariant {
  size: string;
  quantity: number;
  sku: string;
}

export interface ProductVariantData {
  id?: string;
  color: string;
  colorCode: string;
  images: ColorImage[];
  // If hasSizes is false, we use these:
  quantity?: number;
  sku?: string;
  inStock?: boolean; // Keep for backward compat or quick toggle
  // If hasSizes is true, we use these:
  sizes: SizeVariant[];
}

interface VariantManagementProps {
  variants: ProductVariantData[];
  onChange: (variants: ProductVariantData[]) => void;
  hasSizes: boolean;
  disabled?: boolean;
}

export default function VariantManagement({ variants, onChange, hasSizes, disabled }: VariantManagementProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Add new color variant group
  const handleAddVariant = () => {
    const newVariant: ProductVariantData = {
      color: '',
      colorCode: '#800000',
      images: [],
      quantity: 0,
      sku: '',
      inStock: true,
      sizes: [],
    };
    onChange([...variants, newVariant]);
    setExpandedIndex(variants.length);
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onChange(newVariants);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const handleVariantChange = (index: number, field: keyof ProductVariantData, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  // Image Handling
  const handleAddImage = (index: number, imageData: { url: string; publicId: string }) => {
    const newVariants = [...variants];
    const newImage: ColorImage = {
      url: imageData.url,
      publicId: imageData.publicId,
      altText: newVariants[index].color || 'Product image',
      displayOrder: newVariants[index].images.length,
    };
    newVariants[index].images.push(newImage);
    onChange(newVariants);
  };

  const handleRemoveImage = (variantIndex: number, imageIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
    // Re-order
    newVariants[variantIndex].images.forEach((img, i) => { img.displayOrder = i; });
    onChange(newVariants);
  };

  const handleMoveImage = (variantIndex: number, imageIndex: number, direction: 'up' | 'down') => {
    const newVariants = [...variants];
    const images = [...newVariants[variantIndex].images];
    const newIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [images[imageIndex], images[newIndex]] = [images[newIndex], images[imageIndex]];
    images.forEach((img, i) => { img.displayOrder = i; });
    newVariants[variantIndex].images = images;
    onChange(newVariants);
  };

  // Size Handling
  const handleAddSize = (variantIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes.push({ size: '', quantity: 0, sku: '' });
    onChange(newVariants);
  };

  const handleRemoveSize = (variantIndex: number, sizeIndex: number) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    onChange(newVariants);
  };

  const handleSizeChange = (variantIndex: number, sizeIndex: number, field: keyof SizeVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes[sizeIndex] = { 
      ...newVariants[variantIndex].sizes[sizeIndex], 
      [field]: field === 'quantity' ? Number(value) : value 
    };
    onChange(newVariants);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {hasSizes ? 'Color & Size Variants' : 'Color Variants'}
        </h2>
        <button
          type="button"
          onClick={handleAddVariant}
          disabled={disabled}
          className="px-4 py-2 bg-maroon text-white rounded-md hover:bg-deep-maroon transition disabled:opacity-50"
        >
          + Add {hasSizes ? 'Color Group' : 'Color'}
        </button>
      </div>

      {variants.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">No variants added yet</p>
          <button
            type="button"
            onClick={handleAddVariant}
            disabled={disabled}
            className="px-6 py-2 bg-maroon text-white rounded-md hover:bg-deep-maroon transition"
          >
            Add First Variant
          </button>
        </div>
      )}

      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="flex items-center space-x-3 flex-1 text-left"
              >
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: variant.colorCode }}
                ></div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {variant.color || 'Unnamed Color'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {variant.images.length} images • 
                    {hasSizes 
                      ? ` ${variant.sizes.length} sizes` 
                      : ` Qty: ${variant.quantity || 0}`}
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveVariant(index)}
                disabled={disabled}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition"
              >
                Delete
              </button>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="p-6 space-y-6">
                {/* Basic Color Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Name</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      placeholder="e.g. Royal Blue"
                      className="w-full px-4 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Width</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={variant.colorCode}
                        onChange={(e) => handleVariantChange(index, 'colorCode', e.target.value)}
                        className="w-16 h-10 border rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={variant.colorCode}
                        onChange={(e) => handleVariantChange(index, 'colorCode', e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-md font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Images Upload */}
                <div>
                   <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                         {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
                            <CldUploadWidget
                                uploadPreset="product_images"
                                onSuccess={(result: any) => {
                                if (result.event === 'success') {
                                    handleAddImage(index, {
                                    url: result.info.secure_url,
                                    publicId: result.info.public_id,
                                    });
                                }
                                }}
                            >
                                {({ open }) => (
                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                                >
                                    + Upload
                                </button>
                                )}
                            </CldUploadWidget>
                        )}
                   </div>
                   
                   {variant.images.length > 0 ? (
                       <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                           {variant.images.map((img, i) => (
                               <div key={i} className="relative group aspect-square bg-gray-100 rounded border overflow-hidden">
                                   <Image src={img.url} alt={img.altText} fill className="object-cover" />
                                   <button 
                                      onClick={() => handleRemoveImage(index, i)}
                                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition"
                                   >
                                       ✕
                                   </button>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="p-4 bg-gray-50 text-center text-sm text-gray-400 rounded-md">No images uploaded</div>
                   )}
                </div>

                <div className="border-t pt-4">
                  {hasSizes ? (
                    // Size Management
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Size Inventory</h4>
                        <button
                          type="button"
                          onClick={() => handleAddSize(index)}
                          className="text-sm text-maroon font-medium hover:underline"
                        >
                          + Add Size
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {variant.sizes.map((size, sIndex) => (
                          <div key={sIndex} className="flex gap-3 items-end">
                            <div className="w-24">
                              <label className="text-xs text-gray-500">Size</label>
                              <input
                                type="text"
                                value={size.size}
                                onChange={(e) => handleSizeChange(index, sIndex, 'size', e.target.value)}
                                placeholder="S, M..."
                                className="w-full px-3 py-1.5 border rounded-md text-sm"
                              />
                            </div>
                            <div className="w-24">
                              <label className="text-xs text-gray-500">Quantity</label>
                              <input
                                type="number"
                                value={size.quantity}
                                onChange={(e) => handleSizeChange(index, sIndex, 'quantity', e.target.value)}
                                className="w-full px-3 py-1.5 border rounded-md text-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500">SKU (Opt)</label>
                              <input
                                type="text"
                                value={size.sku || ''}
                                onChange={(e) => handleSizeChange(index, sIndex, 'sku', e.target.value)}
                                className="w-full px-3 py-1.5 border rounded-md text-sm"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(index, sIndex)}
                              className="p-2 text-gray-400 hover:text-red-500"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Simple Quantity Management
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                        <input
                          type="number"
                          value={variant.quantity}
                          onChange={(e) => handleVariantChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-4 py-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SKU (Optional)</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                          className="w-full px-4 py-2 border rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
