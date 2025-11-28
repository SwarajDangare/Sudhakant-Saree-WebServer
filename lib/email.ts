import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/templates/OrderConfirmation';
import OrderStatusUpdateEmail from '@/emails/templates/OrderStatusUpdate';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'Sudhakant Sarees <orders@sudhakant-sarees.com>';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    productColor: string | null;
    quantity: number;
    price: string;
    subtotal: string;
  }>;
  subtotal: string;
  total: string;
  address: {
    name: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  orderDate: string;
}

export interface OrderStatusEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  statusMessage?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const emailHtml = await render(
      OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        total: data.total,
        address: data.address,
        paymentMethod: data.paymentMethod,
        orderDate: data.orderDate,
        whatsappNumber: WHATSAPP_NUMBER,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: emailHtml,
    });

    console.log('Order confirmation email sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusUpdateEmail(data: OrderStatusEmailData) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const emailHtml = await render(
      OrderStatusUpdateEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        status: data.status,
        statusMessage: data.statusMessage,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery,
        whatsappNumber: WHATSAPP_NUMBER,
      })
    );

    const statusTitles = {
      PENDING: 'Order Received',
      CONFIRMED: 'Order Confirmed',
      PROCESSING: 'Order Processing',
      SHIPPED: 'Order Shipped',
      DELIVERED: 'Order Delivered',
      CANCELLED: 'Order Cancelled',
    };

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `${statusTitles[data.status]} - ${data.orderNumber}`,
      html: emailHtml,
    });

    console.log('Order status update email sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending order status update email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new customer (optional)
 */
export async function sendWelcomeEmail(customerEmail: string, customerName: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    // Simple HTML welcome email (you can create a template later)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #800000 0%, #5C0A0A 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px 20px; }
            .button { display: inline-block; background: #800000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Sudhakant Sarees!</h1>
              <p>Tradition Meets Elegance</p>
            </div>
            <div class="content">
              <h2>Hello ${customerName}!</h2>
              <p>Thank you for creating an account with Sudhakant Sarees. We're thrilled to have you as part of our family!</p>
              <p>Discover our exquisite collection of traditional Indian sarees, each carefully curated to bring elegance and grace to your wardrobe.</p>
              <p>
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" class="button">
                  Browse Our Collection
                </a>
              </p>
              <p>If you have any questions, feel free to reach out to us on WhatsApp at +${WHATSAPP_NUMBER} or reply to this email.</p>
              <p>Happy Shopping!</p>
              <p><strong>The Sudhakant Sarees Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Sudhakant Sarees. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: 'Welcome to Sudhakant Sarees! 🎉',
      html,
    });

    console.log('Welcome email sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(customerEmail: string, customerName: string, otp: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #800000 0%, #5C0A0A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; }
            .otp-box { background: #f8f9fa; border: 2px dashed #800000; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: #800000; letter-spacing: 8px; font-family: monospace; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔐 Email Verification</h1>
              <p style="margin: 10px 0 0 0;">Sudhakant Sarees</p>
            </div>
            <div class="content">
              <h2 style="color: #800000; margin-top: 0;">Hello ${customerName}!</h2>
              <p>Thank you for adding your email address to receive order updates.</p>
              <p>Your One-Time Password (OTP) for email verification is:</p>

              <div class="otp-box">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Valid for 2 minutes</p>
              </div>

              <p style="margin-top: 30px;">Please enter this code to verify your email address and start receiving order updates.</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Our team will never ask for your OTP.
              </div>

              <p>If you didn't request this verification, you can safely ignore this email.</p>

              <p style="margin-top: 30px;">Best regards,<br><strong>The Sudhakant Sarees Team</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Sudhakant Sarees. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `${otp} is your verification code - Sudhakant Sarees`,
      html,
    });

    console.log('OTP email sent:', result);
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
