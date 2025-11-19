import { NextRequest, NextResponse } from 'next/server';
import { db, customers } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if customer exists with this phone number
    const [existingCustomer] = await db
      .select()
      .from(customers)
      .where(eq(customers.phoneNumber, phoneNumber))
      .limit(1);

    return NextResponse.json({
      exists: !!existingCustomer,
    });
  } catch (error) {
    console.error('Error checking phone number:', error);
    return NextResponse.json(
      { error: 'Failed to check phone number' },
      { status: 500 }
    );
  }
}
