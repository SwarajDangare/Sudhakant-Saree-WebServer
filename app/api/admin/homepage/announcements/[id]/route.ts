import { NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT update announcement
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { text, highlightText, linkUrl, displayOrder, isActive } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({
        text,
        highlightText: highlightText || null,
        linkUrl: linkUrl || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, params.id))
      .returning();

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAnnouncement);
  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE announcement
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(announcements).where(eq(announcements.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}
