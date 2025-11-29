import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, checkRateLimit } from '@/lib/otp/otpStore';
import { sendSMSOTP } from '@/lib/sms/twofactor';

export const dynamic = 'force-dynamic';

/**
 * POST /api/phone/send-otp
 * Send OTP to phone number for verification
 */
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

    // Validate phone number format (should be 10 digits for India)
    if (!/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Must be 10 digits.' },
        { status: 400 }
      );
    }

    // Check if OTP verification is enabled
    const otpEnabled = process.env.OTP_ENABLED !== 'false';

    if (!otpEnabled) {
      // OTP verification disabled (testing mode) - skip sending
      return NextResponse.json({
        success: true,
        message: 'OTP verification disabled (testing mode)',
      });
    }

    // Check rate limit (prevent spam)
    const rateLimit = checkRateLimit(phoneNumber);
    if (!rateLimit.allowed) {
      const minutes = Math.floor(rateLimit.remainingSeconds / 60);
      const seconds = rateLimit.remainingSeconds % 60;
      const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      return NextResponse.json(
        {
          error: `Please wait ${timeString} before requesting a new OTP`,
          remainingSeconds: rateLimit.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP(phoneNumber);

    // Send OTP via 2Factor (no country code needed - it's for India by default)
    const result = await sendSMSOTP(phoneNumber, otp);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your phone number',
    });
  } catch (error) {
    console.error('Error sending phone OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
