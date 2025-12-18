'use client'

/**
 * Client-side Cart Icon Component
 * Displays cart icon with item counter badge
 */

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function CartIcon() {
  const { itemCount, setIsCartOpen } = useCart()

  return (
    <button 
      onClick={() => setIsCartOpen(true)}
      className="relative p-2 hover:text-[#9d2235] transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute top-0 right-0 bg-[#9d2235] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
          {itemCount > 99 ? '99' : itemCount}
        </span>
      )}
    </button>
  )
}
