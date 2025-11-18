'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [countdown, setCountdown] = useState(3);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setRedirecting(true);
          router.push('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center py-12 px-4 relative">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-300 rounded-full opacity-30 animate-ping" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-400 rounded-full opacity-40 animate-ping" style={{ animationDuration: '1s' }}></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative z-10">
        {/* Animated Success Icon */}
        <div className="mb-6 relative">
          {/* Outer circle with scale animation */}
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-scale-in shadow-lg">
            {/* Inner white circle */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              {/* Animated checkmark */}
              <svg
                className="w-12 h-12 text-green-600 animate-check-draw"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-float-up opacity-0" style={{ animationDelay: '0.1s' }}></div>
            <div className="absolute top-0 right-1/4 w-2 h-2 bg-green-400 rounded-full animate-float-up opacity-0" style={{ animationDelay: '0.2s' }}></div>
            <div className="absolute top-1/4 left-0 w-2 h-2 bg-green-400 rounded-full animate-float-up opacity-0" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-1/4 right-0 w-2 h-2 bg-green-400 rounded-full animate-float-up opacity-0" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-2 animate-fade-in-up">
          Payment Received!
        </h1>
        <p className="text-xl font-semibold text-gray-800 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Order Placed Successfully
        </p>
        <p className="text-gray-600 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Thank you for your order. We&apos;ll start preparing it right away!
        </p>

        <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-gray-600 mb-1">Order ID</p>
          <p className="font-mono font-bold text-green-700 text-lg">{orderId}</p>
        </div>

        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link
            href="/orders"
            className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-md"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="block w-full border-2 border-green-600 text-green-600 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-all"
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

      {/* Countdown Timer at Bottom */}
      {!redirecting && countdown > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in">
          <p className="text-sm font-medium">
            Redirecting to My Orders in {countdown} second{countdown !== 1 ? 's' : ''}...
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes check-draw {
          0% {
            stroke-dasharray: 0 100;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dasharray: 100 100;
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        .animate-check-draw {
          animation: check-draw 0.8s ease-out 0.3s forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-float-up {
          animation: float-up 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
