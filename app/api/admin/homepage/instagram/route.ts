import { NextResponse } from 'next/server';
import { db } from '@/db';
import { instagramPosts, instagramSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all Instagram posts and settings
export async function GET() {
  try {
    const posts = await db
      .select()
      .from(instagramPosts)
      .orderBy(instagramPosts.displayOrder);

    const [settings] = await db.select().from(instagramSettings).limit(1);

    return NextResponse.json({
      posts,
      settings: settings || {
        instagramHandle: '@sudhakantsarees',
        profileUrl: 'https://instagram.com/sudhakantsarees',
        autoSync: false,
        maxPosts: 6,
      },
    });
  } catch (error: any) {
    console.error('Error fetching Instagram data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Instagram data' },
      { status: 500 }
    );
  }
}

// POST create new Instagram post
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, imagePublicId, postUrl, caption, displayOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const [newPost] = await db
      .insert(instagramPosts)
      .values({
        id: crypto.randomUUID(),
        imageUrl,
        imagePublicId: imagePublicId || '',
        postUrl: postUrl || null,
        caption: caption || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Instagram post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Instagram post' },
      { status: 500 }
    );
  }
}

// PUT update Instagram settings
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { instagramHandle, profileUrl, autoSync, maxPosts } = body;

    // Check if settings exist
    const [existing] = await db.select().from(instagramSettings).limit(1);

    let updatedSettings;

    if (existing) {
      [updatedSettings] = await db
        .update(instagramSettings)
        .set({
          instagramHandle: instagramHandle || '@sudhakantsarees',
          profileUrl: profileUrl || 'https://instagram.com/sudhakantsarees',
          autoSync: autoSync !== undefined ? autoSync : false,
          maxPosts: maxPosts || 6,
        })
        .returning();
    } else {
      [updatedSettings] = await db
        .insert(instagramSettings)
        .values({
          id: crypto.randomUUID(),
          instagramHandle: instagramHandle || '@sudhakantsarees',
          profileUrl: profileUrl || 'https://instagram.com/sudhakantsarees',
          autoSync: autoSync !== undefined ? autoSync : false,
          maxPosts: maxPosts || 6,
        })
        .returning();
    }

    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error('Error updating Instagram settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update Instagram settings' },
      { status: 500 }
    );
  }
}
