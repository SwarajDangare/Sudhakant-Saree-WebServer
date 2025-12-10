'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: string;
}

interface Settings {
  id: string;
  mode: string;
  count: number;
}

interface FeaturedNewArrival {
  id: string;
  productId: string;
  displayOrder: number;
  product: Product;
}

export default function NewArrivalsPage() {
  const [settings, setSettings] = useState<Settings>({ id: '', mode: 'automatic', count: 8 });
  const [featured, setFeatured] = useState<FeaturedNewArrival[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/homepage/new-arrivals');
      const data = await res.json();
      setSettings(data.settings || { id: '', mode: 'automatic', count: 8 });
      setFeatured(data.featured || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/admin/homepage/new-arrivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      alert('Settings saved!');
    } catch (error) {
      alert('Failed to save settings');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`/api/admin/homepage/new-arrivals?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.searchResults || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (productId: string) => {
    try {
      await fetch('/api/admin/homepage/new-arrivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, displayOrder: featured.length }),
      });
      fetchData();
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      alert('Failed to add product');
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Remove from new arrivals?')) return;

    try {
      await fetch('/api/admin/homepage/new-arrivals', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch (error) {
      alert('Failed to remove product');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/homepage" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold">New Arrivals</h1>
        <p className="text-gray-600 mt-1">Configure how new products are displayed on the homepage</p>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
        <h2 className="text-xl font-bold mb-4">Display Mode</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="automatic"
                checked={settings.mode === 'automatic'}
                onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
                className="w-4 h-4"
              />
              <span className="font-medium">Automatic</span>
              <span className="text-sm text-gray-600">(Show newest products)</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="manual"
                checked={settings.mode === 'manual'}
                onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
                className="w-4 h-4"
              />
              <span className="font-medium">Manual</span>
              <span className="text-sm text-gray-600">(Select specific products)</span>
            </label>
          </div>

          {settings.mode === 'automatic' && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Number of Products to Show</label>
              <input
                type="number"
                value={settings.count}
                onChange={(e) => setSettings({ ...settings, count: parseInt(e.target.value) || 8 })}
                className="w-32 px-3 py-2 border rounded-lg"
                min="1"
                max="20"
              />
            </div>
          )}

          <button onClick={handleSaveSettings} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Save Settings
          </button>
        </div>
      </div>

      {/* Manual Selection */}
      {settings.mode === 'manual' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">Add Product to New Arrivals</h2>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search products..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Current New Arrivals</h2>
            {featured.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products selected. Search and add above!</p>
            ) : (
              <div className="space-y-3">
                {featured.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                      <div>
                        <h3 className="font-bold">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">₹{parseFloat(item.product.price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(item.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {settings.mode === 'automatic' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">ℹ️ Automatic Mode Active</h3>
          <p className="text-blue-800">
            The homepage will automatically show the {settings.count} newest products based on their creation date.
            No manual selection needed!
          </p>
        </div>
      )}
    </div>
  );
}
