'use client';

import { SessionProvider } from 'next-auth/react';

// Admin layout that wraps all admin routes with SessionProvider
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
