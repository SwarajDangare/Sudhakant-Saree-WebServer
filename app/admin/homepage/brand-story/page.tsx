'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface Stat {
  label: string;
  value: string;
}

interface BrandStory {
  id: string;
  heading: string;
  subtitle: string | null;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  stats?: Stat[];
}

export default function BrandStoryPage() {
  const [story, setStory] = useState<BrandStory | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    heading: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    buttonText: 'Our Story',
    buttonLink: '/about',
    isActive: true,
    stats: [
      { label: 'Years of Heritage', value: '50+' },
      { label: 'Master Artisans', value: '200+' },
      { label: 'Happy Customers', value: '10K+' },
    ],
  });

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const response = await fetch('/api/admin/homepage/brand-story');
      const data = await response.json();
      if (data) {
        setStory(data);
        setFormData({
          heading: data.heading,
          subtitle: data.subtitle || '',
          description: data.description,
          imageUrl: data.imageUrl,
          imagePublicId: data.imagePublicId,
          buttonText: data.buttonText || 'Our Story',
          buttonLink: data.buttonLink || '/about',
          isActive: data.isActive,
          stats: data.stats && data.stats.length > 0
            ? data.stats
            : [
                { label: 'Years of Heritage', value: '50+' },
                { label: 'Master Artisans', value: '200+' },
                { label: 'Happy Customers', value: '10K+' },
              ],
        });
      }
    } catch (error) {
      console.error('Error fetching brand story:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.heading || !formData.description || !formData.imageUrl) {
      alert('Heading, description, and image are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/homepage/brand-story', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setStory(data);
        alert('Brand story saved successfully!');
        fetchStory(); // Refresh to get stats
      }
    } catch (error) {
      console.error('Error saving brand story:', error);
      alert('Failed to save brand story');
    }
  };

  const handleAddStat = () => {
    setFormData({
      ...formData,
      stats: [...formData.stats, { label: '', value: '' }],
    });
  };

  const handleRemoveStat = (index: number) => {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index),
    });
  };

  const handleStatChange = (index: number, field: 'label' | 'value', value: string) => {
    const newStats = [...formData.stats];
    newStats[index][field] = value;
    setFormData({ ...formData, stats: newStats });
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
        <h1 className="text-3xl font-bold text-gray-900">Brand Story Section</h1>
        <p className="text-gray-600 mt-1">
          Tell your brand's story with stats and imagery
        </p>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
        <h2 className="text-xl font-bold mb-4">
          {story ? 'Edit Brand Story' : 'Create Brand Story'}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heading *
            </label>
            <input
              type="text"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Weaving Traditions, Creating Memories"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="About Us"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="For over three generations, Sudhakant Sarees has been the epitome of authentic Indian craftsmanship..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Image *
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
                        alt="Brand story preview"
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
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Our Story"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="/about"
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Stats
              </label>
              <button
                type="button"
                onClick={handleAddStat}
                className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200 transition-colors"
              >
                + Add Stat
              </button>
            </div>

            <div className="space-y-3">
              {formData.stats.map((stat, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-bold text-lg"
                    placeholder="50+"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Years of Heritage"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Display on homepage)
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-semibold"
          >
            Save Brand Story
          </button>
        </form>
      </div>

      {/* Preview */}
      {formData.imageUrl && (
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
          <h3 className="text-lg font-bold mb-3">Preview</h3>
          <div className="bg-white rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-80 rounded-lg overflow-hidden">
                <Image
                  src={formData.imageUrl}
                  alt={formData.heading}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                {formData.subtitle && (
                  <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-amber-600">
                    {formData.subtitle}
                  </p>
                )}
                <h2 className="text-4xl font-bold mb-4 text-gray-900">{formData.heading}</h2>
                <p className="text-gray-600 mb-6">{formData.description}</p>

                {/* Stats */}
                {formData.stats.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {formData.stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-3xl font-bold text-amber-600">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                  {formData.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
