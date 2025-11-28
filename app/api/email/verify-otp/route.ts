import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp/otpStore';

export const dynamic = 'force-dynamic';

/**
 * POST /api/email/verify-otp
 * Verify OTP for email verification
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

    // Check if OTP verification is disabled (for testing)
    const otpEnabled = process.env.OTP_VERIFICATION_ENABLED !== 'false';
    const testOtp = process.env.TEST_OTP || '123456';

    let isValid = false;

    if (!otpEnabled) {
      // OTP verification disabled - accept test OTP
      isValid = otp === testOtp;
    } else {
      // Normal OTP verification
      isValid = verifyOTP(email, otp);
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
