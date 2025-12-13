# Infrastructure & Deployment Guide

> **Last Updated:** December 13, 2025
> **Project:** Sudhakant Sarees E-Commerce Platform
> **Purpose:** Complete guide to hosting, external services, and deployment

---

## 🏗️ Infrastructure Overview

Sudhakant Sarees uses a modern, serverless architecture with managed services for scalability and reliability.

### **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                      USERS (Customers)                       │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──► Vercel/Cloudflare Pages (Frontend + API Routes)
             │         │
             │         ├──► Neon PostgreSQL (Database)
             │         ├──► Cloudinary (Image CDN)
             │         ├──► Resend (Email Notifications)
             │         └──► 2Factor (SMS OTP)
             │
┌────────────┴────────────────────────────────────────────────┐
│                  ADMINS (Shop Managers)                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🌐 Hosting & Deployment

### **1. Vercel (Recommended) or Cloudflare Pages**

**Current Status:** ⚠️ Not deployed yet (in progress)

#### **Why Vercel/Cloudflare Pages?**
- ✅ **FREE** for hobby/small projects
- ✅ **Edge Network** - Fast global delivery
- ✅ **Automatic HTTPS** - SSL certificates included
- ✅ **Git Integration** - Auto-deploy on push
- ✅ **Serverless Functions** - API routes run on-demand
- ✅ **Next.js Optimized** - Built specifically for Next.js

#### **Vercel Deployment (Recommended)**

**Step 1: Create Vercel Account**
1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with GitHub (recommended for auto-deploy)
3. Connect your repository

**Step 2: Import Project**
1. Click "Add New Project"
2. Select your repository: `Sudhakant-Saree-WebServer`
3. Select branch: `main` (for production) or `dev` (for preview)

**Step 3: Configure Build Settings**
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node.js Version: 18.x
```

**Step 4: Add Environment Variables** (See "Environment Variables" section below)

**Step 5: Deploy**
- Click "Deploy"
- Wait 2-3 minutes for build
- Your site will be live at `https://your-project.vercel.app`

#### **Cloudflare Pages Deployment (Alternative)**

**Step 1: Create Cloudflare Account**
1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up and verify email

**Step 2: Create Pages Project**
1. Go to "Workers & Pages" → "Pages"
2. Click "Connect to Git"
3. Select your repository
4. Select branch: `main`

**Step 3: Configure Build**
```
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
Root directory: /
Node.js version: 18
```

**Step 4: Add Environment Variables** (See below)

**Step 5: Deploy**
- Click "Save and Deploy"
- Your site will be live at `https://your-project.pages.dev`

#### **Custom Domain Setup**

**For Vercel:**
1. Go to Project Settings → Domains
2. Add your domain: `www.sudhakantsarees.com`
3. Update DNS records as instructed (CNAME or A record)
4. SSL certificate is automatic

**For Cloudflare Pages:**
1. Go to Custom Domains
2. Add domain: `www.sudhakantsarees.com`
3. Update DNS in Cloudflare dashboard
4. SSL certificate is automatic

#### **Deployment Branches**

**Two-Branch Strategy:**
- `main` branch → Production (live website)
- `dev` branch → Preview/Staging (testing)

Every push to `dev` creates a preview deployment.
Merge `dev` → `main` to deploy to production.

---

## 🗄️ Database (Neon)

**Service:** Neon - Serverless PostgreSQL
**Website:** [https://neon.tech](https://neon.tech)
**Dashboard:** [https://console.neon.tech](https://console.neon.tech)

### **Why Neon?**
- ✅ **FREE** tier (512 MB database, 3 GB storage)
- ✅ **Serverless** - Scales to zero when idle
- ✅ **Branching** - Create database branches for testing
- ✅ **Fast** - Low latency globally
- ✅ **Postgres** - Full PostgreSQL compatibility
- ✅ **Automatic Backups** - Daily backups included

### **Setup Instructions**

#### **Step 1: Create Neon Account**
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up with GitHub (recommended)
3. Verify your email

#### **Step 2: Create Database Project**
1. Click "Create Project"
2. Name: `Sudhakant Sarees`
3. Region: Select closest to your target audience (e.g., `Mumbai` for India)
4. PostgreSQL Version: Latest (15+)
5. Click "Create Project"

#### **Step 3: Get Connection String**
1. Go to Dashboard → Connection Details
2. Copy the connection string:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
3. Add to `.env` as `DATABASE_URL`

#### **Step 4: Apply Database Migrations**

**Option A: Automatic (if network allows)**
```bash
npm run db:migrate
```

**Option B: Manual (via Neon SQL Editor)**
1. Go to Neon Console → SQL Editor
2. Copy contents of each migration file in `db/migrations/` (in order)
3. Paste and run in SQL Editor
4. Verify tables were created

#### **Step 5: Seed Initial Data**
```bash
npm run db:seed              # Products and categories
npm run db:seed-permissions  # Permission system
npm run db:seed-homepage     # Homepage content
```

### **Database Management**

#### **View Database (Drizzle Studio)**
```bash
npm run db:studio
# Opens GUI at http://localhost:4983
```

#### **View Database (Neon Console)**
1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Select your project
3. Go to "SQL Editor" or "Tables"

#### **Backup Strategy**
- **Automatic:** Neon backs up daily (FREE tier retains 7 days)
- **Manual:** Use Neon Console → Backups → Create backup
- **Export:** Use SQL Editor to export data as SQL

#### **Database Branching (for Testing)**
1. Go to Neon Console → Branches
2. Click "Create Branch"
3. Name: `dev` or `staging`
4. Get separate connection string for branch
5. Test schema changes on branch before applying to main

---

## 🖼️ Image Hosting (Cloudinary)

**Service:** Cloudinary - Media Management Platform
**Website:** [https://cloudinary.com](https://cloudinary.com)
**Dashboard:** [https://cloudinary.com/console](https://cloudinary.com/console)

### **Why Cloudinary?**
- ✅ **FREE** tier (25 GB storage, 25 GB bandwidth/month)
- ✅ **CDN** - Fast image delivery globally
- ✅ **Transformations** - Automatic image resizing/optimization
- ✅ **Upload Widget** - Easy browser uploads
- ✅ **Organization** - Folder structure for products/banners

### **Setup Instructions**

#### **Step 1: Create Cloudinary Account**
1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up for free account
3. Verify email
4. You'll be taken to Dashboard

#### **Step 2: Get Credentials**
On Dashboard (top section), you'll see:
- **Cloud Name:** `dxxxxx` (copy this)
- **API Key:** `123456789012345` (copy this)
- **API Secret:** Click "Reveal" (copy this)

**Important:** Keep API Secret secure! Never commit to Git.

#### **Step 3: Create Upload Presets**

You need TWO upload presets:

**Preset 1: Product Images**
1. Go to Settings (⚙️) → Upload tab
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Configure:
   - Name: `product_images`
   - Signing Mode: **Unsigned** ⚠️ (important!)
   - Folder: `sarees/products`
   - Max file size: 10 MB
   - Allowed formats: jpg, png, webp
   - Transformation:
     - Width: 1200
     - Height: 1600
     - Crop: Limit
     - Quality: Auto
     - Format: Auto
5. Click "Save"

**Preset 2: Homepage Banners**
1. Click "Add upload preset" again
2. Configure:
   - Name: `sudhakant_sarees`
   - Signing Mode: **Unsigned** ⚠️
   - Folder: `sarees/homepage`
   - Max file size: 10 MB
   - Allowed formats: jpg, png, webp, gif, mp4
   - Transformation:
     - Width: 1920
     - Height: 1080
     - Crop: Limit
     - Quality: Auto
     - Format: Auto
3. Click "Save"

#### **Step 4: Add Environment Variables**
Add to `.env`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"  # e.g., "dxxxxx"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Note:** `NEXT_PUBLIC_` prefix is required for Cloud Name (used in browser).

#### **Step 5: Test Upload**
1. Restart dev server: `npm run dev`
2. Go to `/admin/products` → Add Product
3. Click "Upload Image" in color variants
4. Upload widget should open
5. Select an image and upload
6. Image should appear in your product

### **Image Organization**

**Folder Structure:**
```
sarees/
├── products/          # Product images (from product_images preset)
│   ├── silk/
│   ├── cotton/
│   └── banarasi/
├── homepage/          # Homepage banners (from sudhakant_sarees preset)
│   ├── hero/
│   ├── collections/
│   └── banners/
└── categories/        # Category images
```

### **Managing Images**

**View All Images:**
1. Go to [Cloudinary Media Library](https://cloudinary.com/console/media_library)
2. Browse folders
3. Search by filename or tag

**Delete Images:**
- Images are automatically deleted from Cloudinary when you delete products/banners in admin panel
- Uses `publicId` field stored in database

### **Optimization Tips**

**Automatic Optimizations (enabled by default):**
- ✅ Format conversion (converts to WebP/AVIF for modern browsers)
- ✅ Quality compression (reduces file size without visible quality loss)
- ✅ Responsive images (Next.js Image component auto-requests correct size)
- ✅ CDN caching (images cached globally for fast delivery)

**FREE Tier Limits:**
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 monthly transformations

**For most small stores:** This is more than enough!

**If you exceed limits:**
- Upgrade to paid plan (starts at $89/month for 100 GB)
- OR optimize: Delete unused images, reduce image sizes

---

## 📧 Email Notifications (Resend)

**Service:** Resend - Modern Email API
**Website:** [https://resend.com](https://resend.com)
**Dashboard:** [https://resend.com/emails](https://resend.com/emails)

### **Why Resend?**
- ✅ **FREE** (3,000 emails/month, 100/day)
- ✅ **Fast** - Typically delivers in < 1 second
- ✅ **React Email** - Beautiful templates with React
- ✅ **Domain Verification** - SPF/DKIM setup
- ✅ **Analytics** - Open rates, click rates, bounces
- ✅ **Simple API** - Easy to integrate

### **Setup Instructions**

#### **Step 1: Create Resend Account**
1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Sign up with email
3. Verify your email address

#### **Step 2: Get API Key**
1. In Resend dashboard, click "API Keys"
2. Click "Create API Key"
3. Name: `Sudhakant Sarees Production`
4. Permissions: "Sending Access" or "Full Access"
5. Click "Create"
6. **Copy the API key** (starts with `re_...`)
7. ⚠️ **IMPORTANT:** You won't see it again - save it immediately!

#### **Step 3: Add Environment Variable**
Add to `.env`:
```env
RESEND_API_KEY="re_your_actual_api_key_here"
```

#### **Step 4: Configure Email Sender**

**For Testing (No Domain):**
```env
EMAIL_FROM="Sudhakant Sarees <onboarding@resend.dev>"
```

**For Production (Domain Verified):**
```env
EMAIL_FROM="Sudhakant Sarees <orders@sudhakantsarees.com>"
```

#### **Step 5: Verify Domain (Production Only)**

**Skip this for testing. For production:**

1. Go to Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter: `sudhakantsarees.com`
4. Resend shows DNS records to add:
   - SPF record (TXT)
   - DKIM record (TXT)
   - DMARC record (TXT, optional)

5. Add records to your domain DNS:
   - **If using Cloudflare DNS:**
     - Go to Cloudflare Dashboard → DNS → Records
     - Add each record as shown by Resend
   - **If using GoDaddy/Namecheap:**
     - Go to Domain Management → DNS
     - Add TXT records as shown

6. Wait 5-30 minutes for DNS propagation
7. In Resend, click "Verify"
8. Once verified, emails will come from your domain

#### **Step 6: Test Email Sending**

**Quick Test:**
```bash
# Create a test order in admin panel
# Or manually place an order as a customer
# Check your inbox for order confirmation email
```

**Troubleshooting:**
- Check `.env` has correct `RESEND_API_KEY`
- Check customer has email address in profile
- Check Resend dashboard → Emails for delivery logs
- Check browser console for API errors

### **Email Types**

**1. Order Confirmation**
- Sent when customer places order
- Includes order summary, items, total, delivery address
- Template: `emails/templates/OrderConfirmation.tsx`

**2. Order Status Updates**
- Sent when admin changes order status
- Dynamic content based on status (Confirmed, Shipped, Delivered, etc.)
- Template: `emails/templates/OrderStatusUpdate.tsx`

**3. Welcome Email** (optional)
- Sent when customer creates account
- Function: `sendWelcomeEmail()` in `lib/email.ts`

### **Email Analytics**

**View in Resend Dashboard:**
1. Go to [https://resend.com/emails](https://resend.com/emails)
2. See all sent emails
3. Click email to see:
   - Delivery status (Sent/Delivered/Bounced)
   - Opens and clicks
   - Error logs (if failed)

### **Monthly Limits (FREE Tier)**
- 3,000 emails/month
- 100 emails/day
- Unlimited domains

**Example Usage:**
- 100 orders/month = 100 confirmations + 200 status updates = **300 emails**
- Well within FREE tier!

**If you exceed 3,000/month:**
- Upgrade to Pro: $20/month for 50,000 emails
- Still very affordable!

---

## 📱 SMS OTP (2Factor)

**Service:** 2Factor - SMS OTP API
**Website:** [https://2factor.in](https://2factor.in)
**Dashboard:** [https://2factor.in/panel](https://2factor.in/panel)

### **Why 2Factor?**
- ✅ **Affordable** - ₹0.10-0.15 per SMS
- ✅ **India-focused** - Works with all Indian carriers
- ✅ **OTP Templates** - Pre-approved DLT templates
- ✅ **Fast Delivery** - Typically < 5 seconds
- ✅ **Reliable** - 99%+ delivery rate

### **Setup Instructions**

#### **Step 1: Create 2Factor Account**
1. Go to [https://2factor.in](https://2factor.in)
2. Click "Sign Up"
3. Fill in business details
4. Verify email and phone

#### **Step 2: Add Credits**
1. Go to Dashboard → Recharge
2. Add credits (minimum ₹100)
3. Pay via UPI/Card/Net Banking
4. Credits appear in account

#### **Step 3: Get API Key**
1. Go to Dashboard → "Dev" or "API Keys"
2. Copy your API Key
3. Add to `.env`:
   ```env
   TWOFACTOR_API_KEY="your-api-key-here"
   ```

#### **Step 4: Configure OTP Template**

**Default Template (Auto-created):**
```
Your OTP for Sudhakant Sarees is {otp}. Valid for 10 minutes. Do not share with anyone.
```

**Custom Template (Optional):**
1. Go to Dashboard → Templates
2. Create new OTP template
3. Get DLT approval (required by Indian telecom regulations)
4. Update template ID in code if needed

#### **Step 5: Test SMS Sending**

1. Go to your website homepage
2. Click "Login"
3. Enter your phone number (Indian number: +91XXXXXXXXXX)
4. Click "Send OTP"
5. Check your phone for SMS (arrives in 5-10 seconds)
6. Enter OTP and verify

### **Pricing**

**SMS Rates (India):**
- Transactional SMS: ₹0.10-0.15 per SMS
- OTP SMS: ₹0.10-0.15 per SMS

**Example Monthly Cost:**
- 100 customers sign up/login = 100 OTPs
- 100 × ₹0.12 = **₹12/month**

Very affordable!

### **Monitoring**

**View SMS Logs:**
1. Go to 2Factor Dashboard → Reports
2. See all sent SMS
3. Check delivery status
4. View failed messages

---

## 🔐 Environment Variables

### **Complete .env File**

Create `.env` in project root with these variables:

```env
# ============================================
# DATABASE (Neon PostgreSQL)
# ============================================
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
# Get from: https://console.neon.tech → Connection Details

# ============================================
# AUTHENTICATION (NextAuth.js)
# ============================================
NEXTAUTH_URL="https://www.sudhakantsarees.com"  # Production URL
# For local dev: "http://localhost:3000"

NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"
# Generate with: openssl rand -base64 32

# ============================================
# CLOUDINARY (Image Hosting)
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="dxxxxx"  # Your cloud name
CLOUDINARY_API_KEY="123456789012345"         # Your API key
CLOUDINARY_API_SECRET="your-api-secret"      # Your API secret
# Get from: https://cloudinary.com/console

# ============================================
# EMAIL (Resend)
# ============================================
RESEND_API_KEY="re_your_actual_api_key_here"
# Get from: https://resend.com → API Keys

EMAIL_FROM="Sudhakant Sarees <orders@sudhakantsarees.com>"
# For testing: "Sudhakant Sarees <onboarding@resend.dev>"

# ============================================
# SMS OTP (2Factor)
# ============================================
TWOFACTOR_API_KEY="your-2factor-api-key"
# Get from: https://2factor.in/panel → API Keys

# ============================================
# OPTIONAL: WhatsApp (Future)
# ============================================
NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210"
# Your WhatsApp Business number (without + or spaces)
```

### **Security Notes**

**⚠️ NEVER commit `.env` to Git!**

It's already in `.gitignore`, but double-check:
```bash
cat .gitignore | grep ".env"
# Should show: .env
```

**For Deployment:**
- Add all environment variables in Vercel/Cloudflare dashboard
- Use separate values for production vs preview

**For Team Members:**
- Share `.env.example` (with placeholder values)
- Send actual values securely (encrypted, password manager, etc.)

---

## 🚀 Deployment Checklist

Use this checklist before deploying to production:

### **Pre-Deployment**

- [ ] All features tested locally
- [ ] `npm run build` succeeds without errors
- [ ] Database migrations applied to production database
- [ ] Environment variables configured in hosting platform
- [ ] Cloudinary upload presets created
- [ ] Resend domain verified
- [ ] Email templates tested
- [ ] SMS OTP tested
- [ ] Admin panel accessible
- [ ] Customer flow tested (browse → cart → checkout → order)

### **Deployment**

- [ ] Code pushed to `main` branch
- [ ] Deployment started (automatic via Vercel/Cloudflare)
- [ ] Build completed successfully
- [ ] Production site accessible
- [ ] Database connection working
- [ ] Images loading from Cloudinary
- [ ] Admin login working
- [ ] Customer registration working

### **Post-Deployment**

- [ ] Test full customer journey on production
- [ ] Verify email notifications send
- [ ] Verify SMS OTP works
- [ ] Check admin panel on mobile
- [ ] Monitor error logs (Vercel/Cloudflare dashboard)
- [ ] Set up uptime monitoring (optional: UptimeRobot, Pingdom)
- [ ] Configure custom domain (if applicable)
- [ ] Set up analytics (Google Analytics, Plausible, etc.)

---

## 📊 Monitoring & Analytics

### **Vercel Analytics** (Recommended if using Vercel)

**Setup:**
1. Go to Vercel Dashboard → Project → Analytics
2. Enable "Web Analytics"
3. Free tier includes:
   - Page views
   - Unique visitors
   - Top pages
   - Geographic data
   - Device breakdown

### **Google Analytics 4** (Optional)

**Setup:**
1. Create Google Analytics account
2. Create GA4 property
3. Get Measurement ID (e.g., `G-XXXXXXXXXX`)
4. Add to `app/layout.tsx`:
   ```tsx
   <Script src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`} />
   ```

### **Error Tracking (Sentry)** (Optional)

For production error monitoring:
1. Sign up at [https://sentry.io](https://sentry.io)
2. Install: `npm install @sentry/nextjs`
3. Configure: `npx @sentry/wizard -i nextjs`
4. Captures all runtime errors automatically

---

## 💰 Monthly Cost Estimate

### **For Small Store (< 500 orders/month)**

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Vercel/Cloudflare Pages** | Hobby plan | **₹0** |
| **Neon Database** | 512 MB, 3 GB storage | **₹0** |
| **Cloudinary** | 25 GB storage/bandwidth | **₹0** |
| **Resend** | 3,000 emails/month | **₹0** |
| **2Factor** | Pay-as-you-go | **~₹50-100** |
| **Domain** | Annual renewal | **~₹1,000/year (~₹83/month)** |
| **Total** | | **~₹150/month** |

### **For Growing Store (1,000-2,000 orders/month)**

| Service | Plan | Cost |
|---------|------|------|
| **Vercel Pro** | More bandwidth | **$20/month (~₹1,650)** |
| **Neon** | Still FREE or Scale plan | **₹0 - ₹500** |
| **Cloudinary** | Still FREE or paid | **₹0 - $89/month** |
| **Resend** | Still FREE or Pro | **₹0 - $20/month** |
| **2Factor** | Pay-as-you-go | **~₹200-500** |
| **Total** | | **~₹2,500-4,000/month** |

**Still very affordable for an e-commerce business!**

---

## 🆘 Support & Resources

### **Service Support**

- **Vercel:** [https://vercel.com/support](https://vercel.com/support)
- **Cloudflare Pages:** [https://community.cloudflare.com](https://community.cloudflare.com)
- **Neon:** [https://neon.tech/docs](https://neon.tech/docs)
- **Cloudinary:** [https://support.cloudinary.com](https://support.cloudinary.com)
- **Resend:** [https://resend.com/docs](https://resend.com/docs)
- **2Factor:** [https://2factor.in/support](https://2factor.in/support)

### **Documentation**

- Vercel Deployment: [https://vercel.com/docs](https://vercel.com/docs)
- Cloudflare Pages: [https://developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- Neon Docs: [https://neon.tech/docs/introduction](https://neon.tech/docs/introduction)
- Cloudinary Docs: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- Resend Docs: [https://resend.com/docs/introduction](https://resend.com/docs/introduction)

---

**Last Updated:** December 13, 2025
**Version:** 2.0.0
**Maintained By:** Development Team
