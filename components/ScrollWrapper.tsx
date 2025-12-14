'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ScrollWrapperProps {
  children: ReactNode;
}

export default function ScrollWrapper({ children }: ScrollWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
    <div className={`transition-transform duration-300 ${isScrolled ? '-translate-y-full' : 'translate-y-0'}`}>
      {children}
    </div>
  );
}
