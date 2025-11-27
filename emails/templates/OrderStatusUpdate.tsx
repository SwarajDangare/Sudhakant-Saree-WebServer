import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  statusMessage?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  whatsappNumber?: string;
}

const statusConfig: Record<
  OrderStatus,
  { icon: string; color: string; title: string; message: string }
> = {
  PENDING: {
    icon: '⏳',
    color: '#F59E0B',
    title: 'Order Received',
    message: 'We have received your order and will confirm it shortly.',
  },
  CONFIRMED: {
    icon: '✅',
    color: '#10B981',
    title: 'Order Confirmed',
    message: 'Your order has been confirmed and will be processed soon.',
  },
  PROCESSING: {
    icon: '📦',
    color: '#8B5CF6',
    title: 'Order Processing',
    message: 'We are carefully preparing your saree for shipment.',
  },
  SHIPPED: {
    icon: '🚚',
    color: '#3B82F6',
    title: 'Order Shipped',
    message: 'Your order is on its way! You can track your shipment below.',
  },
  DELIVERED: {
    icon: '🎉',
    color: '#10B981',
    title: 'Order Delivered',
    message:
      'Your order has been delivered! We hope you love your new saree.',
  },
  CANCELLED: {
    icon: '❌',
    color: '#EF4444',
    title: 'Order Cancelled',
    message: 'Your order has been cancelled. If this was a mistake, please contact us.',
  },
};

export const OrderStatusUpdateEmail = ({
  orderNumber = 'ORD-123456',
  customerName = 'Valued Customer',
  status = 'CONFIRMED',
  statusMessage,
  trackingNumber,
  estimatedDelivery,
  whatsappNumber = '919876543210',
}: OrderStatusUpdateEmailProps) => {
  const config = statusConfig[status];
  const previewText = `${config.title} - Order ${orderNumber}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>Sudhakant Sarees</Heading>
            <Text style={tagline}>Tradition Meets Elegance</Text>
          </Section>

          {/* Status Update */}
          <Section style={statusSection}>
            <div style={{ ...statusIcon, backgroundColor: config.color }}>
              {config.icon}
            </div>
            <Heading style={statusHeading}>{config.title}</Heading>
            <Text style={orderNumberText}>Order #{orderNumber}</Text>
            <Text style={statusText}>
              {statusMessage || config.message}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Tracking Information (if shipped) */}
          {status === 'SHIPPED' && trackingNumber && (
            <>
              <Section style={section}>
                <Heading style={sectionHeading}>Tracking Information</Heading>
                <Text style={trackingText}>
                  <strong>Tracking Number:</strong> {trackingNumber}
                </Text>
                {estimatedDelivery && (
                  <Text style={deliveryText}>
                    <strong>Estimated Delivery:</strong> {estimatedDelivery}
                  </Text>
                )}
              </Section>
              <Hr style={hr} />
            </>
          )}

          {/* Next Steps */}
          <Section style={section}>
            <Heading style={sectionHeading}>
              {status === 'DELIVERED' ? "We'd Love Your Feedback" : "What's Next?"}
            </Heading>
            {status === 'CONFIRMED' && (
              <Text style={infoText}>
                • Your order is confirmed and will be processed within 24 hours
                <br />
                • You'll receive a notification once it's shipped
                <br />
                • Average delivery time is 5-7 business days
              </Text>
            )}
            {status === 'PROCESSING' && (
              <Text style={infoText}>
                • We're carefully selecting and packaging your saree
                <br />
                • Quality check is in progress
                <br />
                • You'll receive tracking details once shipped
              </Text>
            )}
            {status === 'SHIPPED' && (
              <Text style={infoText}>
                • Your package is on its way
                <br />
                • Track your shipment using the tracking number above
                <br />
                • Make sure someone is available to receive the package
              </Text>
            )}
            {status === 'DELIVERED' && (
              <Text style={infoText}>
                Thank you for choosing Sudhakant Sarees! We hope you love your
                purchase. If you're happy with your saree, we'd appreciate it if
                you could share a review or recommend us to your friends and family.
              </Text>
            )}
            {status === 'CANCELLED' && (
              <Text style={infoText}>
                If you didn't request this cancellation or if you have any questions,
                please contact us immediately via WhatsApp or email.
              </Text>
            )}
          </Section>

          {/* CTA Buttons */}
          {status !== 'CANCELLED' && (
            <Section style={buttonSection}>
              {whatsappNumber && (
                <Button
                  style={whatsappButton}
                  href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
                    `Hi! I have a question about my order ${orderNumber}`
                  )}`}
                >
                  💬 Contact Us on WhatsApp
                </Button>
              )}
            </Section>
          )}

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions about your order?
              <br />
              {whatsappNumber && (
                <>
                  WhatsApp: +{whatsappNumber}
                  <br />
                </>
              )}
              Email: orders@sudhakant-sarees.com
            </Text>
            <Hr style={footerHr} />
            <Text style={copyrightText}>
              © {new Date().getFullYear()} Sudhakant Sarees. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 40px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #800000 0%, #5C0A0A 100%)',
};

const heading = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 8px',
};

const tagline = {
  fontSize: '14px',
  color: '#FFD700',
  margin: '0',
  letterSpacing: '1px',
};

const statusSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const statusIcon = {
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '40px',
  lineHeight: '72px',
  margin: '0 auto 16px',
  fontWeight: 'bold',
};

const statusHeading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const orderNumberText = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#800000',
  margin: '0 0 16px',
};

const statusText = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0',
};

const section = {
  padding: '24px 40px',
};

const sectionHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 16px',
};

const trackingText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0 0 8px',
  fontFamily: 'monospace',
};

const deliveryText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0',
};

const infoText = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#666666',
  margin: '0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '0',
};

const buttonSection = {
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const whatsappButton = {
  backgroundColor: '#25D366',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0 0 16px',
};

const footerHr = {
  borderColor: '#e6ebf1',
  margin: '16px 0',
};

const copyrightText = {
  fontSize: '12px',
  color: '#999999',
  margin: '0',
};
