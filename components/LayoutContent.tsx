'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Providers } from '@/components/Providers';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin routes have their own layout, don't wrap with Header/Footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Customer routes get Header/Footer and customer SessionProvider
  return (
    <Providers>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </Providers>
  );
}
