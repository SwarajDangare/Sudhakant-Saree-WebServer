'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
  linkUrl: string | null;
  productsCount: number;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    linkUrl: '',
    productsCount: 0,
    isFeatured: true,
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/admin/homepage/collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      imageUrl: '',
      imagePublicId: '',
      linkUrl: '',
      productsCount: 0,
      isFeatured: true,
      displayOrder: collections.length,
      isActive: true,
    });
  };

  const handleEdit = (collection: Collection) => {
    setIsCreating(false);
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      tagline: collection.tagline || '',
      description: collection.description || '',
      imageUrl: collection.imageUrl,
      imagePublicId: collection.imagePublicId,
      linkUrl: collection.linkUrl || '',
      productsCount: collection.productsCount,
      isFeatured: collection.isFeatured,
      displayOrder: collection.displayOrder,
      isActive: collection.isActive,
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
      const url = editingCollection
        ? `/api/admin/homepage/collections/${editingCollection.id}`
        : '/api/admin/homepage/collections';

      const method = editingCollection ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchCollections();
        setIsCreating(false);
        setEditingCollection(null);
        setFormData({
          name: '',
          slug: '',
          tagline: '',
          description: '',
          imageUrl: '',
          imagePublicId: '',
          linkUrl: '',
          productsCount: 0,
          isFeatured: true,
          displayOrder: 0,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const response = await fetch(`/api/admin/homepage/collections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCollections();
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
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
          <h1 className="text-3xl font-bold text-gray-900">Featured Collections</h1>
          <p className="text-gray-600 mt-1">
            Curated collections displayed on the homepage
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-colors"
        >
          + Add Collection
        </button>
      </div>

      {/* Form for creating/editing collection */}
      {(isCreating || editingCollection) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-pink-500">
          <h2 className="text-xl font-bold mb-4">
            {editingCollection ? 'Edit Collection' : 'Create New Collection'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Name *
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Wedding Special"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="wedding-special"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Bridal Elegance"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Exquisite sarees for your special day"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Collection Image *
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
                      <div className="mt-4 relative w-full h-64">
                        <Image
                          src={formData.imageUrl}
                          alt="Collection preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CldUploadWidget>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="/collections/wedding"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Products Count
                </label>
                <input
                  type="number"
                  value={formData.productsCount}
                  onChange={(e) => setFormData({ ...formData, productsCount: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Featured
                </label>
              </div>

              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Save Collection
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingCollection(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of collections */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Current Collections</h2>

          {collections.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No collections yet. Create your first collection!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={collection.imageUrl}
                      alt={collection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{collection.name}</h3>
                        {collection.tagline && (
                          <p className="text-sm text-pink-600">{collection.tagline}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {collection.isFeatured && (
                          <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            collection.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {collection.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {collection.description && (
                      <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{collection.productsCount} products</span>
                      <span>Order: {collection.displayOrder}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(collection)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(collection.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
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
