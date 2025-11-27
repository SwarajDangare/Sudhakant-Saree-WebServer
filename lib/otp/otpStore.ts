// Simple in-memory OTP storage (for production, use Redis or database)
interface OTPEntry {
  otp: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

const otpStore = new Map<string, OTPEntry>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  otpStore.forEach((entry, key) => {
    if (now > entry.expiresAt) {
      otpStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP for an email (expires in 10 minutes)
 */
export function storeOTP(email: string, otp: string): void {
  const now = Date.now();
  otpStore.set(email.toLowerCase(), {
    otp,
    email: email.toLowerCase(),
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
    createdAt: now,
  });
}

/**
 * Verify OTP for an email
 */
export function verifyOTP(email: string, otp: string): boolean {
  const entry = otpStore.get(email.toLowerCase());

  if (!entry) {
    return false;
  }

  const now = Date.now();

  // Check if OTP is expired
  if (now > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return false;
  }

  // Check if OTP matches
  if (entry.otp === otp) {
    // Delete OTP after successful verification
    otpStore.delete(email.toLowerCase());
    return true;
  }

  return false;
}

/**
 * Check if OTP exists and is not expired
 */
export function hasValidOTP(email: string): boolean {
  const entry = otpStore.get(email.toLowerCase());

  if (!entry) {
    return false;
  }

  const now = Date.now();
  return now <= entry.expiresAt;
}

/**
 * Get remaining time for OTP in seconds
 */
export function getOTPRemainingTime(email: string): number {
  const entry = otpStore.get(email.toLowerCase());

  if (!entry) {
    return 0;
  }

  const now = Date.now();
  const remaining = Math.max(0, Math.floor((entry.expiresAt - now) / 1000));
  return remaining;
}

/**
 * Delete OTP for an email
 */
export function deleteOTP(email: string): void {
  otpStore.delete(email.toLowerCase());
}
