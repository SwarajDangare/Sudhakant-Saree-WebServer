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

export interface ColorVariantData {
  id?: string;
  color: string;
  colorCode: string;
  inStock: boolean;
  images: ColorImage[];
}

interface ColorManagementProps {
  colors: ColorVariantData[];
  onChange: (colors: ColorVariantData[]) => void;
  disabled?: boolean;
}

export default function ColorManagement({ colors, onChange, disabled }: ColorManagementProps) {
  const [expandedColorIndex, setExpandedColorIndex] = useState<number | null>(null);

  // Add new color
  const handleAddColor = () => {
    const newColor: ColorVariantData = {
      color: '',
      colorCode: '#800000',
      inStock: true,
      images: [],
    };
    onChange([...colors, newColor]);
    setExpandedColorIndex(colors.length);
  };

  // Remove color
  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index);
    onChange(newColors);
    if (expandedColorIndex === index) {
      setExpandedColorIndex(null);
    }
  };

  // Update color field
  const handleColorChange = (index: number, field: keyof ColorVariantData, value: any) => {
    const newColors = [...colors];
    newColors[index] = { ...newColors[index], [field]: value };
    onChange(newColors);
  };

  // Add image to color
  const handleAddImage = (colorIndex: number, imageData: { url: string; publicId: string }) => {
    const newColors = [...colors];
    const newImage: ColorImage = {
      url: imageData.url,
      publicId: imageData.publicId,
      altText: newColors[colorIndex].color || 'Product image',
      displayOrder: newColors[colorIndex].images.length,
    };
    newColors[colorIndex].images.push(newImage);
    onChange(newColors);
  };

  // Remove image from color
  const handleRemoveImage = (colorIndex: number, imageIndex: number) => {
    const newColors = [...colors];
    newColors[colorIndex].images = newColors[colorIndex].images.filter((_, i) => i !== imageIndex);
    // Re-order remaining images
    newColors[colorIndex].images = newColors[colorIndex].images.map((img, i) => ({
      ...img,
      displayOrder: i,
    }));
    onChange(newColors);
  };

  // Move image order
  const handleMoveImage = (colorIndex: number, imageIndex: number, direction: 'up' | 'down') => {
    const newColors = [...colors];
    const images = [...newColors[colorIndex].images];
    const newIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    // Swap images
    [images[imageIndex], images[newIndex]] = [images[newIndex], images[imageIndex]];

    // Update display order
    images.forEach((img, i) => {
      img.displayOrder = i;
    });

    newColors[colorIndex].images = images;
    onChange(newColors);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Color Variants</h2>
        <button
          type="button"
          onClick={handleAddColor}
          disabled={disabled}
          className="px-4 py-2 bg-maroon text-white rounded-md hover:bg-deep-maroon transition disabled:opacity-50"
        >
          + Add Color
        </button>
      </div>

      {colors.length === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="text-gray-600 mb-4">No color variants added yet</p>
          <button
            type="button"
            onClick={handleAddColor}
            disabled={disabled}
            className="px-6 py-2 bg-maroon text-white rounded-md hover:bg-deep-maroon transition"
          >
            Add Your First Color
          </button>
        </div>
      )}

      <div className="space-y-4">
        {colors.map((color, colorIndex) => (
          <div key={colorIndex} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            {/* Color Header */}
            <div className="bg-gray-50 p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExpandedColorIndex(expandedColorIndex === colorIndex ? null : colorIndex)}
                className="flex items-center space-x-3 flex-1 text-left"
              >
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: color.colorCode }}
                ></div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {color.color || 'Unnamed Color'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {color.images.length} {color.images.length === 1 ? 'image' : 'images'}
                    {' • '}
                    {color.inStock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedColorIndex === colorIndex ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleRemoveColor(colorIndex)}
                disabled={disabled}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                aria-label="Remove color"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* Color Details (Expanded) */}
            {expandedColorIndex === colorIndex && (
              <div className="p-6 space-y-6">
                {/* Color Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Name *
                    </label>
                    <input
                      type="text"
                      value={color.color}
                      onChange={(e) => handleColorChange(colorIndex, 'color', e.target.value)}
                      placeholder="e.g., Royal Blue"
                      disabled={disabled}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Code *
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={color.colorCode}
                        onChange={(e) => handleColorChange(colorIndex, 'colorCode', e.target.value)}
                        disabled={disabled}
                        className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color.colorCode}
                        onChange={(e) => handleColorChange(colorIndex, 'colorCode', e.target.value)}
                        disabled={disabled}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Status
                    </label>
                    <select
                      value={color.inStock ? 'true' : 'false'}
                      onChange={(e) => handleColorChange(colorIndex, 'inStock', e.target.value === 'true')}
                      disabled={disabled}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
                    >
                      <option value="true">In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>
                </div>

                {/* Images Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                    <CldUploadWidget
                      uploadPreset="product_images"
                      onSuccess={(result: any) => {
                        if (result.event === 'success') {
                          handleAddImage(colorIndex, {
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
                          disabled={disabled}
                          className="px-4 py-2 bg-saffron text-white rounded-md hover:bg-saffron/90 transition text-sm disabled:opacity-50"
                        >
                          + Upload Image
                        </button>
                      )}
                    </CldUploadWidget>
                  </div>

                  {color.images.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <p className="text-gray-600 text-sm">No images uploaded for this color</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {color.images.map((image, imageIndex) => (
                        <div key={imageIndex} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                            <Image
                              src={image.url}
                              alt={image.altText}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Image Controls */}
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {imageIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(colorIndex, imageIndex, 'up')}
                                className="p-1 bg-white rounded shadow hover:bg-gray-100"
                                title="Move left"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                            )}
                            {imageIndex < color.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(colorIndex, imageIndex, 'down')}
                                className="p-1 bg-white rounded shadow hover:bg-gray-100"
                                title="Move right"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(colorIndex, imageIndex)}
                              className="p-1 bg-red-500 text-white rounded shadow hover:bg-red-600"
                              title="Remove image"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Order Badge */}
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            #{imageIndex + 1}
                          </div>
                        </div>
                      ))}
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
