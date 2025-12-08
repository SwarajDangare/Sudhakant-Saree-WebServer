import { NextRequest, NextResponse } from 'next/server';
import { db, homepageBanners } from '@/db';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET single banner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await db
      .select()
      .from(homepageBanners)
      .where(eq(homepageBanners.id, params.id))
      .limit(1);

    if (banner.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(banner[0]);
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

// PUT update banner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      imageUrl,
      imagePublicId,
      linkUrl,
      linkText,
      displayOrder,
      active
    } = body;

    const updatedBanner = await db
      .update(homepageBanners)
      .set({
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        imagePublicId,
        linkUrl: linkUrl || null,
        linkText: linkText || 'Shop Now',
        displayOrder: displayOrder || 0,
        active: active !== undefined ? active : true,
        updatedAt: new Date(),
      })
      .where(eq(homepageBanners.id, params.id))
      .returning();

    if (updatedBanner.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBanner[0]);
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await db
      .delete(homepageBanners)
      .where(eq(homepageBanners.id, params.id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
