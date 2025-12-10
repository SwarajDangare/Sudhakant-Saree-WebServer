'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: string;
}

interface FeaturedBestseller {
  id: string;
  productId: string;
  displayOrder: number;
  product: Product;
}

export default function BestsellersPage() {
  const [featured, setFeatured] = useState<FeaturedBestseller[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/homepage" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold">Bestseller Products</h1>
        <p className="text-gray-600 mt-1">Curate products to display in the bestsellers section</p>
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

      {/* Bestsellers List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Current Bestsellers</h2>
        {featured.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bestsellers yet. Search and add products above!</p>
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
    </div>
  );
}
