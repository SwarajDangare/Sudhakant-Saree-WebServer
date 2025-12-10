'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TrustBadge {
  id: string;
  title: string;
  description: string;
  iconType: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ICON_TYPES = [
  { value: 'shipping', label: 'Free Shipping', icon: '🚚' },
  { value: 'payment', label: 'Secure Payment', icon: '💳' },
  { value: 'authentic', label: '100% Authentic', icon: '✓' },
  { value: 'returns', label: 'Easy Returns', icon: '↩️' },
  { value: 'support', label: '24/7 Support', icon: '💬' },
  { value: 'quality', label: 'Quality Guarantee', icon: '⭐' },
];

export default function TrustBadgesPage() {
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingBadge, setEditingBadge] = useState<TrustBadge | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    iconType: 'shipping',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch('/api/admin/homepage/trust-badges');
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      console.error('Error fetching trust badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingBadge(null);
    setFormData({
      title: '',
      description: '',
      iconType: 'shipping',
      displayOrder: badges.length,
      isActive: true,
    });
  };

  const handleEdit = (badge: TrustBadge) => {
    setIsCreating(false);
    setEditingBadge(badge);
    setFormData({
      title: badge.title,
      description: badge.description,
      iconType: badge.iconType,
      displayOrder: badge.displayOrder,
      isActive: badge.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.iconType) {
      alert('All fields are required');
      return;
    }

    try {
      const url = editingBadge
        ? `/api/admin/homepage/trust-badges/${editingBadge.id}`
        : '/api/admin/homepage/trust-badges';

      const method = editingBadge ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchBadges();
        setIsCreating(false);
        setEditingBadge(null);
        setFormData({
          title: '',
          description: '',
          iconType: 'shipping',
          displayOrder: 0,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Failed to save badge');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trust badge?')) return;

    try {
      const response = await fetch(`/api/admin/homepage/trust-badges/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBadges();
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Failed to delete badge');
    }
  };

  const getIconForType = (type: string) => {
    return ICON_TYPES.find(t => t.value === type)?.icon || '✓';
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
          <h1 className="text-3xl font-bold text-gray-900">Trust Badges</h1>
          <p className="text-gray-600 mt-1">
            Service guarantees displayed at the bottom of the homepage
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-colors"
        >
          + Add Trust Badge
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingBadge) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-cyan-500">
          <h2 className="text-xl font-bold mb-4">
            {editingBadge ? 'Edit Trust Badge' : 'Create New Trust Badge'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="FREE SHIPPING"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Free shipping on orders above ₹999 across India"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ICON_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, iconType: type.value })}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      formData.iconType === type.value
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Save Badge
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingBadge(null);
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
          <h2 className="text-xl font-bold mb-4">Current Trust Badges</h2>

          {badges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No trust badges yet. Add your first badge!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{getIconForType(badge.iconType)}</div>
                    <h3 className="font-bold text-lg mb-1">{badge.title}</h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>

                  <div className="flex gap-2 items-center justify-between mb-3">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Order: {badge.displayOrder}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        badge.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {badge.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(badge)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(badge.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      {badges.filter(b => b.isActive).length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6 border border-cyan-200">
          <h3 className="text-lg font-bold mb-3">Preview</h3>
          <div className="bg-white rounded-lg p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {badges
                .filter(b => b.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((badge) => (
                  <div key={badge.id} className="text-center">
                    <div className="text-4xl mb-2">{getIconForType(badge.iconType)}</div>
                    <h4 className="font-bold text-sm mb-1">{badge.title}</h4>
                    <p className="text-xs text-gray-600">{badge.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
