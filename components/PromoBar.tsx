'use client';

import { useState, useEffect } from 'react';

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Multiple announcements that rotate
  const announcements = [
    {
      id: 1,
      text: '🎉 FLAT 10% OFF on your first order | Use code',
      highlight: 'WELCOME10',
    },
    {
      id: 2,
      text: '🚚 FREE Shipping on orders above',
      highlight: '₹999',
    },
    {
      id: 3,
      text: '💰 COD Available | Easy Returns | 100% Authentic',
      highlight: null,
    },
  ];

  // Auto-rotate announcements every 4 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  if (!isVisible) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="relative bg-maroon text-white text-center py-2.5 px-4 text-sm overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer"></div>
      </div>

      {/* Content with fade animation */}
      <div
        key={currentAnnouncement.id}
        className="relative z-10 animate-fade-in font-medium"
      >
        <p className="inline">
          {currentAnnouncement.text}{' '}
          {currentAnnouncement.highlight && (
            <span className="font-bold text-golden">{currentAnnouncement.highlight}</span>
          )}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-golden transition-colors z-20"
        aria-label="Close promotional banner"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Dots indicator */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex gap-1.5 z-20">
        {announcements.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              index === currentIndex ? 'bg-golden w-4' : 'bg-white/50'
            }`}
            aria-label={`Go to announcement ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
