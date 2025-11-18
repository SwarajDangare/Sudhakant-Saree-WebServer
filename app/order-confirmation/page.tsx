'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!orderId) {
      router.push('/');
    }
    // You could fetch the order details here if needed
    // For now, we'll just show a success message
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-maroon via-indian-red to-saffron flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-maroon mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We&apos;ll send you a confirmation shortly.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="font-mono font-semibold text-gray-800">{orderId}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full btn-primary py-3 rounded-md font-semibold"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-maroon text-maroon py-3 rounded-md font-semibold hover:bg-maroon hover:text-white transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            We&apos;ve sent an order confirmation to your phone number.
          </p>
        </div>
      </div>
    </div>
  );
}
