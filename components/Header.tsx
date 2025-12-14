import Link from 'next/link';
import { db, sections, categories } from '@/db';
import { eq, and } from 'drizzle-orm';
import HeaderClient from './HeaderClient';

export default async function Header() {
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

  return <HeaderClient sectionsWithCategories={sectionsWithCategories} />;
}
