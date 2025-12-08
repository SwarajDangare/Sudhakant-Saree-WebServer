'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  cta?: {
    text: string;
    link: string;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Weaves for the Wedding Season',
    subtitle: 'WEDDING SPECIAL 2025',
    backgroundImage: '/images/hero-wedding.jpg', // Placeholder
    cta: {
      text: 'Shop Now',
      link: '/categories',
    },
  },
  {
    id: 2,
    title: 'FLAT 40% OFF',
    subtitle: 'BLACK FRIDAY SALE',
    description: 'on select merchandise',
    backgroundImage: '/images/hero-sale.jpg', // Placeholder
    cta: {
      text: 'Shop Now',
      link: '/categories',
    },
  },
  {
    id: 3,
    title: 'Discover the Finest Handcrafted Sarees',
    subtitle: 'NEW ARRIVALS',
    backgroundImage: '/images/hero-new.jpg', // Placeholder
    cta: {
      text: 'Explore Collections',
      link: '/categories',
    },
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image - Stretched to cover entire slide */}
            <div className="absolute inset-0">
              {/* Gradient background as fallback */}
              <div className="absolute inset-0 bg-gradient-to-br from-maroon/90 via-maroon/70 to-maroon/50">
                {/* Pattern overlay */}
                <div className="absolute inset-0 bg-pattern-maroon opacity-20"></div>
              </div>

              {/* Background image placeholder - will be replaced with actual images */}
              <div className="absolute inset-0 bg-gradient-to-br from-cream via-silk-white to-golden/20"></div>
            </div>

            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Content Overlay - Centered or Left-aligned */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  {/* Subtitle */}
                  {slide.subtitle && (
                    <div className="mb-4 animate-fade-in">
                      <span className="text-sm md:text-base tracking-widest text-golden font-semibold">
                        {slide.subtitle}
                      </span>
                    </div>
                  )}

                  {/* Main Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  {slide.description && (
                    <p className="text-xl md:text-2xl text-silk-white mb-8 animate-fade-in-up">
                      {slide.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  {slide.cta && (
                    <div className="animate-fade-in-up-delay">
                      <Link
                        href={slide.cta.link}
                        className="inline-block bg-white text-maroon px-8 py-4 rounded-full font-semibold text-lg hover:bg-golden hover:text-white transition-all duration-300 shadow-xl hover:scale-105"
                      >
                        {slide.cta.text}
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
        {slides.map((_, index) => (
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
