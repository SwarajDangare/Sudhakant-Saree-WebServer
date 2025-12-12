'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface Occasion {
  id: string;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string;
  imagePublicId: string;
  linkUrl: string | null;
  gradientFrom: string;
  gradientTo: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const GRADIENT_PRESETS = [
  { name: 'Pink to Red', from: 'rgba(219, 39, 119, 0.8)', to: 'rgba(220, 38, 38, 0.8)' },
  { name: 'Purple to Indigo', from: 'rgba(147, 51, 234, 0.8)', to: 'rgba(99, 102, 241, 0.8)' },
  { name: 'Blue to Cyan', from: 'rgba(37, 99, 235, 0.8)', to: 'rgba(6, 182, 212, 0.8)' },
  { name: 'Green to Teal', from: 'rgba(5, 150, 105, 0.8)', to: 'rgba(20, 184, 166, 0.8)' },
  { name: 'Orange to Red', from: 'rgba(249, 115, 22, 0.8)', to: 'rgba(220, 38, 38, 0.8)' },
];

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '🎉',
    imageUrl: '',
    imagePublicId: '',
    linkUrl: '',
    gradientFrom: 'rgba(219, 39, 119, 0.8)',
    gradientTo: 'rgba(220, 38, 38, 0.8)',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchOccasions();
  }, []);

  const fetchOccasions = async () => {
    try {
      const response = await fetch('/api/admin/homepage/occasions');
      const data = await response.json();
      setOccasions(data);
    } catch (error) {
      console.error('Error fetching occasions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingOccasion(null);
    setFormData({
      name: '',
      slug: '',
      icon: '🎉',
      imageUrl: '',
      imagePublicId: '',
      linkUrl: '',
      gradientFrom: 'rgba(219, 39, 119, 0.8)',
      gradientTo: 'rgba(220, 38, 38, 0.8)',
      displayOrder: occasions.length,
      isActive: true,
    });
  };

  const handleEdit = (occasion: Occasion) => {
    setIsCreating(false);
    setEditingOccasion(occasion);
    setFormData({
      name: occasion.name,
      slug: occasion.slug,
      icon: occasion.icon,
      imageUrl: occasion.imageUrl,
      imagePublicId: occasion.imagePublicId,
      linkUrl: occasion.linkUrl || '',
      gradientFrom: occasion.gradientFrom,
      gradientTo: occasion.gradientTo,
      displayOrder: occasion.displayOrder,
      isActive: occasion.isActive,
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug || !formData.imageUrl) {
      alert('Name, slug, and image are required');
      return;
    }

    try {
      const url = editingOccasion
        ? `/api/admin/homepage/occasions/${editingOccasion.id}`
        : '/api/admin/homepage/occasions';

      const method = editingOccasion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchOccasions();
        setIsCreating(false);
        setEditingOccasion(null);
        setFormData({
          name: '',
          slug: '',
          icon: '🎉',
          imageUrl: '',
          imagePublicId: '',
          linkUrl: '',
          gradientFrom: 'rgba(219, 39, 119, 0.8)',
          gradientTo: 'rgba(220, 38, 38, 0.8)',
          displayOrder: 0,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error saving occasion:', error);
      alert('Failed to save occasion');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this occasion?')) return;

    try {
      const response = await fetch(`/api/admin/homepage/occasions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchOccasions();
      }
    } catch (error) {
      console.error('Error deleting occasion:', error);
      alert('Failed to delete occasion');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link
            href="/admin/homepage"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Homepage Management
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shop by Occasion</h1>
          <p className="text-gray-600 mt-1">
            Occasion categories with gradient overlays
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-colors"
        >
          + Add Occasion
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingOccasion) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-indigo-500">
          <h2 className="text-xl font-bold mb-4">
            {editingOccasion ? 'Edit Occasion' : 'Create New Occasion'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occasion Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: formData.slug || generateSlug(name)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Wedding"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="wedding"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon Emoji
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-2xl text-center"
                  placeholder="💍"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Image *
              </label>
              <CldUploadWidget
                uploadPreset="sudhakant_sarees"
                onSuccess={(result: any) => {
                  setFormData({
                    ...formData,
                    imageUrl: result.info.secure_url,
                    imagePublicId: result.info.public_id,
                  });
                }}
              >
                {({ open }) => (
                  <div>
                    <button
                      type="button"
                      onClick={() => open()}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Upload Image
                    </button>
                    {formData.imageUrl && (
                      <div className="mt-4 relative w-full h-48">
                        <Image
                          src={formData.imageUrl}
                          alt="Occasion preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CldUploadWidget>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradient Overlay
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {GRADIENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        gradientFrom: preset.from,
                        gradientTo: preset.to,
                      })
                    }
                    className="h-12 rounded-lg border-2 border-gray-300 hover:border-indigo-500 transition-colors"
                    style={{
                      background: `linear-gradient(to top, ${preset.from}, ${preset.to})`,
                    }}
                    title={preset.name}
                  />
                ))}
              </div>
              <div
                className="w-full h-24 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                style={{
                  background: `linear-gradient(to top, ${formData.gradientFrom}, ${formData.gradientTo})`,
                }}
              >
                Preview
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="/categories?occasion=wedding"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Occasion
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingOccasion(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Current Occasions</h2>

          {occasions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No occasions yet. Create your first occasion category!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {occasions.map((occasion) => (
                <div
                  key={occasion.id}
                  className="relative rounded-lg overflow-hidden group"
                >
                  <div className="relative h-64">
                    <Image
                      src={occasion.imageUrl}
                      alt={occasion.name}
                      fill
                      className="object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, ${occasion.gradientFrom}, ${occasion.gradientTo})`,
                      }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <div className="text-4xl mb-2">{occasion.icon}</div>
                        <h3 className="text-xl font-bold">{occasion.name}</h3>
                        <div className="flex gap-1 mt-2">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded">
                            Order: {occasion.displayOrder}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              occasion.isActive
                                ? 'bg-green-500/80'
                                : 'bg-gray-500/80'
                            }`}
                          >
                            {occasion.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(occasion)}
                        className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(occasion.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
