import { NextResponse } from 'next/server';
import { db } from '@/db';
import { homepageSections } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Toggle section visibility
export async function PATCH(request: Request) {
  try {
    const { sectionKey, isActive } = await request.json();

    if (!sectionKey) {
      return NextResponse.json(
        { error: 'Section key is required' },
        { status: 400 }
      );
    }

    // Update the section
    await db
      .update(homepageSections)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(homepageSections.sectionKey, sectionKey));

    return NextResponse.json({
      success: true,
      message: 'Section visibility updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update section' },
      { status: 500 }
    );
  }
}
