import AdminSessionProvider from '@/components/AdminSessionProvider';

// Force all admin pages to be dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminSessionProvider>{children}</AdminSessionProvider>;
}
