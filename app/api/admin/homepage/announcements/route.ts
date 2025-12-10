import { NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET all announcements
export async function GET() {
  try {
    const allAnnouncements = await db
      .select()
      .from(announcements)
      .orderBy(announcements.displayOrder);

    return NextResponse.json(allAnnouncements);
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST create new announcement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, highlightText, linkUrl, displayOrder, isActive } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        id: crypto.randomUUID(),
        text,
        highlightText: highlightText || null,
        linkUrl: linkUrl || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
