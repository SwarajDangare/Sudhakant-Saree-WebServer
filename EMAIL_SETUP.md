# Email Notification Setup Guide

> **Last Updated:** November 27, 2025
> **Service:** Resend (FREE for 3,000 emails/month)

## Table of Contents

1. [Overview](#overview)
2. [Resend Setup](#resend-setup)
3. [Configuration](#configuration)
4. [Email Templates](#email-templates)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Overview

Your Sudhakant Sarees website now has a professional email notification system that automatically sends emails to customers when:

✅ **Order is placed** - Order confirmation email
✅ **Order status changes** - Status update email (Confirmed, Processing, Shipped, Delivered, Cancelled)

### Features

- 🎨 **Beautiful branded templates** with your colors (Maroon & Gold)
- 📱 **Mobile-responsive** designs
- 🔗 **WhatsApp integration** in every email
- ⚡ **Fast delivery** (typically under 1 second)
- 📊 **Order tracking** information
- 💰 **FREE** (3,000 emails/month with Resend)

---

## Resend Setup

### Step 1: Create Resend Account

1. Go to **[https://resend.com/signup](https://resend.com/signup)**
2. Sign up with your email
3. Verify your email address
4. You'll land on the dashboard

### Step 2: Get API Key

1. In the Resend dashboard, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Give it a name: `Sudhakant Sarees Production`
4. Select permissions: **"Full Access"** or **"Sending Access"**
5. Click **"Create"**
6. **Copy the API key** (starts with `re_...`)
7. ⚠️ **IMPORTANT:** Save it immediately - you won't see it again!

### Step 3: Verify Your Domain (Recommended for Production)

**For production use, you MUST verify your domain. For testing, skip to Step 4.**

1. In Resend dashboard, click **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `sudhakant-sarees.com` (or your actual domain)
4. Resend will show you DNS records to add:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)

5. Add these records to your domain's DNS settings:
   - If using **Cloudflare**: Go to DNS > Records > Add Record
   - If using **GoDaddy/Namecheap**: Go to DNS Management
   - Copy each record exactly as shown

6. Wait 5-30 minutes for DNS propagation
7. Click **"Verify"** in Resend dashboard
8. Once verified, you can send from `orders@sudhakant-sarees.com`

### Step 4: Testing Without Domain Verification

For testing, Resend lets you send from your signup email:

**Example:**
- If you signed up with `yourname@gmail.com`
- You can send test emails from `onboarding@resend.dev`
- Emails will be delivered, but marked as "via resend.dev"

---

## Configuration

### Step 1: Add Environment Variables

Open your `.env` file and add:

```env
# Email Configuration (Resend)
RESEND_API_KEY="re_your_actual_api_key_here"
EMAIL_FROM="Sudhakant Sarees <orders@sudhakant-sarees.com>"
```

**Important Notes:**

1. **RESEND_API_KEY**:
   - Paste the key you copied from Resend
   - Should start with `re_`
   - Keep it secret!

2. **EMAIL_FROM**:
   - **For testing** (no domain verified): `"Sudhakant Sarees <onboarding@resend.dev>"`
   - **For production** (domain verified): `"Sudhakant Sarees <orders@sudhakant-sarees.com>"`
   - Format: `"Display Name <email@domain.com>"`

### Step 2: Test Email Sending

**Option A: Place a Test Order (End-to-End Test)**

1. Make sure you have a customer account with an email address
2. Add items to cart
3. Go to checkout
4. Place an order
5. Check your email inbox - you should receive the order confirmation!

**Option B: Create a Test Script**

Create `scripts/test-email.ts`:

```typescript
import { sendOrderConfirmationEmail } from '../lib/email';

async function test() {
  const result = await sendOrderConfirmationEmail({
    orderNumber: 'TEST-12345',
    customerName: 'Test Customer',
    customerEmail: 'your-test-email@gmail.com', // Change this to your email
    items: [
      {
        productName: 'Beautiful Banarasi Silk Saree',
        productColor: 'Royal Blue',
        quantity: 1,
        price: '8999.00',
        subtotal: '8999.00',
      },
    ],
    subtotal: '8999.00',
    total: '8999.00',
    address: {
      name: 'Test Customer',
      phoneNumber: '9876543210',
      addressLine1: '123 Test Street',
      addressLine2: null,
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    },
    paymentMethod: 'COD',
    orderDate: new Date().toLocaleDateString('en-IN'),
  });

  console.log('Email sent:', result);
}

test();
```

Run it:
```bash
npx tsx scripts/test-email.ts
```

---

## Email Templates

### 1. Order Confirmation Email

**Sent when:** Customer places an order

**Template:** `emails/templates/OrderConfirmation.tsx`

**Includes:**
- ✅ Success message with order number
- 📦 Full order summary with items
- 💰 Pricing breakdown (subtotal, shipping, total)
- 📍 Delivery address
- 💳 Payment method
- 📋 What happens next (order timeline)
- 💬 WhatsApp contact button

**Customization:**

You can edit the template to:
- Change colors/styling
- Add your logo
- Modify the message text
- Add promotional content

### 2. Order Status Update Email

**Sent when:** Admin changes order status

**Template:** `emails/templates/OrderStatusUpdate.tsx`

**Status Types:**

| Status | Icon | Color | Message |
|--------|------|-------|---------|
| **PENDING** | ⏳ | Yellow | Order received, will confirm soon |
| **CONFIRMED** | ✅ | Green | Order confirmed, processing soon |
| **PROCESSING** | 📦 | Purple | Preparing your saree for shipment |
| **SHIPPED** | 🚚 | Blue | On its way! Includes tracking |
| **DELIVERED** | 🎉 | Green | Successfully delivered |
| **CANCELLED** | ❌ | Red | Order cancelled |

**Includes:**
- 🎯 Status-specific icon and message
- 📦 Tracking information (when shipped)
- 📅 Estimated delivery (when shipped)
- ℹ️ What happens next
- 💬 WhatsApp contact button

---

## Email Triggers

### Automatic Triggers

**1. Order Creation (`POST /api/orders`)**
```typescript
// Automatically sends when customer places order
// Email: Order Confirmation
```

**2. Status Update (`PUT /api/admin/orders/[id]`)**
```typescript
// Automatically sends when admin updates order status
// Email: Order Status Update
```

### Requirements for Email to Send

✅ Customer must have an **email address** in their profile
✅ `RESEND_API_KEY` must be configured in `.env`
✅ `EMAIL_FROM` must be set and verified (for production)

**Note:** If email fails to send, it won't break the order creation/update. Errors are logged but the order still processes successfully.

---

## Testing

### Test Checklist

- [ ] Resend account created
- [ ] API key added to `.env`
- [ ] Email sender configured
- [ ] Customer profile has email address
- [ ] Test order placed
- [ ] Order confirmation email received
- [ ] Admin status update triggers email
- [ ] Status update email received
- [ ] WhatsApp link works in email
- [ ] Email displays correctly on mobile
- [ ] Email displays correctly on desktop

### Common Test Scenarios

**1. New Order Email**
```bash
1. Sign up as customer with your email
2. Browse products
3. Add to cart
4. Checkout and place order
5. Check inbox for "Order Confirmed" email
```

**2. Status Update Email**
```bash
1. Login to admin panel
2. Go to Orders
3. Find a test order
4. Change status to "CONFIRMED"
5. Check customer's inbox for "Order Confirmed" email
6. Change status to "SHIPPED"
7. Check inbox for "Order Shipped" email
```

---

## Troubleshooting

### Email Not Sending

**Check 1: Is Resend API key configured?**
```bash
# In your .env file, check:
RESEND_API_KEY="re_..."

# Should start with "re_"
# Should not be empty or "re_123456789"
```

**Check 2: Is customer email set?**
```sql
-- Check in database or admin panel
-- Customer profile must have email address
```

**Check 3: Check console logs**
```bash
npm run dev

# Look for logs like:
# "Order confirmation email sent: { messageId: '...' }"
# OR
# "Failed to send order confirmation email: ..."
```

**Check 4: Resend Dashboard**
1. Go to [Resend Dashboard](https://resend.com/emails)
2. Click "Emails" in sidebar
3. See all sent emails
4. Check delivery status
5. View error logs if failed

---

### Email Goes to Spam

**Solutions:**

1. **Verify your domain** (most important!)
   - Add SPF, DKIM, DMARC records
   - This dramatically improves delivery

2. **Use a professional "From" address**
   - ✅ Good: `orders@sudhakant-sarees.com`
   - ❌ Avoid: `noreply@...`, personal Gmail, etc.

3. **Avoid spammy content**
   - Don't use ALL CAPS
   - Avoid too many exclamation marks!!!
   - Don't include suspicious links

4. **Warm up your domain**
   - Start with low volume (< 50 emails/day)
   - Gradually increase over 2-4 weeks
   - This builds sender reputation

---

### Email Formatting Issues

**Problem: Email looks broken on mobile**
- Check `emails/templates/OrderConfirmation.tsx`
- All styles should be inline CSS
- Use responsive widths (max-width: 600px)
- Test with [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/)

**Problem: Images not loading**
- Use absolute URLs (https://...)
- Host images on CDN (Cloudinary)
- Add alt text for accessibility

---

## Pricing & Limits

### Resend Free Tier

✅ **3,000 emails per month**
✅ **100 emails per day**
✅ **Unlimited domains**
✅ **All features included**

### Cost Calculation

**Example: 100 orders/month**
- Order confirmation: 100 emails
- 2 status updates per order: 200 emails
- Total: 300 emails/month
- **Cost: FREE** ✅

**Example: 1,000 orders/month**
- Order confirmation: 1,000 emails
- 2 status updates per order: 2,000 emails
- Total: 3,000 emails/month
- **Cost: FREE** (exactly at limit) ✅

**Example: 2,000 orders/month**
- Total needed: ~6,000 emails/month
- Exceeds free tier
- **Upgrade to Pro: $20/month for 50,000 emails**

### When to Upgrade

Upgrade to Resend Pro ($20/month) when you:
- Send > 3,000 emails/month
- Need dedicated IP address
- Want advanced analytics
- Require priority support

---

## Customization Guide

### Change Email Colors

Edit `emails/templates/OrderConfirmation.tsx`:

```typescript
// Find these styles and modify:
const header = {
  background: 'linear-gradient(135deg, #800000 0%, #5C0A0A 100%)', // Your brand colors
};

const successIcon = {
  backgroundColor: '#10B981', // Green for success
};
```

### Add Your Logo

```typescript
import { Img } from '@react-email/components';

// In the header section:
<Section style={header}>
  <Img
    src="https://your-domain.com/logo.png"
    alt="Sudhakant Sarees"
    width="120"
    height="40"
  />
  <Heading style={heading}>Sudhakant Sarees</Heading>
</Section>
```

### Modify Email Content

All text is editable in the template files:
- `emails/templates/OrderConfirmation.tsx`
- `emails/templates/OrderStatusUpdate.tsx`

Just edit the text between `<Text>` or `<Heading>` tags!

---

## API Reference

### Send Order Confirmation

```typescript
import { sendOrderConfirmationEmail } from '@/lib/email';

await sendOrderConfirmationEmail({
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  items: Array<{
    productName: string,
    productColor: string | null,
    quantity: number,
    price: string,
    subtotal: string,
  }>,
  subtotal: string,
  total: string,
  address: {
    name: string,
    phoneNumber: string,
    addressLine1: string,
    addressLine2: string | null,
    city: string,
    state: string,
    pincode: string,
  },
  paymentMethod: string,
  orderDate: string,
});
```

### Send Status Update

```typescript
import { sendOrderStatusUpdateEmail } from '@/lib/email';

await sendOrderStatusUpdateEmail({
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED',
  statusMessage?: string, // Optional custom message
  trackingNumber?: string, // For shipped orders
  estimatedDelivery?: string, // For shipped orders
});
```

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail(
  'customer@example.com',
  'Customer Name'
);
```

---

## Best Practices

### 1. Always Include Unsubscribe Link (Coming Soon)

For marketing emails, you legally must include an unsubscribe link. Transactional emails (order confirmations) are exempt.

### 2. Test Before Going Live

- Send test emails to yourself
- Check on multiple email clients (Gmail, Outlook, Apple Mail)
- Test on mobile and desktop
- Click all links to verify they work

### 3. Monitor Delivery Rates

- Check Resend dashboard regularly
- Aim for > 95% delivery rate
- Investigate any bounces or complaints

### 4. Personalize When Possible

- Use customer's name
- Reference their specific order
- Include relevant product details

### 5. Make Emails Actionable

- Include clear calls-to-action (CTAs)
- Link to order tracking
- Provide contact options (WhatsApp, email)

---

## Production Checklist

Before launching:

- [ ] Domain verified in Resend
- [ ] SPF, DKIM, DMARC records added
- [ ] Professional "From" email set
- [ ] All templates tested
- [ ] Mobile rendering verified
- [ ] WhatsApp link tested
- [ ] Order flow tested end-to-end
- [ ] Status update flow tested
- [ ] Error handling verified
- [ ] Logs configured for monitoring

---

## Support & Resources

### Resend Documentation
- [Getting Started](https://resend.com/docs/introduction)
- [Domain Verification](https://resend.com/docs/dashboard/domains/introduction)
- [API Reference](https://resend.com/docs/api-reference/introduction)

### React Email Documentation
- [Components](https://react.email/docs/components/html)
- [Examples](https://react.email/examples)
- [Templates](https://react.email/templates)

### Need Help?
- Check Resend Dashboard for delivery logs
- Review console logs for errors
- Test with different email providers
- Contact Resend support (they're very responsive!)

---

## What's Next?

### Optional Enhancements

1. **Add Welcome Email**
   - Send when customer signs up
   - Already implemented: `sendWelcomeEmail()`
   - Just integrate in signup API

2. **Add Invoice Attachment**
   - Generate PDF invoice
   - Attach to order confirmation email
   - Coming in Phase 4

3. **Add Email Preferences**
   - Let customers choose email frequency
   - Opt-out of marketing emails
   - Store preferences in database

4. **Add Email Analytics**
   - Track open rates
   - Track click rates
   - Use Resend's built-in analytics

---

*Last updated: November 27, 2025*
