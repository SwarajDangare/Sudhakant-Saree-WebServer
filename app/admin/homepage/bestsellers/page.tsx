'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface Product {
  id: string;
  name: string;
  price: string;
  primaryImage?: string | null;
}

interface FeaturedBestseller {
  id: string;
  productId: string;
  displayOrder: number;
  isActive: boolean;
  overrideImageUrl: string | null;
  overrideImagePublicId: string | null;
  overrideTitle: string | null;
  overrideDescription: string | null;
  overrideLinkUrl: string | null;
  product: Product;
}

export default function BestsellersPage() {
  const [featured, setFeatured] = useState<FeaturedBestseller[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<FeaturedBestseller | null>(null);
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
      const res = await fetch('/api/admin/homepage/bestsellers');
      const data = await res.json();
      setFeatured(data.featured || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`/api/admin/homepage/bestsellers?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.searchResults || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (productId: string) => {
    if (featured.some(f => f.productId === productId)) {
      alert('This product is already in bestsellers');
      return;
    }

    try {
      const res = await fetch('/api/admin/homepage/bestsellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, displayOrder: featured.length }),
      });

      if (res.ok) {
        fetchData();
        setSearchResults([]);
        setSearchQuery('');
      }
    } catch (error) {
      alert('Failed to add product');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove from bestsellers?')) return;

    try {
      const res = await fetch('/api/admin/homepage/bestsellers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      alert('Failed to remove product');
    }
  };

  const handleEdit = (item: FeaturedBestseller) => {
    setEditingItem(item);
    setOverrideForm({
      overrideImageUrl: item.overrideImageUrl || '',
      overrideImagePublicId: item.overrideImagePublicId || '',
      overrideTitle: item.overrideTitle || '',
      overrideDescription: item.overrideDescription || '',
      overrideLinkUrl: item.overrideLinkUrl || '',
    });
  };

  const handleSaveOverride = async () => {
    if (!editingItem) return;

    try {
      const res = await fetch(`/api/admin/homepage/bestsellers/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overrideForm),
      });

      if (res.ok) {
        fetchData();
        setEditingItem(null);
        setOverrideForm({
          overrideImageUrl: '',
          overrideImagePublicId: '',
          overrideTitle: '',
          overrideDescription: '',
          overrideLinkUrl: '',
        });
      }
    } catch (error) {
      alert('Failed to save customization');
    }
  };

  const getDisplayData = (item: FeaturedBestseller) => {
    return {
      title: item.overrideTitle || item.product.name,
      image: item.overrideImageUrl || item.product.primaryImage || '/placeholder.jpg',
      linkUrl: item.overrideLinkUrl || `/product/${item.productId}`,
    };
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/admin/homepage" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold">Bestseller Products</h1>
        <p className="text-gray-600 mt-1">Curate products to display in the bestsellers section with custom images and titles</p>
      </div>

      {/* Search & Add */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-orange-500">
        <h2 className="text-xl font-bold mb-4">Add Product to Bestsellers</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button onClick={handleSearch} className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700">
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map(product => (
              <div key={product.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-gray-600">₹{parseFloat(product.price).toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => handleAdd(product.id)} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Override Form */}
      {editingItem && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg shadow-lg mb-8 border-2 border-orange-400">
          <h2 className="text-xl font-bold mb-4 text-orange-900">Customize Display for: {editingItem.product.name}</h2>
          <p className="text-sm text-orange-700 mb-4">
            Override how this product appears on the homepage. Leave fields empty to use product defaults.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Image</label>
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
                  <div>
                    <button
                      type="button"
                      onClick={() => open()}
                      className="w-full bg-orange-100 border-2 border-dashed border-orange-400 text-orange-700 px-4 py-3 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      {overrideForm.overrideImageUrl ? 'Change Image' : 'Upload Custom Image'}
                    </button>
                    {overrideForm.overrideImageUrl && (
                      <div className="mt-3 relative h-40 rounded-lg overflow-hidden border-2 border-orange-300">
                        <Image
                          src={overrideForm.overrideImageUrl}
                          alt="Custom preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CldUploadWidget>
            </div>

            {/* Text Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Title</label>
                <input
                  type="text"
                  value={overrideForm.overrideTitle}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideTitle: e.target.value })}
                  placeholder={editingItem.product.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Description</label>
                <textarea
                  value={overrideForm.overrideDescription}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideDescription: e.target.value })}
                  placeholder="Short description for homepage"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Link URL</label>
                <input
                  type="text"
                  value={overrideForm.overrideLinkUrl}
                  onChange={(e) => setOverrideForm({ ...overrideForm, overrideLinkUrl: e.target.value })}
                  placeholder={`/product/${editingItem.productId}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveOverride}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Save Customization
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setOverrideForm({
                  overrideImageUrl: '',
                  overrideImagePublicId: '',
                  overrideTitle: '',
                  overrideDescription: '',
                  overrideLinkUrl: '',
                });
              }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bestsellers List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Current Bestsellers</h2>
        {featured.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bestsellers yet. Search and add products above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((item, index) => {
              const display = getDisplayData(item);
              const hasOverrides = !!(item.overrideImageUrl || item.overrideTitle);

              return (
                <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    <Image
                      src={display.image}
                      alt={display.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                    {hasOverrides && (
                      <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Customized
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{display.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">₹{parseFloat(item.product.price).toLocaleString('en-IN')}</p>

                    {hasOverrides && (
                      <div className="text-xs text-purple-600 mb-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span>Using custom image or title</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                      >
                        Customize
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                      >
                        Remove
                      </button>
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
