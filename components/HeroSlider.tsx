'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  layout: 'center' | 'split-left' | 'split-right';
  cta?: {
    text: string;
    link: string;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'WEDDING SPECIAL',
    subtitle: '2025',
    description: 'Weaves for the Wedding Season',
    layout: 'split-left',
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
    layout: 'center',
    cta: {
      text: 'Shop Now',
      link: '/categories',
    },
  },
  {
    id: 3,
    title: 'NEW ARRIVALS',
    subtitle: 'Latest Collection',
    description: 'Discover the finest handcrafted sarees',
    layout: 'split-right',
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
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-white">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {slide.layout === 'center' ? (
              /* Center Layout - Like BLACK FRIDAY SALE */
              <div className="h-full bg-navy-dark flex items-center justify-center relative">
                {/* Optional: Side images */}
                <div className="absolute inset-0 grid grid-cols-3">
                  <div className="bg-gradient-to-r from-maroon/30 to-transparent"></div>
                  <div></div>
                  <div className="bg-gradient-to-l from-maroon/30 to-transparent"></div>
                </div>

                {/* Center Content */}
                <div className="relative z-10 text-center text-white px-4">
                  {slide.subtitle && (
                    <div className="text-lg md:text-xl tracking-widest mb-4 text-golden">
                      {slide.subtitle}
                    </div>
                  )}
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-wider">
                    {slide.title}
                  </h1>
                  <div className="w-48 h-0.5 bg-golden mx-auto mb-6"></div>
                  {slide.description && (
                    <p className="text-xl md:text-2xl mb-8 text-silk-white">
                      {slide.description}
                    </p>
                  )}
                  {slide.cta && (
                    <Link
                      href={slide.cta.link}
                      className="inline-block bg-white text-maroon px-10 py-4 rounded-full font-semibold text-lg hover:bg-golden hover:text-navy-dark transition-all duration-300 shadow-xl"
                    >
                      {slide.cta.text}
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Split Layout - Like WEDDING SEASON */
              <div className="h-full grid md:grid-cols-2">
                {/* Left Side - Text with Pattern */}
                <div
                  className={`bg-maroon text-white flex items-center justify-center p-8 md:p-12 relative overflow-hidden ${
                    slide.layout === 'split-right' ? 'md:order-2' : ''
                  }`}
                >
                  {/* Pattern Background */}
                  <div className="absolute inset-0 bg-pattern-maroon opacity-40"></div>

                  {/* Decorative elements */}
                  <div className="absolute top-10 left-10 w-32 h-32 border-2 border-golden/20 rounded-full"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-golden/20 rounded-full"></div>

                  {/* Content */}
                  <div className="relative z-10 text-center max-w-md">
                    {slide.description && (
                      <p className="text-2xl md:text-3xl mb-6 font-light text-silk-white">
                        {slide.description}
                      </p>
                    )}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                      <span className="block">{slide.title}</span>
                      {slide.subtitle && (
                        <span className="block text-golden mt-2">{slide.subtitle}</span>
                      )}
                    </h1>
                    {slide.cta && (
                      <Link
                        href={slide.cta.link}
                        className="inline-block bg-golden text-maroon px-8 py-3 rounded-full font-semibold text-lg hover:bg-silk-white transition-all duration-300 shadow-xl mt-6"
                      >
                        {slide.cta.text}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Right Side - Image Placeholder */}
                <div
                  className={`bg-gradient-to-br from-cream via-silk-white to-golden/10 hidden md:flex items-center justify-center relative ${
                    slide.layout === 'split-right' ? 'md:order-1' : ''
                  }`}
                >
                  {/* Placeholder for product images */}
                  <div className="text-center text-maroon/30">
                    <svg className="w-48 h-48 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-sm">Product Image</p>
                  </div>
                </div>
              </div>
            )}
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
