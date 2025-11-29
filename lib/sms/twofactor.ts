/**
 * 2Factor Integration for Phone OTP (SMS & Voice Call)
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

type DeliveryMethod = 'SMS' | 'CALL';

/**
 * Send OTP via SMS or Voice Call using 2Factor
 * @param phoneNumber - 10-digit phone number (without country code)
 * @param otp - 6-digit OTP code
 * @param method - Delivery method: 'SMS' or 'CALL' (default from env)
 * @returns Promise with response from 2Factor
 */
export async function sendSMSOTP(
  phoneNumber: string,
  otp: string,
  method?: DeliveryMethod
): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      throw new Error('TWOFACTOR_API_KEY not configured');
    }

    // Get delivery method from parameter or environment variable
    const deliveryMethod = method || (process.env.OTP_DELIVERY_METHOD as DeliveryMethod) || 'SMS';

    console.log('🔔 OTP Delivery Method:', deliveryMethod);
    console.log('📞 Phone Number:', phoneNumber);
    console.log('🔢 OTP:', otp);

    let url: string;

    if (deliveryMethod === 'CALL') {
      // 2Factor Voice Call API
      // Sends OTP via automated voice call
      url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/VOICE/CALL/${phoneNumber}/${otp}`;
    } else {
      // 2Factor SMS API
      // Try with +91 country code prefix
      url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${phoneNumber}/${otp}`;
    }

    console.log('🌐 API URL:', url);
    console.log('🔧 HTTP Method: GET');

    const response = await fetch(url, {
      method: 'GET',  // Try GET method
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('2Factor API Error:', errorText);
      throw new Error(`2Factor API failed: ${response.status}`);
    }

    const data: SendOTPResponse = await response.json();

    // Check response status
    if (data.Status === 'Success') {
      const deliveryType = deliveryMethod === 'CALL' ? 'voice call' : 'SMS';
      return {
        success: true,
        message: data.Details || `OTP sent successfully via ${deliveryType}`,
      };
    } else {
      return {
        success: false,
        message: data.Details || 'Failed to send OTP',
      };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
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
