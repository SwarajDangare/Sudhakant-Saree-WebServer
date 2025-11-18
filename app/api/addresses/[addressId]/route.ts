import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, addresses } from '@/db';
import { eq, and } from 'drizzle-orm';

// PATCH - Update address
export async function PATCH(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // If setting as default, unset other default addresses
    if (body.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.customerId, session.user.id));
    }

    const [updatedAddress] = await db
      .update(addresses)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(addresses.id, params.addressId),
          eq(addresses.customerId, session.user.id)
        )
      )
      .returning();

    if (!updatedAddress) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE - Remove address
export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(customerAuthOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await db
      .delete(addresses)
      .where(
        and(
          eq(addresses.id, params.addressId),
          eq(addresses.customerId, session.user.id)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
