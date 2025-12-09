'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  imageUrl: string;
  imagePublicId: string;
  linkUrl: string | null;
  linkText: string | null;
  displayOrder: number;
  active: boolean;
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to check if URL is a video
  const isVideoUrl = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Fetch banners from API
  useEffect(() => {
    fetch('/api/admin/banners')
      .then((res) => res.json())
      .then((data) => {
        // Filter only active banners
        const activeBanners = data.filter((banner: Banner) => banner.active);
        setBanners(activeBanners);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching banners:', error);
        setLoading(false);
      });
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, banners.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Loading state
  if (loading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-maroon/90 via-maroon/70 to-maroon/50 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </section>
    );
  }

  // No banners state
  if (banners.length === 0) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-maroon/90 via-maroon/70 to-maroon/50 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Sudhakant Sarees</h1>
          <p className="text-xl">Discover our exquisite collection</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Media - Image or Video from Cloudinary */}
            <div className="absolute inset-0">
              {isVideoUrl(banner.imageUrl) ? (
                <video
                  src={banner.imageUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              )}
            </div>

            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Content Overlay - Left-aligned */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  {/* Subtitle */}
                  {banner.subtitle && (
                    <div className="mb-4 animate-fade-in">
                      <span className="text-sm md:text-base tracking-widest text-golden font-semibold">
                        {banner.subtitle}
                      </span>
                    </div>
                  )}

                  {/* Main Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                    {banner.title}
                  </h1>

                  {/* Description */}
                  {banner.description && (
                    <p className="text-xl md:text-2xl text-silk-white mb-8 animate-fade-in-up">
                      {banner.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  {banner.linkUrl && (
                    <div className="animate-fade-in-up-delay">
                      <Link
                        href={banner.linkUrl}
                        className="inline-block bg-white text-maroon px-8 py-4 rounded-full font-semibold text-lg hover:bg-golden hover:text-white transition-all duration-300 shadow-xl hover:scale-105"
                      >
                        {banner.linkText || 'Shop Now'}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
