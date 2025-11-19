'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Section {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  order: number;
  active: boolean;
}

interface SectionFormProps {
  section?: Section | null;
}

export default function SectionForm({ section }: SectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: section?.name || '',
    slug: section?.slug || '',
    description: section?.description || '',
    order: section?.order || 0,
    active: section?.active ?? true,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      // Auto-generate slug from name if it's a new section
      slug: section ? formData.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate that name is provided
    if (!formData.name || formData.name.trim() === '') {
      setError('Please provide a section name');
      setLoading(false);
      return;
    }

    // Validate that slug is provided
    if (!formData.slug || formData.slug.trim() === '') {
      setError('Please provide a slug for this section');
      setLoading(false);
      return;
    }

    try {
      const url = section
        ? `/api/admin/sections/${section.id}`
        : '/api/admin/sections';

      const method = section ? 'PUT' : 'POST';

      console.log('Submitting section:', { url, method, formData });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Section save failed:', data);
        throw new Error(data.error || 'Failed to save section');
      }

      console.log('Section saved successfully:', data);
      setSuccess(section ? 'Section updated successfully!' : 'Section created successfully!');

      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/admin/sections');
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error('Error saving section:', err);
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

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Section Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Traditional Sarees"
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
              placeholder="e.g., traditional-sarees"
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
            placeholder="Brief description of this section..."
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
            {loading ? 'Saving...' : section ? 'Update Section' : 'Create Section'}
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
