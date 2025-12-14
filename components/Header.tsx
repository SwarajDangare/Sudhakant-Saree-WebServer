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
        .select({
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        })
        .from(categories)
        .where(and(
          eq(categories.sectionId, section.id),
          eq(categories.active, true)
        ))
        .orderBy(categories.order, categories.name);

      return {
        id: section.id,
        name: section.name,
        slug: section.slug,
        categories: sectionCategories,
      };
    })
  );

  return <HeaderClient sectionsWithCategories={sectionsWithCategories} />;
}
