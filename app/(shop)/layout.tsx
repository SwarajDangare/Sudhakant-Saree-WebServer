import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Providers } from '@/components/Providers';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
