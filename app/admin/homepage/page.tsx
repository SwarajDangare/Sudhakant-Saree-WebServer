'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HomepageData {
  sections: Record<string, { isActive: boolean; displayOrder: number }>;
  announcements: any[];
  collections: any[];
  categories: any[];
  bestsellers: any[];
  newArrivals: any[];
  midPageBanner: any;
  occasions: any[];
  brandStory: any;
  brandStoryStats: any[];
  instagramFeed: any[];
  instagramHandle: string;
  trustBadges: any[];
}

export default function HomepageManagementPage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const response = await fetch('/api/homepage/all');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homepage data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">⚠️ Database Not Set Up</h2>
          <p className="text-yellow-700 mb-4">
            The homepage database tables haven't been created yet. You need to:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700 mb-4">
            <li>Apply the database migration (0008_fixed_wind_dancer.sql)</li>
            <li>Run the seed script: <code className="bg-yellow-100 px-2 py-1 rounded">npm run db:seed-homepage</code></li>
          </ol>
          <p className="text-sm text-yellow-600">
            Check your terminal or Neon SQL Editor to run the migration.
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'hero_slider', name: 'Hero Slider', desc: 'Main banner carousel at top', color: 'blue' },
    { key: 'promo_bar', name: 'Promo Bar', desc: 'Announcement bar', color: 'purple', count: data.announcements.length },
    { key: 'shop_by_category', name: 'Shop by Category', desc: '3 featured categories', color: 'green', count: data.categories.length },
    { key: 'featured_collections', name: 'Featured Collections', desc: '2 curated collections', color: 'pink', count: data.collections.length },
    { key: 'bestseller_products', name: 'Bestseller Products', desc: 'Top 4 products', color: 'orange', count: data.bestsellers.length },
    { key: 'mid_page_banner', name: 'Mid-Page Banner', desc: 'Promotional banner', color: 'red', hasData: !!data.midPageBanner },
    { key: 'shop_by_occasion', name: 'Shop by Occasion', desc: 'Wedding, Festival, Party, Casual', color: 'indigo', count: data.occasions.length },
    { key: 'new_arrivals', name: 'New Arrivals', desc: 'Latest 4 products', color: 'teal', count: data.newArrivals.length },
    { key: 'brand_story', name: 'Brand Story', desc: 'About section with stats', color: 'amber', hasData: !!data.brandStory },
    { key: 'instagram_feed', name: 'Instagram Feed', desc: 'Social media posts', color: 'rose', count: data.instagramFeed.length },
    { key: 'trust_badges', name: 'Trust Badges', desc: 'Shipping, Payment, etc.', color: 'cyan', count: data.trustBadges.length },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Homepage Management</h1>
        <p className="text-gray-600">
          Manage all sections of your homepage. Toggle visibility, edit content, and reorder sections.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Sections</div>
          <div className="text-2xl font-bold">{sections.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Active Sections</div>
          <div className="text-2xl font-bold">
            {sections.filter(s => data.sections[s.key]?.isActive !== false).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-2xl font-bold">
            {data.bestsellers.length + data.newArrivals.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="text-sm text-gray-600">Collections</div>
          <div className="text-2xl font-bold">{data.collections.length}</div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const sectionData = data.sections[section.key];
          const isActive = sectionData?.isActive !== false;

          return (
            <div
              key={section.key}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${section.color}-500 hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {section.name}
                  </h3>
                  <p className="text-sm text-gray-600">{section.desc}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isActive ? 'Active' : 'Hidden'}
                </div>
              </div>

              {/* Content Stats */}
              <div className="mb-4">
                {section.count !== undefined && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{section.count}</span> items
                  </div>
                )}
                {section.hasData !== undefined && (
                  <div className="text-sm text-gray-600">
                    {section.hasData ? (
                      <span className="text-green-600">✓ Configured</span>
                    ) : (
                      <span className="text-orange-600">⚠ Not configured</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                  Edit Content
                </button>
                <button className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}>
                  {isActive ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-maroon to-deep-maroon rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products?featured=true"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all"
          >
            <div className="text-sm opacity-90 mb-1">Manage</div>
            <div className="font-bold">Featured Products</div>
          </Link>
          <Link
            href="/admin/categories"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all"
          >
            <div className="text-sm opacity-90 mb-1">Manage</div>
            <div className="font-bold">Categories</div>
          </Link>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all text-left">
            <div className="text-sm opacity-90 mb-1">Upload</div>
            <div className="font-bold">Images</div>
          </button>
          <button
            onClick={fetchHomepageData}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-all text-left"
          >
            <div className="text-sm opacity-90 mb-1">Refresh</div>
            <div className="font-bold">Preview Changes</div>
          </button>
        </div>
      </div>

      {/* Setup Instructions (if no data) */}
      {Object.keys(data.sections).length === 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">🚀 First Time Setup</h3>
          <p className="text-blue-800 mb-4">
            To populate your homepage with initial content:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 mb-4">
            <li>Open your terminal in the project directory</li>
            <li>Run: <code className="bg-blue-100 px-2 py-1 rounded font-mono">npm run db:seed-homepage</code></li>
            <li>Refresh this page to see the changes</li>
          </ol>
          <p className="text-sm text-blue-600">
            This will add sample content to all sections that you can then customize.
          </p>
        </div>
      )}
    </div>
  );
}
