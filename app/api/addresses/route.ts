import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, addresses } from '@/db';
import { eq } from 'drizzle-orm';

// GET - Fetch all addresses for customer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.customerId, session.user.id))
      .orderBy(addresses.isDefault, 'desc');

    return NextResponse.json(customerAddresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST - Create new address
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
    const {
      name,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault,
    } = body;

    // Validate required fields
    if (!name || !phoneNumber || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If setting as default, unset other default addresses
    if (isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.customerId, session.user.id));
    }

    const [newAddress] = await db
      .insert(addresses)
      .values({
        customerId: session.user.id,
        name,
        phoneNumber,
        addressLine1,
        addressLine2: addressLine2 || null,
        city,
        state,
        pincode,
        isDefault: isDefault || false,
      })
      .returning();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
