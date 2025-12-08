import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, sections, categories, products, productColors, productImages, colorImages, orderItems } from '@/db';
import { eq } from 'drizzle-orm';
import { requirePermission, requireAnyPermission, getPermissionErrorMessage } from '@/lib/permission-guards';
import { getServerPermissions } from '@/lib/server-permissions';

export const dynamic = 'force-dynamic';

// GET - Fetch a single section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has permission to view sections
    const permissionError = requireAnyPermission(
      session,
      ['canAddSections', 'canEditSections', 'canDeleteSections'],
      'You do not have permission to access sections.'
    );
    if (permissionError) {
      return permissionError;
    }

    const [section] = await db
      .select()
      .from(sections)
      .where(eq(sections.id, params.id))
      .limit(1);

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section' },
      { status: 500 }
    );
  }
}

// PUT - Update a section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user has permission to edit sections
    const permissionError = requirePermission(
      session,
      'canEditSections',
      getPermissionErrorMessage('canEditSections')
    );
    if (permissionError) {
      return permissionError;
    }

    const body = await request.json();
    const { name, slug, description, order, active } = body;

    console.log('Updating section:', params.id, body);

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Update the section
    const [updatedSection] = await db
      .update(sections)
      .set({
        name,
        slug,
        description: description || null,
        order: order || 0,
        active: active ?? true,
        updatedAt: new Date(),
      })
      .where(eq(sections.id, params.id))
      .returning();

    if (!updatedSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    console.log('Section updated successfully:', updatedSection);

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);

    // Check for unique constraint violation on slug
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'A section with this slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete sections using new system
    const permissions = await getServerPermissions();
    if (!permissions.canDeleteSections) {
      return NextResponse.json(
        { error: 'You do not have permission to delete sections' },
        { status: 403 }
      );
    }

    console.log('Deleting section:', params.id);

    // Find all categories in this section
    const categoriesInSection = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.sectionId, params.id));

    const categoryIds = categoriesInSection.map(c => c.id);

    // Find all products in these categories
    if (categoryIds.length > 0) {
      const productsInCategories = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.categoryId, categoryIds[0])); // Start with first category

      // Get all products from all categories
      let allProducts: Array<{ id: string }> = [];
      for (const categoryId of categoryIds) {
        const prods = await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.categoryId, categoryId));
        allProducts.push(...prods);
      }

      const productIds = allProducts.map(p => p.id);

      // Delete in correct order to respect foreign key constraints:
      // 1. Delete orderItems that reference these products
      if (productIds.length > 0) {
        for (const productId of productIds) {
          await db.delete(orderItems).where(eq(orderItems.productId, productId));
        }

        // 2. Delete color images for these products
        for (const productId of productIds) {
          const colors = await db
            .select({ id: productColors.id })
            .from(productColors)
            .where(eq(productColors.productId, productId));

          for (const color of colors) {
            await db.delete(colorImages).where(eq(colorImages.productColorId, color.id));
          }
        }

        // 3. Delete product colors
        for (const productId of productIds) {
          await db.delete(productColors).where(eq(productColors.productId, productId));
        }

        // 4. Delete product images
        for (const productId of productIds) {
          await db.delete(productImages).where(eq(productImages.productId, productId));
        }

        // 5. Delete products (this will now succeed)
        for (const productId of productIds) {
          await db.delete(products).where(eq(products.id, productId));
        }
      }

      // 6. Delete categories
      for (const categoryId of categoryIds) {
        await db.delete(categories).where(eq(categories.id, categoryId));
      }
    }

    // 7. Finally, delete the section
    const [deletedSection] = await db
      .delete(sections)
      .where(eq(sections.id, params.id))
      .returning();

    if (!deletedSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    console.log('Section deleted successfully:', deletedSection);

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);

    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
