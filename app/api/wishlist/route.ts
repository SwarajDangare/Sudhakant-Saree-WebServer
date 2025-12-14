import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, wishlistItems, products, productColors, colorImages } from '@/db';
import { eq, and } from 'drizzle-orm';

// GET /api/wishlist - Fetch all wishlist items for authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(customerAuthOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch wishlist items with product details
        const items = await db
            .select({
                id: wishlistItems.id,
                productId: wishlistItems.productId,
                createdAt: wishlistItems.createdAt,
                product: products,
            })
            .from(wishlistItems)
            .innerJoin(products, eq(wishlistItems.productId, products.id))
            .where(eq(wishlistItems.customerId, session.user.id))
            .orderBy(wishlistItems.createdAt);

        // Fetch colors for each product
        const itemsWithColors = await Promise.all(
            items.map(async (item) => {
                const colors = await db
                    .select({
                        id: productColors.id,
                        color: productColors.color,
                        colorCode: productColors.colorCode,
                        inStock: productColors.inStock,
                    })
                    .from(productColors)
                    .where(eq(productColors.productId, item.product.id));

                // Fetch images for each color
                const colorsWithImages = await Promise.all(
                    colors.map(async (color) => {
                        const images = await db
                            .select()
                            .from(colorImages)
                            .where(eq(colorImages.productColorId, color.id))
                            .orderBy(colorImages.displayOrder);

                        return {
                            ...color,
                            images,
                        };
                    })
                );

                return {
                    id: item.id,
                    productId: item.productId,
                    createdAt: item.createdAt,
                    product: {
                        ...item.product,
                        colors: colorsWithImages,
                    },
                };
            })
        );

        return NextResponse.json({ items: itemsWithColors });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wishlist' },
            { status: 500 }
        );
    }
}

// POST /api/wishlist - Add item to wishlist (with sync support)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(customerAuthOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, productIds } = body;

        // Support both single product and bulk sync
        const idsToAdd = productIds || (productId ? [productId] : []);

        if (idsToAdd.length === 0) {
            return NextResponse.json(
                { error: 'Product ID(s) required' },
                { status: 400 }
            );
        }

        // Verify all products exist
        const existingProducts = await db
            .select({ id: products.id })
            .from(products)
            .where(eq(products.active, true));

        const existingProductIds = new Set(existingProducts.map(p => p.id));
        const validIds = idsToAdd.filter((id: string) => existingProductIds.has(id));

        if (validIds.length === 0) {
            return NextResponse.json(
                { error: 'No valid products found' },
                { status: 404 }
            );
        }

        // Get existing wishlist items for this customer
        const existing = await db
            .select({ productId: wishlistItems.productId })
            .from(wishlistItems)
            .where(eq(wishlistItems.customerId, session.user.id));

        const existingProductIdsSet = new Set(existing.map(item => item.productId));

        // Filter out products already in wishlist
        const newIds = validIds.filter((id: string) => !existingProductIdsSet.has(id));

        if (newIds.length === 0) {
            return NextResponse.json({
                message: 'All products already in wishlist',
                added: 0,
            });
        }

        // Add new items to wishlist
        const newItems = newIds.map((id: string) => ({
            customerId: session.user.id,
            productId: id,
        }));

        await db.insert(wishlistItems).values(newItems);

        return NextResponse.json({
            message: `Added ${newIds.length} item(s) to wishlist`,
            added: newIds.length,
        });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(customerAuthOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID required' },
                { status: 400 }
            );
        }

        // Delete the wishlist item
        const result = await db
            .delete(wishlistItems)
            .where(
                and(
                    eq(wishlistItems.customerId, session.user.id),
                    eq(wishlistItems.productId, productId)
                )
            )
            .returning();

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Item not found in wishlist' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Removed from wishlist',
        });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}
