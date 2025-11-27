import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  productName: string;
  productColor: string | null;
  quantity: number;
  price: string;
  subtotal: string;
}

interface Address {
  name: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: string;
  total: string;
  address: Address;
  paymentMethod: string;
  orderDate: string;
  whatsappNumber?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber = 'ORD-123456',
  customerName = 'Valued Customer',
  items = [
    {
      productName: 'Elegant Banarasi Silk Saree',
      productColor: 'Royal Blue',
      quantity: 1,
      price: '8999.00',
      subtotal: '8999.00',
    },
  ],
  subtotal = '8999.00',
  total = '8999.00',
  address = {
    name: 'John Doe',
    phoneNumber: '9876543210',
    addressLine1: '123 Main Street',
    addressLine2: 'Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  paymentMethod = 'COD',
  orderDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  whatsappNumber = '919876543210',
}: OrderConfirmationEmailProps) => {
  const previewText = `Order ${orderNumber} confirmed - Thank you for shopping with us!`;

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

          {/* Success Message */}
          <Section style={successSection}>
            <div style={successIcon}>✓</div>
            <Heading style={successHeading}>Order Confirmed!</Heading>
            <Text style={successText}>
              Thank you for your order, {customerName}!
            </Text>
            <Text style={orderNumberText}>Order #{orderNumber}</Text>
            <Text style={dateText}>{orderDate}</Text>
          </Section>

          <Hr style={hr} />

          {/* Order Details */}
          <Section style={section}>
            <Heading style={sectionHeading}>Order Summary</Heading>

            {items.map((item, index) => (
              <div key={index} style={itemContainer}>
                <Row>
                  <Column style={itemDetails}>
                    <Text style={itemName}>{item.productName}</Text>
                    {item.productColor && (
                      <Text style={itemMeta}>Color: {item.productColor}</Text>
                    )}
                    <Text style={itemMeta}>Quantity: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text style={priceText}>
                      ₹{parseFloat(item.subtotal).toLocaleString('en-IN')}
                    </Text>
                  </Column>
                </Row>
                {index < items.length - 1 && <Hr style={itemDivider} />}
              </div>
            ))}

            <Hr style={hr} />

            {/* Totals */}
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal:</Text>
              </Column>
              <Column style={totalValue}>
                <Text style={totalAmount}>
                  ₹{parseFloat(subtotal).toLocaleString('en-IN')}
                </Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Shipping:</Text>
              </Column>
              <Column style={totalValue}>
                <Text style={freeShipping}>FREE</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={grandTotalLabel}>Total:</Text>
              </Column>
              <Column style={totalValue}>
                <Text style={grandTotalAmount}>
                  ₹{parseFloat(total).toLocaleString('en-IN')}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Delivery Address */}
          <Section style={section}>
            <Heading style={sectionHeading}>Delivery Address</Heading>
            <Text style={addressText}>
              <strong>{address.name}</strong>
              <br />
              {address.phoneNumber}
              <br />
              {address.addressLine1}
              {address.addressLine2 && (
                <>
                  <br />
                  {address.addressLine2}
                </>
              )}
              <br />
              {address.city}, {address.state} - {address.pincode}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Payment Method */}
          <Section style={section}>
            <Heading style={sectionHeading}>Payment Method</Heading>
            <Text style={paymentText}>
              {paymentMethod === 'COD' ? 'Cash on Delivery' : paymentMethod}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* What's Next */}
          <Section style={section}>
            <Heading style={sectionHeading}>What's Next?</Heading>
            <Text style={infoText}>
              1. We'll review and confirm your order within 24 hours
              <br />
              2. Once confirmed, we'll prepare your saree for shipping
              <br />
              3. You'll receive updates via email and SMS
              <br />
              4. Delivery typically takes 5-7 business days
            </Text>
          </Section>

          {/* CTA Buttons */}
          <Section style={buttonSection}>
            {whatsappNumber && (
              <Button
                style={whatsappButton}
                href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
                  `Hi! I have a question about my order ${orderNumber}`
                )}`}
              >
                💬 Chat on WhatsApp
              </Button>
            )}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Questions? We're here to help!
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

export default OrderConfirmationEmail;

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

const successSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const successIcon = {
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: '#10B981',
  color: '#ffffff',
  fontSize: '36px',
  lineHeight: '64px',
  margin: '0 auto 16px',
  fontWeight: 'bold',
};

const successHeading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px',
};

const successText = {
  fontSize: '16px',
  color: '#666666',
  margin: '0 0 16px',
};

const orderNumberText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#800000',
  margin: '0 0 4px',
};

const dateText = {
  fontSize: '14px',
  color: '#999999',
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

const itemContainer = {
  marginBottom: '16px',
};

const itemDetails = {
  width: '70%',
};

const itemPrice = {
  width: '30%',
  textAlign: 'right' as const,
};

const itemName = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#1a1a1a',
  margin: '0 0 4px',
};

const itemMeta = {
  fontSize: '13px',
  color: '#666666',
  margin: '0 0 2px',
};

const priceText = {
  fontSize: '15px',
  fontWeight: '500',
  color: '#1a1a1a',
  margin: '0',
};

const itemDivider = {
  borderColor: '#f0f0f0',
  margin: '12px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '0',
};

const totalRow = {
  marginBottom: '8px',
};

const totalLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const totalValue = {
  textAlign: 'right' as const,
};

const totalAmount = {
  fontSize: '14px',
  color: '#1a1a1a',
  margin: '0',
};

const freeShipping = {
  fontSize: '14px',
  color: '#10B981',
  fontWeight: '600',
  margin: '0',
};

const grandTotalLabel = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0',
};

const grandTotalAmount = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#800000',
  margin: '0',
};

const addressText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#666666',
  margin: '0',
};

const paymentText = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const infoText = {
  fontSize: '14px',
  lineHeight: '1.8',
  color: '#666666',
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
  margin: '0 8px',
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
