'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  order: number;
  active: boolean;
}

interface CategoryFormProps {
  sections: Section[];
  category?: Category | null;
}

export default function CategoryForm({ sections, category }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    sectionId: category?.sectionId || '',
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories';

      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save category');
      }

      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none font-mono text-sm"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-maroon focus:border-transparent outline-none resize-none"
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-maroon border-gray-300 rounded focus:ring-maroon"
          />
          <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
            Active (visible on website)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-maroon text-white px-8 py-3 rounded-lg font-semibold hover:bg-deep-maroon transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
