'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
  ctaText: string;
  ctaLink: string | null;
  displayOrder: number;
  isActive: boolean;
}

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    ctaText: 'Shop Now',
    ctaLink: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/admin/homepage/hero-slider');
      const data = await res.json();
      setSlides(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditing(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      imagePublicId: '',
      ctaText: 'Shop Now',
      ctaLink: '',
      displayOrder: slides.length,
      isActive: true,
    });
  };

  const handleEdit = (slide: HeroSlide) => {
    setIsCreating(false);
    setEditing(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      imageUrl: slide.imageUrl,
      imagePublicId: slide.imagePublicId,
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink || '',
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.imageUrl) {
      alert('Title and image are required');
      return;
    }

    try {
      const url = editing
        ? `/api/admin/homepage/hero-slider/${editing.id}`
        : '/api/admin/homepage/hero-slider';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchSlides();
        setIsCreating(false);
        setEditing(null);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return;

    try {
      await fetch(`/api/admin/homepage/hero-slider/${id}`, { method: 'DELETE' });
      fetchSlides();
    } catch (error) {
      alert('Failed to delete slide');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link href="/admin/homepage" className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block">
            ← Back to Homepage Management
          </Link>
          <h1 className="text-3xl font-bold">Hero Slider</h1>
          <p className="text-gray-600 mt-1">Rotating banner at the top of homepage</p>
        </div>
        <button onClick={handleCreate} className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-teal-700">
          + Add Slide
        </button>
      </div>

      {(isCreating || editing) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-teal-500">
          <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Slide' : 'Create Slide'}</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtitle</label>
                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Banner Image *</label>
              <CldUploadWidget uploadPreset="sudhakant_sarees" onSuccess={(result: any) => setFormData({ ...formData, imageUrl: result.info.secure_url, imagePublicId: result.info.public_id })}>
                {({ open }) => (
                  <div>
                    <button type="button" onClick={() => open()} className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">Upload Image</button>
                    {formData.imageUrl && <div className="mt-4 relative w-full h-64"><Image src={formData.imageUrl} alt="Preview" fill className="object-cover rounded-lg" /></div>}
                  </div>
                )}
              </CldUploadWidget>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Button Text</label>
                <input type="text" value={formData.ctaText} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Button Link</label>
                <input type="text" value={formData.ctaLink} onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
              <label className="ml-2 text-sm">Active</label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">Save Slide</button>
              <button type="button" onClick={() => { setIsCreating(false); setEditing(null); }} className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Current Slides</h2>
        {slides.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No slides yet. Add your first slide!</p>
        ) : (
          <div className="space-y-4">
            {slides.map((slide) => (
              <div key={slide.id} className="border rounded-lg overflow-hidden">
                <div className="flex gap-4">
                  <div className="relative w-48 h-32">
                    <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" />
                  </div>
                  <div className="flex-grow p-4">
                    <h3 className="font-bold text-lg">{slide.title}</h3>
                    {slide.subtitle && <p className="text-sm text-teal-600">{slide.subtitle}</p>}
                    {slide.description && <p className="text-sm text-gray-600">{slide.description}</p>}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Order: {slide.displayOrder}</span>
                      <span className={`text-xs px-2 py-1 rounded ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{slide.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    <button onClick={() => handleEdit(slide)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Edit</button>
                    <button onClick={() => handleDelete(slide.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
