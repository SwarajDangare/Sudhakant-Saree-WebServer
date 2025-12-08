import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PromoBar from '@/components/PromoBar';
import { Providers } from '@/components/Providers';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <PromoBar />
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </Providers>
  );
}
