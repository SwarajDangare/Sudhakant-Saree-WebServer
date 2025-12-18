'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string | null;
}

interface FeaturedCategory {
  id: string;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
  overrideImageUrl: string | null;
  overrideImagePublicId: string | null;
  overrideTitle: string | null;
  overrideDescription: string | null;
  overrideLinkUrl: string | null;
  category: Category;
}

export default function FeaturedCategoriesPage() {
  const [featured, setFeatured] = useState<FeaturedCategory[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  // Override form state
  const [overrideForm, setOverrideForm] = useState({
    overrideImageUrl: '',
    overrideImagePublicId: '',
    overrideTitle: '',
    overrideDescription: '',
    overrideLinkUrl: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/homepage/featured-categories');
      const data = await res.json();
      setFeatured(data.featured || []);
      setAllCategories(data.allCategories || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedCategoryId) {
      alert('Please select a category');
      return;
    }

    if (featured.some(f => f.categoryId === selectedCategoryId)) {
      alert('This category is already featured');
      return;
    }

    try {
      const res = await fetch('/api/admin/homepage/featured-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategoryId,
          displayOrder: featured.length,
          ...overrideForm,
        }),
      });

      if (res.ok) {
        fetchData();
        setSelectedCategoryId('');
        setShowOverrideForm(false);
        resetOverrideForm();
      }
    } catch (error) {
      alert('Failed to add category');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/homepage/featured-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideForm),
      });

      if (res.ok) {
        fetchData();
        setEditingId(null);
        resetOverrideForm();
      }
    } catch (error) {
      alert('Failed to update category');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove this category from homepage?')) return;

    try {
      const res = await fetch('/api/admin/homepage/featured-categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      alert('Failed to remove category');
    }
  };

  const startEdit = (item: FeaturedCategory) => {
    setEditingId(item.id);
    setOverrideForm({
      overrideImageUrl: item.overrideImageUrl || '',
      overrideImagePublicId: item.overrideImagePublicId || '',
      overrideTitle: item.overrideTitle || '',
      overrideDescription: item.overrideDescription || '',
      overrideLinkUrl: item.overrideLinkUrl || '',
    });
  };

  const resetOverrideForm = () => {
    setOverrideForm({
      overrideImageUrl: '',
      overrideImagePublicId: '',
      overrideTitle: '',
      overrideDescription: '',
      overrideLinkUrl: '',
    });
  };

  const getDisplayData = (item: FeaturedCategory) => {
    return {
      title: item.overrideTitle || item.category.name,
      description: item.overrideDescription || item.category.description || 'No description',
      imageUrl: item.overrideImageUrl || item.category.imageUrl || 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000&auto=format&fit=crop',
      linkUrl: item.overrideLinkUrl || `/categories/${item.category.slug}`,
    };
  };

  if (loading) return <div className="p-6">Loading...</div>;

  const availableCategories = allCategories.filter(
    cat => !featured.some(f => f.categoryId === cat.id)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/homepage" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold">Featured Categories</h1>
        <p className="text-gray-600 mt-1">Customize how categories appear on the homepage</p>
      </div>

      {/* Add Category Card */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Add Category to Homepage</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setShowOverrideForm(!!e.target.value);
              }}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Choose a category...</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {showOverrideForm && selectedCategoryId && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <p className="text-sm text-gray-700 font-medium">
                ✨ Optional: Customize how this category appears on the homepage
              </p>

              {/* Custom Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Custom Image (Optional)</label>
                <CldUploadWidget
                  uploadPreset="sudhakant_sarees"
                  onSuccess={(result: any) => {
                    setOverrideForm(prev => ({
                      ...prev,
                      overrideImageUrl: result.info.secure_url,
                      overrideImagePublicId: result.info.public_id,
                    }));
                  }}
                >
                  {({ open }) => (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => open()}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                      >
                        Upload Custom Image
                      </button>
                      {overrideForm.overrideImageUrl && (
                        <div className="relative w-32 h-32 border rounded">
                          <Image
                            src={overrideForm.overrideImageUrl}
                            alt="Custom image"
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              {/* Custom Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Custom Title (Optional)</label>
                <input
                  type="text"
                  value={overrideForm.overrideTitle}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, overrideTitle: e.target.value }))}
                  placeholder="Leave empty to use category name"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Custom Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Custom Description (Optional)</label>
                <textarea
                  value={overrideForm.overrideDescription}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, overrideDescription: e.target.value }))}
                  placeholder="Leave empty to use category description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Custom Link */}
              <div>
                <label className="block text-sm font-medium mb-2">Custom Link URL (Optional)</label>
                <input
                  type="text"
                  value={overrideForm.overrideLinkUrl}
                  onChange={(e) => setOverrideForm(prev => ({ ...prev, overrideLinkUrl: e.target.value }))}
                  placeholder="/collections/bridal"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!selectedCategoryId}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Homepage
          </button>
        </div>
      </div>

      {/* Featured Categories List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Categories on Homepage ({featured.length})</h2>

        {featured.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories featured yet. Add some above!</p>
        ) : (
          <div className="space-y-4">
            {featured.map((item, index) => {
              const display = getDisplayData(item);
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex gap-4">
                    {/* Order Number */}
                    <div className="flex-shrink-0">
                      <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                    </div>

                    {/* Preview Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 border rounded">
                      <Image
                        src={display.imageUrl}
                        alt={display.title}
                        fill
                        className="object-cover rounded"
                      />
                      {item.overrideImageUrl && (
                        <span className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-1 rounded">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">
                            {display.title}
                            {item.overrideTitle && (
                              <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                Custom Title
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">Original: {item.category.name}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => isEditing ? setEditingId(null) : startEdit(item)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {isEditing ? 'Cancel' : 'Customize'}
                          </button>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{display.description}</p>
                      <p className="text-xs text-gray-500">Link: {display.linkUrl}</p>

                      {/* Edit Form */}
                      {isEditing && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                          <h4 className="font-medium text-sm">Edit Homepage Customization</h4>

                          {/* Image Upload */}
                          <div>
                            <label className="block text-xs font-medium mb-1">Custom Image</label>
                            <CldUploadWidget
                              uploadPreset="sudhakant_sarees"
                              onSuccess={(result: any) => {
                                setOverrideForm(prev => ({
                                  ...prev,
                                  overrideImageUrl: result.info.secure_url,
                                  overrideImagePublicId: result.info.public_id,
                                }));
                              }}
                            >
                              {({ open }) => (
                                <button
                                  type="button"
                                  onClick={() => open()}
                                  className="bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
                                >
                                  Change Image
                                </button>
                              )}
                            </CldUploadWidget>
                          </div>

                          <input
                            type="text"
                            value={overrideForm.overrideTitle}
                            onChange={(e) => setOverrideForm(prev => ({ ...prev, overrideTitle: e.target.value }))}
                            placeholder="Custom title"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />

                          <textarea
                            value={overrideForm.overrideDescription}
                            onChange={(e) => setOverrideForm(prev => ({ ...prev, overrideDescription: e.target.value }))}
                            placeholder="Custom description"
                            rows={2}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />

                          <input
                            type="text"
                            value={overrideForm.overrideLinkUrl}
                            onChange={(e) => setOverrideForm(prev => ({ ...prev, overrideLinkUrl: e.target.value }))}
                            placeholder="Custom link URL"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />

                          <button
                            onClick={() => handleUpdate(item.id)}
                            className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
