'use client';

import { useState } from 'react';

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-maroon text-white text-center py-2 px-4 text-sm">
      <p className="font-medium">
        Sign up to get <span className="font-bold">FLAT 10% OFF</span> on your first order.
        Use code <span className="font-bold">WELCOME</span>. T&C apply.
      </p>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-golden transition-colors"
        aria-label="Close promotional banner"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
