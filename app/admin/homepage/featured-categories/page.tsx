'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FeaturedCategory {
  id: string;
  categoryId: string;
  displayOrder: number;
  isActive: boolean;
  category: Category;
}

export default function FeaturedCategoriesPage() {
  const [featured, setFeatured] = useState<FeaturedCategory[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

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

    // Check if already featured
    if (featured.some(f => f.categoryId === selectedCategoryId)) {
      alert('This category is already featured');
      return;
    }

    try {
      const res = await fetch('/api/admin/homepage/featured-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategoryId, displayOrder: featured.length }),
      });

      if (res.ok) {
        fetchData();
        setSelectedCategoryId('');
      }
    } catch (error) {
      alert('Failed to add category');
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

  if (loading) return <div className="p-6">Loading...</div>;

  const availableCategories = allCategories.filter(
    cat => !featured.some(f => f.categoryId === cat.id)
  );

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin/homepage" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold">Featured Categories</h1>
        <p className="text-gray-600 mt-1">Select which categories to display on the homepage</p>
      </div>

      {/* Add Category */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Add Category to Homepage</h2>
        <div className="flex gap-4">
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          >
            <option value="">Select a category...</option>
            {availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Add to Homepage
          </button>
        </div>
      </div>

      {/* Featured Categories List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Categories on Homepage</h2>
        {featured.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories featured yet. Add some above!</p>
        ) : (
          <div className="space-y-3">
            {featured.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                  <div>
                    <h3 className="font-bold">{item.category.name}</h3>
                    <p className="text-sm text-gray-600">{item.category.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
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
