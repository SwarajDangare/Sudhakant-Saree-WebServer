/**
 * MSG91 SMS Integration for Phone OTP
 * Documentation: https://docs.msg91.com/p/tf9GTextN/e/Oq4CFw-F/MSG91
 */

interface SendOTPResponse {
  type: string;
  message: string;
}

interface VerifyOTPResponse {
  type: string;
  message: string;
}

/**
 * Send OTP via SMS using MSG91
 * @param phoneNumber - Phone number with country code (e.g., "919876543210")
 * @param otp - 6-digit OTP code
 * @returns Promise with response from MSG91
 */
export async function sendSMSOTP(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;
    const senderId = process.env.MSG91_SENDER_ID || 'SDHKNT';
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey) {
      throw new Error('MSG91_AUTH_KEY not configured');
    }

    if (!templateId) {
      throw new Error('MSG91_TEMPLATE_ID not configured');
    }

    // MSG91 Send OTP API endpoint
    const url = `https://control.msg91.com/api/v5/otp`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: phoneNumber,
        authkey: authKey,
        otp: otp,
        // Optional: Customize message variables
        // Variables in template: ##OTP## will be replaced
        otp_expiry: '2', // 2 minutes
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MSG91 API Error:', errorText);
      throw new Error(`MSG91 API failed: ${response.status}`);
    }

    const data: SendOTPResponse = await response.json();

    return {
      success: data.type === 'success',
      message: data.message || 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Verify OTP via MSG91 (Optional - if using MSG91's verification endpoint)
 * Note: We'll use our own verification logic with otpStore instead
 * This is kept for reference if you want to use MSG91's verification
 */
export async function verifySMSOTP(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    const authKey = process.env.MSG91_AUTH_KEY;

    if (!authKey) {
      throw new Error('MSG91_AUTH_KEY not configured');
    }

    const url = `https://control.msg91.com/api/v5/otp/verify`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey,
      },
      body: JSON.stringify({
        authkey: authKey,
        mobile: phoneNumber,
        otp: otp,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MSG91 Verify Error:', errorText);
      throw new Error(`MSG91 Verify failed: ${response.status}`);
    }

    const data: VerifyOTPResponse = await response.json();

    return {
      success: data.type === 'success',
      message: data.message || 'OTP verified successfully',
    };
  } catch (error) {
    console.error('Error verifying SMS OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}
