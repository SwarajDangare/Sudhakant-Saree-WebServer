import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { customerAuthOptions } from '@/lib/customer-auth';
import { db, addresses } from '@/db';
import { eq, and, ne } from 'drizzle-orm';

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

    // Get all customer addresses to enforce default rule
    const allAddresses = await db
      .select()
      .from(addresses)
      .where(eq(addresses.customerId, session.user.id));

    // If trying to unset default and this is the only address, prevent it
    if (body.isDefault === false && allAddresses.length === 1) {
      return NextResponse.json(
        { error: 'You must have at least one default address' },
        { status: 400 }
      );
    }

    // If setting as default, unset other default addresses
    if (body.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.customerId, session.user.id));
    }

    // If unsetting default, assign it to another address
    if (body.isDefault === false) {
      const [currentAddress] = allAddresses.filter(addr => addr.id === params.addressId);
      if (currentAddress?.isDefault) {
        // Find another address to make default
        const [otherAddress] = allAddresses.filter(addr => addr.id !== params.addressId);
        if (otherAddress) {
          await db
            .update(addresses)
            .set({ isDefault: true })
            .where(eq(addresses.id, otherAddress.id));
        }
      }
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

    // Get the address being deleted
    const [addressToDelete] = await db
      .select()
      .from(addresses)
      .where(
        and(
          eq(addresses.id, params.addressId),
          eq(addresses.customerId, session.user.id)
        )
      )
      .limit(1);

    if (!addressToDelete) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // If deleting default address, assign default to another address first
    if (addressToDelete.isDefault) {
      const [anotherAddress] = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.customerId, session.user.id),
            ne(addresses.id, params.addressId)
          )
        )
        .limit(1);

      if (anotherAddress) {
        await db
          .update(addresses)
          .set({ isDefault: true })
          .where(eq(addresses.id, anotherAddress.id));
      }
    }

    // Now delete the address
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
