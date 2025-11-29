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
 * Send OTP via SMS using 2Factor AUTOGEN (recommended)
 * AUTOGEN automatically generates a 4 or 6 digit OTP
 * @param phoneNumber - 10-digit phone number (without country code)
 * @param method - Delivery method: 'SMS' or 'CALL' (default from env)
 * @returns Promise with session ID for verification
 */
export async function sendSMSOTP(
  phoneNumber: string,
  otp: string,
  method?: DeliveryMethod
): Promise<{ success: boolean; message: string; sessionId?: string }> {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      throw new Error('TWOFACTOR_API_KEY not configured');
    }

    // Get delivery method from parameter or environment variable
    const deliveryMethod = method || (process.env.OTP_DELIVERY_METHOD as DeliveryMethod) || 'SMS';

    console.log('🔔 OTP Delivery Method:', deliveryMethod);
    console.log('📞 Phone Number:', phoneNumber);
    console.log('🔢 Using AUTOGEN (2Factor generates OTP)');

    let url: string;

    if (deliveryMethod === 'CALL') {
      // 2Factor Voice Call API with AUTOGEN
      url = `https://2factor.in/API/V1/${apiKey}/ADDON_SERVICES/VOICE/AUTOGEN/${phoneNumber}`;
    } else {
      // 2Factor SMS API with AUTOGEN (recommended)
      // This auto-generates 4 or 6 digit OTP and sends via SMS
      url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${phoneNumber}/AUTOGEN`;
    }

    console.log('🌐 API URL:', url);
    console.log('🔧 HTTP Method: GET');

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('2Factor API Error:', errorText);
      throw new Error(`2Factor API failed: ${response.status}`);
    }

    const data: SendOTPResponse = await response.json();

    console.log('📨 2Factor Response:', JSON.stringify(data));

    // Check response status
    if (data.Status === 'Success') {
      const deliveryType = deliveryMethod === 'CALL' ? 'voice call' : 'SMS';
      return {
        success: true,
        message: data.Details || `OTP sent successfully via ${deliveryType}`,
        sessionId: data.Details, // 2Factor returns session ID in Details field
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
 * Verify OTP using 2Factor's verification endpoint
 * @param sessionId - Session ID returned from sendSMSOTP
 * @param otp - OTP entered by user
 * @returns Promise with verification result
 */
export async function verify2FactorOTP(
  sessionId: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    const apiKey = process.env.TWOFACTOR_API_KEY;

    if (!apiKey) {
      throw new Error('TWOFACTOR_API_KEY not configured');
    }

    // 2Factor OTP Verification endpoint
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;

    console.log('🔍 Verifying OTP with 2Factor');
    console.log('🔑 Session ID:', sessionId);
    console.log('🔢 OTP:', otp);

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('2Factor Verify Error:', errorText);
      throw new Error(`2Factor Verify failed: ${response.status}`);
    }

    const data: VerifyOTPResponse = await response.json();

    console.log('✅ Verification Response:', JSON.stringify(data));

    return {
      success: data.Status === 'Success',
      message: data.Details || (data.Status === 'Success' ? 'OTP verified successfully' : 'Invalid OTP'),
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify OTP',
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
