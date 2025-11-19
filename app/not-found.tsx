import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-silk-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-3xl font-bold text-maroon mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block bg-maroon text-white px-8 py-3 rounded-lg font-bold hover:bg-saffron transition-colors shadow-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
