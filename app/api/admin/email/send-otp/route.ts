import { NextRequest, NextResponse } from 'next/server';
import { db, emailOtps } from '@/db';
import { eq, and, gt } from 'drizzle-orm';

/**
 * POST /api/admin/email/send-otp
 * Send OTP to email address for verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing unverified OTPs for this email
    await db
      .delete(emailOtps)
      .where(
        and(
          eq(emailOtps.email, email),
          eq(emailOtps.verified, false)
        )
      );

    // Store OTP in database
    const [newOtp] = await db
      .insert(emailOtps)
      .values({
        email,
        otp,
        expiresAt,
        verified: false,
      })
      .returning();

    // TODO: In production, send actual email using a service like SendGrid, AWS SES, or Resend
    // For now, we'll log it to console for development
    console.log('='.repeat(50));
    console.log(`📧 Email OTP for ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires at: ${expiresAt.toLocaleString()}`);
    console.log('='.repeat(50));

    // In development, also return the OTP for easier testing
    // REMOVE THIS IN PRODUCTION!
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: 'OTP sent successfully',
        // For development only - remove in production
        _dev_otp: otp,
      });
    }

    return NextResponse.json({
      message: 'OTP sent to your email address',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
