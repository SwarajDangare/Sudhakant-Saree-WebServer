'use client';

import { usePathname } from 'next/navigation';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomepage = pathname === '/';

  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}
