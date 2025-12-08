'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  cta?: {
    text: string;
    link: string;
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Elegance Woven in Tradition',
    subtitle: 'Discover Our Exclusive Saree Collection',
    image: '/images/hero-1.jpg', // Placeholder - will use gradient if image not found
    cta: {
      text: 'Shop Now',
      link: '/categories',
    },
  },
  {
    id: 2,
    title: 'Handcrafted Masterpieces',
    subtitle: 'Traditional Artistry Meets Modern Style',
    image: '/images/hero-2.jpg',
    cta: {
      text: 'Explore Collections',
      link: '/categories',
    },
  },
  {
    id: 3,
    title: 'Wedding Special Collection',
    subtitle: 'Make Your Special Day Memorable',
    image: '/images/hero-3.jpg',
    cta: {
      text: 'View Wedding Collection',
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
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-maroon via-indian-red to-saffron">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image with Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-maroon/60 via-indian-red/60 to-saffron/60">
              {/* Pattern overlay */}
              <div className="absolute inset-0 pattern-bg opacity-20"></div>

              {/* Decorative elements */}
              <div className="absolute top-20 right-20 w-64 h-64 bg-golden/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 left-20 w-80 h-80 bg-saffron/10 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Subtitle */}
                {slide.subtitle && (
                  <div className="mb-4 animate-fade-in">
                    <span className="bg-golden text-maroon px-6 py-2 rounded-full text-sm md:text-base font-semibold inline-block">
                      {slide.subtitle}
                    </span>
                  </div>
                )}

                {/* Main Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg animate-fade-in-up">
                  {slide.title}
                </h1>

                {/* CTA Button */}
                {slide.cta && (
                  <div className="animate-fade-in-up-delay">
                    <Link
                      href={slide.cta.link}
                      className="inline-block bg-white text-maroon px-8 py-4 rounded-lg font-semibold text-lg hover:bg-golden hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      {slide.cta.text}
                    </Link>
                  </div>
                )}
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
