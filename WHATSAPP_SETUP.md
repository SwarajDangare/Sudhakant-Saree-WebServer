# WhatsApp Integration Guide

> **Last Updated:** November 27, 2025

## Table of Contents

1. [Floating WhatsApp Icon (FREE)](#floating-whatsapp-icon-free)
2. [Automated WhatsApp Messages](#automated-whatsapp-messages)
3. [Options for Order Notifications](#options-for-order-notifications)
4. [Recommended Approach](#recommended-approach)

---

## Floating WhatsApp Icon (FREE) ✅

### What is it?

A floating WhatsApp button appears in the bottom-right corner of your website. When customers click it, they're taken directly to WhatsApp with your business number pre-filled.

### Setup Instructions

#### Step 1: Add Your WhatsApp Number

1. Open your `.env` file (or create it from `.env.example`)
2. Add your WhatsApp Business number:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210"
```

**Format Rules:**
- Include country code (91 for India)
- No spaces, no dashes, no + sign
- Example: For +91 98765 43210, use: `919876543210`

#### Step 2: Customize the Pre-filled Message (Optional)

Edit `components/WhatsAppFloat.tsx`:

```typescript
const defaultMessage = encodeURIComponent(
  'Hello! I have a question about your sarees.'
);
```

Change to whatever greeting you prefer!

#### Step 3: Test It

1. Run `npm run dev`
2. Visit any page on your site
3. You'll see a green WhatsApp icon in the bottom-right
4. Click it to test the chat link

### Features

✅ **Completely FREE** - No API needed, no subscription
✅ **Mobile & Desktop** - Works on all devices
✅ **Professional** - Animated pulse effect
✅ **Customizable** - Easy to modify text and styling
✅ **Tooltip** - Shows "Chat with us on WhatsApp" on hover

---

## Automated WhatsApp Messages

### The Reality: FREE vs PAID

You mentioned wanting to send automated WhatsApp messages "for free using a Python script". Here's what you need to know:

### ❌ **Option 1: "Free" Automation Scripts (NOT RECOMMENDED)**

**What they are:**
- Python libraries: `pywhatkit`, `selenium`, `whatsapp-web.js`
- Browser automation that mimics human behavior
- Uses WhatsApp Web

**Example (Python):**
```python
import pywhatkit
pywhatkit.sendwhatmsg("+919876543210", "Your order is confirmed!", 14, 30)
```

**Why you SHOULD NOT use this:**

🚫 **Violates WhatsApp Terms of Service**
- Your account WILL be banned (temporarily or permanently)
- WhatsApp actively detects and blocks automation

🚫 **Unreliable**
- Breaks when WhatsApp updates
- Needs browser to be open
- Can't run on servers without GUI
- Random failures

🚫 **Unprofessional**
- Messages come from personal WhatsApp
- No verified business badge
- No message templates
- Looks spammy to customers

🚫 **Legal Issues**
- Sending automated messages without consent = spam
- Can result in legal action under IT Act

🚫 **Technical Limitations**
- Can't handle high volume
- Requires constant monitoring
- Security risks (account credentials exposed)

**Verdict:** ❌ **DON'T USE FOR BUSINESS**

---

### ✅ **Option 2: WhatsApp Business API (OFFICIAL & LEGAL)**

**What it is:**
- Official API from Meta (WhatsApp's parent company)
- Requires approval from WhatsApp
- Accessed through Business Solution Providers (BSPs)

**Providers in India:**
- **AiSensy:** ₹999/month + message costs
- **Interakt:** Custom pricing + message costs
- **WATI:** ₹2,499/month + message costs

**How it works:**

1. **Sign up with a provider** (e.g., AiSensy)
2. **Submit business documents** for verification
3. **Get approved** by WhatsApp (2-3 days)
4. **Create message templates** (must be pre-approved)
5. **Integrate via API** in your app

**Example Implementation:**

```typescript
// app/api/notifications/whatsapp/route.ts
export async function POST(request: Request) {
  const { orderId, customerPhone, orderStatus } = await request.json();

  // Send via AiSensy API
  const response = await fetch('https://backend.aisensy.com/campaign/t1/api/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.AISENSY_API_KEY}`
    },
    body: JSON.stringify({
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: 'order_update',
      destination: customerPhone,
      userName: 'Sudhakant Sarees',
      templateParams: [orderId, orderStatus]
    })
  });

  return Response.json({ success: true });
}
```

**Message Template Example:**
```
Hello {{1}}! 👋

Your order *{{2}}* has been {{3}}.

Track your order: {{4}}

- Sudhakant Sarees
```

**Pricing Breakdown:**

| Service | Platform Fee | Message Cost (India) |
|---------|--------------|---------------------|
| **AiSensy** | ₹999/month | ₹0.125 (utility), ₹0.88 (marketing) |
| **Interakt** | Contact Sales | ₹0.16 (utility), ₹0.88 (marketing) |
| **WATI** | ₹2,499/month | ₹0.15 (utility), ₹0.90 (marketing) |

**Example Monthly Cost (100 orders):**
- Platform: ₹999
- 100 order confirmations: ₹12.50 (utility messages)
- 100 delivery updates: ₹12.50
- **Total: ~₹1,025/month**

**Pros:**
✅ Official and legal
✅ No ban risk
✅ Verified business badge
✅ Professional templates
✅ High delivery rates
✅ Analytics and tracking
✅ Scalable

**Cons:**
❌ Costs money (₹1,000-3,000/month)
❌ Requires approval process
❌ Messages must use pre-approved templates
❌ Initial setup required

---

### 🤔 **Option 3: WhatsApp Business App (MANUAL)**

**What it is:**
- Free mobile app from WhatsApp
- Manual message sending
- No automation

**How to use:**

1. Download WhatsApp Business on your phone
2. Set up business profile
3. Manually send messages to customers when orders change

**Pros:**
✅ Completely FREE
✅ Official WhatsApp product
✅ Professional business profile
✅ Quick replies and labels

**Cons:**
❌ Manual work required
❌ Not scalable
❌ Time-consuming
❌ Prone to human error
❌ Can't integrate with website

**Best for:** Very small businesses (< 10 orders/day)

---

## Options for Order Notifications

### Comparison Table

| Method | Cost | Automation | Legal | Professional | Scalable |
|--------|------|------------|-------|--------------|----------|
| **Email (Resend)** | FREE (3k/mo) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **WhatsApp API** | ₹1,000/mo | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **WhatsApp Business App** | FREE | ❌ Manual | ✅ Yes | ✅ Yes | ❌ No |
| **Python Automation** | FREE | ⚠️ Risky | ❌ No | ❌ No | ❌ No |
| **SMS** | ₹0.10-0.25/SMS | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Recommended Approach

### 🎯 **PHASE 1: Launch (FREE)**

**For Customer Support:**
✅ Floating WhatsApp icon (already implemented)
- Customers can message you anytime
- You reply manually from WhatsApp Business app

**For Automated Notifications:**
✅ Email notifications (FREE via Resend)
- Order confirmations
- Order status updates
- Delivery notifications
- Professional and reliable

**For VIP Customers:**
✅ Manual WhatsApp messages
- Use WhatsApp Business app
- Personal touch for high-value orders

**Monthly Cost: ₹0**

---

### 🚀 **PHASE 2: Growth (When profitable)**

**Add WhatsApp Business API:**
- Automated order updates via WhatsApp
- Marketing campaigns
- Abandoned cart recovery

**Provider Recommendation:** AiSensy
- ₹999/month + messages
- Easy setup
- Good for Indian businesses

**Monthly Cost: ₹1,000-3,000** (depending on volume)

---

### 🔧 **PHASE 3: Scale (High volume)**

**Add SMS notifications** (optional)
- Immediate delivery
- Works for non-smartphone users
- ~₹0.10-0.25 per SMS

**Upgrade WhatsApp API:**
- Higher tier plan
- Dedicated support
- Advanced features

---

## Implementation Steps

### What I'll Build NOW (FREE):

1. ✅ **Floating WhatsApp Icon** (DONE)
   - Already implemented
   - Just add your number to `.env`

2. ✅ **Email Notification System** (NEXT)
   - Set up Resend (free account)
   - Create email templates
   - Send on order creation/updates
   - Professional and reliable

### What We Can Add LATER (Paid):

3. 🔜 **WhatsApp Business API** (When ready)
   - Sign up with AiSensy
   - Create templates
   - Integrate with order system

---

## Quick Start: Email Notifications

Since email is FREE and professional, let me set that up for you now:

### Benefits of Email:
✅ **FREE** - Resend gives 3,000 emails/month
✅ **Automated** - Triggered by order events
✅ **Professional** - Custom HTML templates
✅ **Reliable** - 99%+ delivery rate
✅ **Legal** - No compliance issues
✅ **Scalable** - Handles any volume

### What emails will send:

1. **Order Confirmation** - When customer places order
2. **Order Confirmed** - When admin confirms order
3. **Order Shipped** - When order is shipped
4. **Order Delivered** - When order is delivered
5. **Order Cancelled** - If order is cancelled

**Each email includes:**
- Order details
- Customer information
- Tracking information
- Support contact (WhatsApp link!)

---

## Summary

| Feature | Status | Cost |
|---------|--------|------|
| **WhatsApp Float Icon** | ✅ IMPLEMENTED | FREE |
| **Email Notifications** | 🔨 READY TO BUILD | FREE |
| **WhatsApp API** | 📅 FUTURE | ₹1,000/mo |
| **SMS Notifications** | 📅 FUTURE | ₹0.10/SMS |

---

## Next Steps

**Tell me:**

1. ✅ Is the WhatsApp floating icon good? (Should work after you add your number to `.env`)

2. 🤔 Should I implement **Email Notifications** now? (FREE via Resend)
   - Automated
   - Professional
   - Reliable
   - No risk of account bans

3. 📅 Do you want to start with WhatsApp API now or later?
   - If now: I'll guide you through AiSensy signup
   - If later: Email notifications will cover your needs

**My recommendation:** Start with Email notifications (FREE) now, add WhatsApp API later when you're getting more orders.

---

## FAQ

### Q: Can't I just use Python scripts for free?

**A:** Technically yes, but:
- You WILL get banned
- It's against WhatsApp's ToS
- Unreliable and unprofessional
- Not worth the risk for a business

For a legitimate business, either:
- Use email (FREE and professional)
- Pay for WhatsApp API (₹1,000/month)
- Send manually via WhatsApp Business app (FREE but time-consuming)

### Q: Why can't I send WhatsApp messages without paying?

**A:** WhatsApp Business API is Meta's (Facebook's) product. They charge for business messaging to:
- Prevent spam
- Ensure quality
- Verify businesses
- Provide infrastructure

Think of it like:
- Email is free (like letters)
- WhatsApp API is paid (like courier service)

### Q: What about other messaging apps?

**Telegram:**
- Has free bot API
- Less popular in India for shopping
- Good alternative for notifications

**SMS:**
- ₹0.10-0.25 per message
- Works for everyone
- Immediate delivery
- Good for OTPs and urgent alerts

### Q: How much does email cost?

**FREE with Resend:**
- 3,000 emails/month
- No credit card required
- Perfect for starting out

**Paid:**
- $20/month for 50,000 emails
- Only when you grow significantly

---

## Support

Need help?
- Check CLAUDE.md for project documentation
- Test the WhatsApp icon after adding your number
- Let me know if you want email notifications set up!

---

*Last updated: November 27, 2025*
