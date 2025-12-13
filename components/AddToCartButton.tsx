'use client';

interface AddToCartButtonProps {
  productId: string; // Changed to string to support UUID from database
  productName: string;
}

export default function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add to cart logic will be implemented in Phase 2
    console.log(`Adding ${productName} (ID: ${productId}) to cart`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-10 h-10 rounded-full bg-cream hover:bg-maroon text-maroon hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110"
      aria-label="Add to cart"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </button>
  );
}
