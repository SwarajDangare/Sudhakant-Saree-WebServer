import AdminSessionProvider from '@/components/AdminSessionProvider';
import AdminLayout from '@/components/admin/AdminLayout';

// Force all admin pages to be dynamic - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminSessionProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminSessionProvider>
  );
}
