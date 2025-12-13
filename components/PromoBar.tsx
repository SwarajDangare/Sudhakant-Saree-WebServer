'use client';

import { useState, useEffect } from 'react';

interface Announcement {
  id: string;
  text: string;
  highlightText: string | null;
}

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements from database
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/homepage/announcements');
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Handle scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setIsScrolled(true);
      } else {
        // Scrolling up
        setIsScrolled(false);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate announcements every 4 seconds
  useEffect(() => {
    if (!isVisible || announcements.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, announcements.length]);

  // Don't render if closed, loading, or no announcements
  if (!isVisible || loading || announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={`relative bg-maroon/80 text-white text-center py-2.5 px-4 text-sm overflow-hidden transition-transform duration-300 ${isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
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
          {currentAnnouncement.highlightText && (
            <span className="font-bold text-golden">{currentAnnouncement.highlightText}</span>
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
