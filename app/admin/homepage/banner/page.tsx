'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
  linkUrl: string | null;
  linkText: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MidPageBannerPage() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    linkUrl: '',
    linkText: 'Shop Now',
    isActive: true,
  });

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const response = await fetch('/api/admin/homepage/banner');
      const data = await response.json();
      if (data) {
        setBanner(data);
        setFormData({
          title: data.title,
          subtitle: data.subtitle || '',
          description: data.description || '',
          imageUrl: data.imageUrl,
          imagePublicId: data.imagePublicId,
          linkUrl: data.linkUrl || '',
          linkText: data.linkText || 'Shop Now',
          isActive: data.isActive,
        });
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      alert('Title and image are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/homepage/banner', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setBanner(data);
        alert('Banner saved successfully!');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/homepage"
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          ← Back to Homepage Management
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Mid-Page Banner</h1>
        <p className="text-gray-600 mt-1">
          Large promotional banner displayed in the middle of the homepage
        </p>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
        <h2 className="text-xl font-bold mb-4">
          {banner ? 'Edit Banner' : 'Create Banner'}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Wedding Season Sale"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="EXCLUSIVE OFFER"
            />
            <p className="text-xs text-gray-500 mt-1">
              Small text above the title
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Get up to 50% OFF on bridal collection"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Banner Image *
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
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended size: 1920x600px (wide banner)
                  </p>
                  {formData.imageUrl && (
                    <div className="mt-4 relative w-full h-64">
                      <Image
                        src={formData.imageUrl}
                        alt="Banner preview"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="/sale/wedding-season"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={formData.linkText}
                onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Shop Now"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Display on homepage)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Save Banner
          </button>
        </form>
      </div>

      {/* Preview */}
      {formData.imageUrl && (
        <div className="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
          <h3 className="text-lg font-bold mb-3">Preview</h3>
          <div className="relative rounded-lg overflow-hidden">
            <div className="relative h-80">
              <Image
                src={formData.imageUrl}
                alt={formData.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                <div className="max-w-2xl p-12 text-white">
                  {formData.subtitle && (
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-saffron">
                      {formData.subtitle}
                    </p>
                  )}
                  <h2 className="text-5xl font-bold mb-4">{formData.title}</h2>
                  {formData.description && (
                    <p className="text-xl mb-6">{formData.description}</p>
                  )}
                  {formData.linkUrl && (
                    <button className="bg-white text-maroon px-8 py-3 rounded-lg font-semibold hover:bg-saffron hover:text-white transition-colors">
                      {formData.linkText || 'Shop Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
