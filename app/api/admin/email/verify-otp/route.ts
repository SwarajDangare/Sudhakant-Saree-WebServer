import { NextRequest, NextResponse } from 'next/server';
import { db, emailOtps } from '@/db';
import { eq, and, gt } from 'drizzle-orm';

/**
 * POST /api/admin/email/verify-otp
 * Verify OTP for email address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const [otpRecord] = await db
      .select()
      .from(emailOtps)
      .where(
        and(
          eq(emailOtps.email, email),
          eq(emailOtps.otp, otp),
          eq(emailOtps.verified, false),
          gt(emailOtps.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await db
      .update(emailOtps)
      .set({ verified: true })
      .where(eq(emailOtps.id, otpRecord.id));

    return NextResponse.json({
      message: 'Email verified successfully',
      verified: true,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
