import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import MainContentWrapper from '@/components/MainContentWrapper';
import HeaderContainer from '@/components/HeaderContainer';
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
      {/* Dynamic Header/Promo Bar Container */}
      <HeaderContainer sectionsWithCategories={sectionsWithCategories} />

      {/* Main content - homepage has no top padding (hero starts from top), other pages have padding */}
      <MainContentWrapper>
        {children}
      </MainContentWrapper>
      <Footer />
      <WhatsAppFloat />
    </Providers>
  );
}
