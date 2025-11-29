import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, getSessionId } from '@/lib/otp/otpStore';
import { verify2FactorOTP } from '@/lib/sms/twofactor';

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

    // Get session ID for 2Factor verification
    const sessionId = getSessionId(phoneNumber);

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No OTP session found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP with 2Factor
    const result = await verify2FactorOTP(sessionId, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || 'Invalid or expired OTP' },
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
