'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Announcement {
  id: string;
  text: string;
  highlightText: string | null;
  linkUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    highlightText: '',
    linkUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/homepage/announcements');
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingAnnouncement(null);
    setFormData({
      text: '',
      highlightText: '',
      linkUrl: '',
      displayOrder: announcements.length,
      isActive: true,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setIsCreating(false);
    setEditingAnnouncement(announcement);
    setFormData({
      text: announcement.text,
      highlightText: announcement.highlightText || '',
      linkUrl: announcement.linkUrl || '',
      displayOrder: announcement.displayOrder,
      isActive: announcement.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text) {
      alert('Text is required');
      return;
    }

    try {
      const url = editingAnnouncement
        ? `/api/admin/homepage/announcements/${editingAnnouncement.id}`
        : '/api/admin/homepage/announcements';

      const method = editingAnnouncement ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchAnnouncements();
        setIsCreating(false);
        setEditingAnnouncement(null);
        setFormData({
          text: '',
          highlightText: '',
          linkUrl: '',
          displayOrder: 0,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`/api/admin/homepage/announcements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
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
          <h1 className="text-3xl font-bold text-gray-900">Promo Bar Announcements</h1>
          <p className="text-gray-600 mt-1">
            Manage rotating announcements in the top promo bar
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
        >
          + Add Announcement
        </button>
      </div>

      {/* Form for creating/editing announcement */}
      {(isCreating || editingAnnouncement) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-purple-500">
          <h2 className="text-xl font-bold mb-4">
            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Announcement Text *
              </label>
              <input
                type="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="🎉 FLAT 10% OFF on your first order"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The main announcement text (e.g., "Free shipping on orders above ₹999")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Highlight Text (Optional)
              </label>
              <input
                type="text"
                value={formData.highlightText}
                onChange={(e) => setFormData({ ...formData, highlightText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="WELCOME10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Text to highlight (e.g., coupon code "WELCOME10" or "SHOP NOW")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL (Optional)
              </label>
              <input
                type="text"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="/offers"
              />
              <p className="text-xs text-gray-500 mt-1">
                Where to link when clicked (e.g., "/offers" or "/categories")
              </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Order in the rotation (lower numbers appear first)
                </p>
              </div>

              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Announcement
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingAnnouncement(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of announcements */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Current Announcements</h2>

          {announcements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No announcements yet. Create your first announcement to display in the promo bar!
            </p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{announcement.text}</h3>
                      {announcement.highlightText && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-semibold">
                          {announcement.highlightText}
                        </span>
                      )}
                    </div>
                    {announcement.linkUrl && (
                      <p className="text-sm text-gray-600">Links to: {announcement.linkUrl}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Order: {announcement.displayOrder}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          announcement.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
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
      {announcements.filter(a => a.isActive).length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-bold mb-3">Preview</h3>
          <div className="bg-gradient-to-r from-maroon to-deep-maroon text-white py-3 px-4 rounded-lg">
            <div className="animate-pulse">
              {announcements
                .filter(a => a.isActive)
                .sort((a, b) => a.displayOrder - b.displayOrder)[0] && (
                <div className="text-center">
                  <span>{announcements.filter(a => a.isActive).sort((a, b) => a.displayOrder - b.displayOrder)[0].text}</span>
                  {announcements.filter(a => a.isActive).sort((a, b) => a.displayOrder - b.displayOrder)[0].highlightText && (
                    <span className="ml-2 font-bold">
                      {announcements.filter(a => a.isActive).sort((a, b) => a.displayOrder - b.displayOrder)[0].highlightText}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Active announcements rotate every 5 seconds on the homepage
          </p>
        </div>
      )}
    </div>
  );
}
