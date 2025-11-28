import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp/otpStore';

export const dynamic = 'force-dynamic';

/**
 * POST /api/phone/verify-otp
 * Verify OTP for phone number verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body;

    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Check if OTP verification is enabled
    const otpEnabled = process.env.OTP_ENABLED !== 'false';

    if (!otpEnabled) {
      // OTP verification disabled (testing mode) - skip verification
      return NextResponse.json({
        success: true,
        message: 'Phone verified successfully (testing mode)',
      });
    }

    // Normal OTP verification (production mode)
    const isValid = verifyOTP(phoneNumber, otp);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
