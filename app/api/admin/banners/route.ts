import { NextRequest, NextResponse } from 'next/server';
import { db, homepageBanners } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all banners
export async function GET() {
  try {
    const banners = await db
      .select()
      .from(homepageBanners)
      .orderBy(desc(homepageBanners.displayOrder), homepageBanners.createdAt);

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST create new banner
export async function POST(request: NextRequest) {
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

    // Validation
    if (!title || !imageUrl || !imagePublicId) {
      return NextResponse.json(
        { error: 'Title, image URL, and image public ID are required' },
        { status: 400 }
      );
    }

    const newBanner = await db
      .insert(homepageBanners)
      .values({
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        imagePublicId,
        linkUrl: linkUrl || null,
        linkText: linkText || 'Shop Now',
        displayOrder: displayOrder || 0,
        active: active !== undefined ? active : true,
      })
      .returning();

    return NextResponse.json(newBanner[0], { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
