import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PromoBar from '@/components/PromoBar';
import ScrollWrapper from '@/components/ScrollWrapper';
import { Providers } from '@/components/Providers';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      {/* PromoBar and Header with fixed positioning to overlay on content */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <ScrollWrapper>
          <PromoBar />
          <Header />
        </ScrollWrapper>
      </div>

      {/* Main content without top padding on homepage, with padding on other pages */}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </Providers>
  );
}
