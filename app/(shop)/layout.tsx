import HeaderClient from '@/components/HeaderClient';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import PromoBar from '@/components/PromoBar';
import ScrollWrapper from '@/components/ScrollWrapper';
import { Providers } from '@/components/Providers';
import { db, sections, categories } from '@/db';
import { eq, and } from 'drizzle-orm';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch sections and their categories from database
  const allSections = await db
    .select()
    .from(sections)
    .where(eq(sections.active, true))
    .orderBy(sections.order, sections.name);

  const sectionsWithCategories = await Promise.all(
    allSections.map(async (section) => {
      const sectionCategories = await db
        .select()
        .from(categories)
        .where(and(
          eq(categories.sectionId, section.id),
          eq(categories.active, true)
        ))
        .orderBy(categories.order, categories.name);

      return {
        ...section,
        categories: sectionCategories,
      };
    })
  );

  return (
    <Providers>
      {/* PromoBar and Header with fixed positioning to overlay on content */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <ScrollWrapper>
          <PromoBar />
          <HeaderClient sectionsWithCategories={sectionsWithCategories} />
        </ScrollWrapper>
      </div>

      {/* Main content - homepage has no top padding (hero starts from top), other pages have padding */}
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
    </Providers>
  );
}
