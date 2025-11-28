// Simple in-memory OTP storage (for production, use Redis or database)
interface OTPEntry {
  otp: string;
  identifier: string; // email or phone number
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
 * Generate a random 6-digit OTP and store it
 * @param identifier - Email or phone number
 * @returns The generated OTP
 */
export function generateOTP(identifier: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();

  otpStore.set(identifier.toLowerCase(), {
    otp,
    identifier: identifier.toLowerCase(),
    expiresAt: now + 2 * 60 * 1000, // 2 minutes
    createdAt: now,
  });

  return otp;
}

/**
 * Store OTP for an identifier (email or phone number)
 * @deprecated Use generateOTP instead
 */
export function storeOTP(identifier: string, otp: string): void {
  const now = Date.now();
  otpStore.set(identifier.toLowerCase(), {
    otp,
    identifier: identifier.toLowerCase(),
    expiresAt: now + 2 * 60 * 1000, // 2 minutes
    createdAt: now,
  });
}

/**
 * Verify OTP for an identifier (email or phone number)
 */
export function verifyOTP(identifier: string, otp: string): boolean {
  const entry = otpStore.get(identifier.toLowerCase());

  if (!entry) {
    return false;
  }

  const now = Date.now();

  // Check if OTP is expired
  if (now > entry.expiresAt) {
    otpStore.delete(identifier.toLowerCase());
    return false;
  }

  // Check if OTP matches
  if (entry.otp === otp) {
    // Delete OTP after successful verification
    otpStore.delete(identifier.toLowerCase());
    return true;
  }

  return false;
}

/**
 * Check if OTP exists and is not expired
 */
export function hasValidOTP(identifier: string): boolean {
  const entry = otpStore.get(identifier.toLowerCase());

  if (!entry) {
    return false;
  }

  const now = Date.now();
  return now <= entry.expiresAt;
}

/**
 * Get remaining time for OTP in seconds
 */
export function getOTPRemainingTime(identifier: string): number {
  const entry = otpStore.get(identifier.toLowerCase());

  if (!entry) {
    return 0;
  }

  const now = Date.now();
  const remaining = Math.max(0, Math.floor((entry.expiresAt - now) / 1000));
  return remaining;
}

/**
 * Check rate limit for OTP requests
 * Returns whether the request is allowed and remaining seconds if not
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remainingSeconds: number } {
  const entry = otpStore.get(identifier.toLowerCase());

  if (!entry) {
    // No OTP exists, allow request
    return { allowed: true, remainingSeconds: 0 };
  }

  const now = Date.now();
  const remaining = Math.max(0, Math.ceil((entry.expiresAt - now) / 1000));

  if (remaining > 0) {
    // OTP still valid, rate limit applies
    return { allowed: false, remainingSeconds: remaining };
  }

  // OTP expired, allow new request
  return { allowed: true, remainingSeconds: 0 };
}

/**
 * Delete OTP for an identifier
 */
export function deleteOTP(identifier: string): void {
  otpStore.delete(identifier.toLowerCase());
}
