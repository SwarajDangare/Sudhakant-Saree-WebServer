import { Resend } from 'resend';
import { render } from '@react-email/render';
import OrderConfirmationEmail from '@/emails/templates/OrderConfirmation';
import OrderStatusUpdateEmail from '@/emails/templates/OrderStatusUpdate';

// Lazy initialization of Resend to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY || 'dummy-key-for-build';
    resend = new Resend(apiKey);
  }
  return resend;
}

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

    const result = await getResendClient().emails.send({
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

    const result = await getResendClient().emails.send({
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
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail(customerEmail: string, customerName: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;background:#f5f5f5}.container{max-width:600px;margin:0 auto;background:white}.header{background:linear-gradient(135deg,#800000 0%,#5C0A0A 100%);color:white;padding:40px 30px;text-align:center}.header h1{font-size:32px;margin-bottom:10px;font-weight:700}.header p{font-size:16px;opacity:.95}.content{padding:40px 30px}.greeting{font-size:24px;color:#800000;margin-bottom:20px;font-weight:600}.message{font-size:16px;color:#555;margin-bottom:20px;line-height:1.8}.button{display:inline-block;background:#800000;color:white!important;padding:14px 32px;text-decoration:none;border-radius:6px;margin:25px 0;font-weight:600;font-size:16px}.quick-links{background:#fff8dc;border-left:4px solid #FFD700;padding:20px;margin:30px 0;border-radius:4px}.quick-links h3{color:#800000;font-size:18px;margin-bottom:15px}.links-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.link-item{background:white;padding:12px;border-radius:4px;text-align:center;border:1px solid #e0e0e0}.link-item a{color:#800000;text-decoration:none;font-weight:500;font-size:14px}.features{margin:30px 0}.feature{display:flex;align-items:start;margin-bottom:15px}.feature-icon{background:#800000;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;font-weight:bold}.feature-text{flex:1}.feature-title{font-weight:600;color:#800000;margin-bottom:4px}.feature-desc{font-size:14px;color:#666}.cta-section{background:linear-gradient(135deg,#fff8dc 0%,#ffe4b5 100%);padding:25px;border-radius:8px;text-align:center;margin:30px 0}.cta-section h3{color:#800000;font-size:20px;margin-bottom:15px}.contact{background:#f9f9f9;padding:20px;border-radius:6px;margin:25px 0}.contact h4{color:#800000;font-size:16px;margin-bottom:12px}.contact-info{font-size:14px;color:#555}.contact-item{margin:8px 0}.footer{background:#333;color:#fff;padding:30px;text-align:center}.footer p{font-size:13px;margin:8px 0;opacity:.8}.social-links{margin:15px 0}.social-links a{color:#FFD700;margin:0 8px;text-decoration:none;font-size:14px}@media only screen and (max-width:600px){.content{padding:25px 20px}.links-grid{grid-template-columns:1fr}}</style></head><body><div class="container"><div class="header"><h1>🌸 Welcome to Sudhakant Sarees! 🌸</h1><p>Tradition Meets Elegance</p></div><div class="content"><div class="greeting">Namaste, ${customerName}!</div><p class="message">Thank you for joining the Sudhakant Sarees family! We're absolutely delighted to have you with us.</p><p class="message">At Sudhakant Sarees, we celebrate the timeless beauty of traditional Indian sarees. Each piece in our collection is carefully curated to bring elegance, grace, and a touch of heritage to your wardrobe.</p><div class="cta-section"><h3>🛍️ Start Your Journey</h3><p style="margin-bottom:15px;color:#555">Explore our exquisite collection of handpicked sarees</p><a href="${siteUrl}" class="button">Browse Our Collection</a></div><div class="quick-links"><h3>✨ Quick Links</h3><div class="links-grid"><div class="link-item"><a href="${siteUrl}/products/silk">Silk Sarees</a></div><div class="link-item"><a href="${siteUrl}/products/cotton">Cotton Sarees</a></div><div class="link-item"><a href="${siteUrl}/products/designer">Designer Collection</a></div><div class="link-item"><a href="${siteUrl}/featured">Featured Products</a></div><div class="link-item"><a href="${siteUrl}/cart">My Cart</a></div><div class="link-item"><a href="${siteUrl}/orders">My Orders</a></div></div></div><div class="features"><div class="feature"><div class="feature-icon">✓</div><div class="feature-text"><div class="feature-title">Premium Quality</div><div class="feature-desc">Handpicked sarees with authentic fabrics and traditional craftsmanship</div></div></div><div class="feature"><div class="feature-icon">🚚</div><div class="feature-text"><div class="feature-title">Secure Delivery</div><div class="feature-desc">Fast and safe shipping to your doorstep with care</div></div></div><div class="feature"><div class="feature-icon">💬</div><div class="feature-text"><div class="feature-title">Customer Support</div><div class="feature-desc">Our team is always here to help you find the perfect saree</div></div></div></div><div class="contact"><h4>📞 Need Help?</h4><div class="contact-info"><div class="contact-item"><strong>WhatsApp:</strong> <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#800000;text-decoration:none">+${WHATSAPP_NUMBER}</a></div><div class="contact-item"><strong>Website:</strong> <a href="${siteUrl}" style="color:#800000;text-decoration:none">${siteUrl}</a></div></div></div><p class="message">We can't wait to help you discover the perfect saree for every occasion!</p><p class="message" style="margin-top:25px"><strong>With love and gratitude,</strong><br><span style="color:#800000;font-weight:600">The Sudhakant Sarees Team</span></p></div><div class="footer"><div class="social-links"><a href="${siteUrl}">Visit Website</a> • <a href="https://wa.me/${WHATSAPP_NUMBER}">WhatsApp</a></div><p>© ${new Date().getFullYear()} Sudhakant Sarees. All rights reserved.</p><p>You're receiving this email because you created an account with us.</p></div></div></body></html>`;

    const result = await getResendClient().emails.send({
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

    const result = await getResendClient().emails.send({
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
