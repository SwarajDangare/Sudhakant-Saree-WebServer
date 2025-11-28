import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, checkRateLimit } from '@/lib/otp/otpStore';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/email/send-otp
 * Send OTP to email for verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      const minutes = Math.floor(rateLimit.remainingSeconds / 60);
      const seconds = rateLimit.remainingSeconds % 60;
      const timeString = minutes > 0
        ? `${minutes}m ${seconds}s`
        : `${seconds}s`;
      return NextResponse.json(
        {
          error: `Please wait ${timeString} before requesting a new OTP`,
          remainingSeconds: rateLimit.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // Generate and store OTP
    const otp = generateOTP(email);

    // Send OTP email
    const emailResult = await sendOTPEmail(email, name, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 120, // 2 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
