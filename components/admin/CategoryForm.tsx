'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

interface Section {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  sectionId: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  order: number;
  active: boolean;
}

interface CategoryFormProps {
  sections: Section[];
  category?: Category | null;
  isSuperAdmin?: boolean;
}

export default function CategoryForm({ sections, category, isSuperAdmin }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    sectionId: category?.sectionId || '',
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    imageUrl: category?.imageUrl || '',
    imagePublicId: category?.imagePublicId || '',
    order: category?.order || 0,
    active: category?.active ?? true,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      // Auto-generate slug from name if it's a new category
      slug: category ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    });
  };

  const handleImageSuccess = (result: any) => {
    if (result.event === 'success') {
      setFormData({
        ...formData,
        imageUrl: result.info.secure_url,
        imagePublicId: result.info.public_id,
      });
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imageUrl: '',
      imagePublicId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate that a section is selected
    if (!formData.sectionId || formData.sectionId.trim() === '') {
      setError('Please select a section for this category');
      setLoading(false);
      return;
    }

    // Validate that name is provided
    if (!formData.name || formData.name.trim() === '') {
      setError('Please provide a category name');
      setLoading(false);
      return;
    }

    // Validate that slug is provided
    if (!formData.slug || formData.slug.trim() === '') {
      setError('Please provide a slug for this category');
      setLoading(false);
      return;
    }

    // Prepare data for submission
    const submissionData = {
      ...formData,
      imageUrl: formData.imageUrl || null,
      imagePublicId: formData.imagePublicId || null,
    };

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';

      const method = category ? 'PUT' : 'POST';

      console.log('Submitting category:', { url, method, submissionData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Category save failed:', data);
        throw new Error(data.error || 'Failed to save category');
      }

      console.log('Category saved successfully:', data);
      setSuccess(category ? 'Category updated successfully!' : 'Category created successfully!');

      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/admin/categories');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {sections.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md mb-6">
          <p className="font-semibold">No sections available</p>
          <p className="text-sm mt-1">
            You need to create at least one section before you can add categories.
            Please go to the sections page and create a section first.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section */}
          <div>
            <label htmlFor="sectionId" className="block text-sm font-medium text-gray-700 mb-2">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              id="sectionId"
              required
              value={formData.sectionId}
              onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all duration-200"
            >
              <option value="">Select a section</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Banarasi Silk"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., banarasi-silk"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none font-mono text-sm transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (lowercase, hyphens, no spaces)
            </p>
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>
        </div>

        {/* Category Image */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Category Image <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-48 aspect-square relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center group">
              {formData.imageUrl ? (
                <>
                  <Image
                    src={formData.imageUrl}
                    alt="Category preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-sm text-gray-500">
                Upload a high-quality image to represent this category on the website.
                Recommended size: 800x800px or larger.
              </p>
              
              <CldUploadWidget
                uploadPreset="product_images"
                onSuccess={handleImageSuccess}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon transition-colors"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                  </button>
                )}
              </CldUploadWidget>

              {formData.imageUrl && (
                <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Image uploaded successfully
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this category..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none resize-none transition-all duration-200"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-maroon transition-all duration-200"
          />
          <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
            Active (visible on website)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || sections.length === 0}
            className="bg-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
            title={sections.length === 0 ? 'Please create a section first' : ''}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : category ? 'Update Category' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
