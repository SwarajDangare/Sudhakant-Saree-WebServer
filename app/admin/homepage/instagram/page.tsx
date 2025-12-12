'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface InstagramPost {
  id: string;
  imageUrl: string;
  imagePublicId: string;
  postUrl: string | null;
  caption: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InstagramSettings {
  instagramHandle: string;
  profileUrl: string;
  autoSync: boolean;
  maxPosts: number;
}

export default function InstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [settings, setSettings] = useState<InstagramSettings>({
    instagramHandle: '@sudhakantsarees',
    profileUrl: 'https://instagram.com/sudhakantsarees',
    autoSync: false,
    maxPosts: 6,
  });
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    imageUrl: '',
    imagePublicId: '',
    postUrl: '',
    caption: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/homepage/instagram');
      const data = await response.json();
      setPosts(data.posts || []);
      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching Instagram data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingPost(null);
    setFormData({
      imageUrl: '',
      imagePublicId: '',
      postUrl: '',
      caption: '',
      displayOrder: posts.length,
      isActive: true,
    });
  };

  const handleEdit = (post: InstagramPost) => {
    setIsCreating(false);
    setEditingPost(post);
    setFormData({
      imageUrl: post.imageUrl,
      imagePublicId: post.imagePublicId,
      postUrl: post.postUrl || '',
      caption: post.caption || '',
      displayOrder: post.displayOrder,
      isActive: post.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.imageUrl) {
      alert('Image is required');
      return;
    }

    try {
      const url = editingPost
        ? `/api/admin/homepage/instagram/${editingPost.id}`
        : '/api/admin/homepage/instagram';

      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchData();
        setIsCreating(false);
        setEditingPost(null);
        setFormData({
          imageUrl: '',
          imagePublicId: '',
          postUrl: '',
          caption: '',
          displayOrder: 0,
          isActive: true,
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/homepage/instagram/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/homepage/instagram', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/homepage"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Instagram Feed</h1>
        <p className="text-gray-600 mt-1">
          Manage Instagram posts displayed on the homepage
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-rose-500">
        <h2 className="text-xl font-bold mb-4">Instagram Settings</h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={settings.instagramHandle}
                onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="@sudhakantsarees"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile URL
              </label>
              <input
                type="text"
                value={settings.profileUrl}
                onChange={(e) => setSettings({ ...settings, profileUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="https://instagram.com/sudhakantsarees"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Posts to Display
            </label>
            <input
              type="number"
              value={settings.maxPosts}
              onChange={(e) => setSettings({ ...settings, maxPosts: parseInt(e.target.value) })}
              className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              min="1"
              max="12"
            />
          </div>

          <button
            type="submit"
            className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
          >
            Save Settings
          </button>
        </form>
      </div>

      {/* Add Post Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-2 rounded-lg hover:from-rose-600 hover:to-rose-700 transition-colors"
        >
          + Add Instagram Post
        </button>
      </div>

      {/* Form */}
      {(isCreating || editingPost) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-rose-500">
          <h2 className="text-xl font-bold mb-4">
            {editingPost ? 'Edit Post' : 'Add New Post'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post Image *
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
                      <div className="mt-4 relative w-64 h-64">
                        <Image
                          src={formData.imageUrl}
                          alt="Post preview"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram Post URL (Optional)
              </label>
              <input
                type="text"
                value={formData.postUrl}
                onChange={(e) => setFormData({ ...formData, postUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="https://instagram.com/p/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption (Optional)
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Beautiful silk saree..."
              />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center pt-7">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Save Post
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingPost(null);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Grid */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Instagram Posts</h2>

          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No posts yet. Add your first Instagram post!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative group aspect-square rounded-lg overflow-hidden"
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || 'Instagram post'}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {post.caption && (
                      <p className="text-white text-xs text-center line-clamp-2">{post.caption}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                    {!post.isActive && (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs">
                        Inactive
                      </span>
                    )}
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
