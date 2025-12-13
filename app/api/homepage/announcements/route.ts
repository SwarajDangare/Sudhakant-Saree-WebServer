import { NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements } from '@/db/schema';
import { and, eq, or, isNull, lte, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch only active announcements within their date range
    const activeAnnouncements = await db
      .select({
        id: announcements.id,
        text: announcements.text,
        highlightText: announcements.highlightText,
      })
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            isNull(announcements.startDate),
            lte(announcements.startDate, new Date())
          ),
          or(
            isNull(announcements.endDate),
            gte(announcements.endDate, new Date())
          )
        )
      )
      .orderBy(announcements.displayOrder);

    return NextResponse.json(activeAnnouncements, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error
  }
}
