/**
 * 2Factor SMS Integration for Phone OTP
 * Documentation: https://2factor.in/docs
 * Free tier: 10 SMS/day | Paid: ~₹0.15-0.20 per SMS
 */

interface SendOTPResponse {
  Status: string;
  Details: string;
  OTP?: string; // Only in test mode
  SessionId?: string;
}

interface VerifyOTPResponse {
  Status: string;
  Details: string;
}

/**
 * Send OTP via SMS using 2Factor
 * @param phoneNumber - 10-digit phone number (without country code)
 * @param otp - 6-digit OTP code
 * @returns Promise with response from 2Factor
 */
export async function sendSMSOTP(
  phoneNumber: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      throw new Error('TWOFACTOR_API_KEY not configured');
    }

    // 2Factor OTP Send API
    // Uses their template: "Your verification code is XXXX"
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${phoneNumber}/${otp}/SDHKNT`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('2Factor API Error:', errorText);
      throw new Error(`2Factor API failed: ${response.status}`);
    }

    const data: SendOTPResponse = await response.json();

    // Check response status
    if (data.Status === 'Success') {
      return {
        success: true,
        message: data.Details || 'OTP sent successfully',
      };
    } else {
      return {
        success: false,
        message: data.Details || 'Failed to send OTP',
      };
    }
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Alternative: Send OTP with custom message
 * @param phoneNumber - 10-digit phone number
 * @param otp - 6-digit OTP code
 * @param message - Custom message with OTP
 */
export async function sendCustomSMS(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      throw new Error('TWOFACTOR_API_KEY not configured');
    }

    // Send custom SMS
    const url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/SEND/TSMS`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: 'SDHKNT',
        To: phoneNumber,
        Msg: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('2Factor SMS Error:', errorText);
      throw new Error(`2Factor SMS failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: data.Status === 'Success',
      message: data.Details || 'SMS sent successfully',
    };
  } catch (error) {
    console.error('Error sending custom SMS:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}
