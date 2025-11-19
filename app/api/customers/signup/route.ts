import { NextRequest, NextResponse } from 'next/server';
import { db, customers, addresses } from '@/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, name, address } = body;

    // Validate required fields
    if (!phoneNumber || !name) {
      return NextResponse.json(
        { error: 'Phone number and name are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const [existingCustomer] = await db
      .select()
      .from(customers)
      .where(eq(customers.phoneNumber, phoneNumber))
      .limit(1);

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Create new customer
    const [newCustomer] = await db
      .insert(customers)
      .values({
        phoneNumber,
        name,
        email: null,
      })
      .returning();

    // If address is provided, create it
    if (address && address.addressLine1 && address.city && address.state && address.pincode) {
      await db
        .insert(addresses)
        .values({
          customerId: newCustomer.id,
          name: address.name || name,
          phoneNumber: address.phoneNumber || phoneNumber,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          isDefault: true, // First address is always default
        });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: newCustomer.id,
        phoneNumber: newCustomer.phoneNumber,
        name: newCustomer.name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
