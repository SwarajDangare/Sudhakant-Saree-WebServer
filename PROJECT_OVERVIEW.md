# Sudhakant Sarees - Project Overview

> **Last Updated:** December 13, 2025
> **Current Branch:** `dev`
> **Status:** Phase 4 - E-Commerce Features Complete, Phase 5 - Production Deployment In Progress

---

## 🚀 What Is This Project?

**Sudhakant Sarees** is a full-stack e-commerce platform for selling traditional Indian sarees online. Built with modern web technologies, it features a beautiful customer-facing storefront, a comprehensive admin panel, and a complete order management system.

### Key Features

✅ **Customer Features:**
- Browse products with advanced filtering (categories, colors, materials, price range)
- Product detail pages with color variants and multiple images
- Shopping cart with persistent sessions
- Checkout flow with address management
- Phone-based authentication (OTP via SMS)
- Order tracking and history
- Responsive design (mobile, tablet, desktop)

✅ **Admin Features:**
- Complete product management (CRUD with color variants)
- Category & section hierarchy management
- Order management with status updates
- Customer management
- Homepage content management (banners, collections, featured products)
- User management with role-based permissions (Super Admin, Shop Manager, Salesman)
- Email notifications for order updates
- Cloudinary image upload integration

✅ **Technical Features:**
- Server-side rendering with Next.js 14
- PostgreSQL database with Drizzle ORM
- JWT-based authentication (NextAuth.js)
- Email notifications (Resend)
- SMS OTP verification (2Factor API)
- CDN image hosting (Cloudinary)
- Edge runtime compatible

---

## 📊 Current Project Status

### ✅ Completed Phases

#### **Phase 1: Foundation** (100% Complete)
- [x] UI/UX design with Maroon, Saffron, and Golden color theme
- [x] Component architecture (Server + Client components)
- [x] Database schema design with Drizzle ORM
- [x] Responsive layout (mobile-first approach)
- [x] Migration from Prisma to Drizzle ORM

#### **Phase 2: Backend Integration** (100% Complete)
- [x] PostgreSQL database hosted on Neon
- [x] Drizzle ORM with full schema
- [x] Complete API routes (Products, Categories, Sections, Orders, Customers, Cart, Addresses)
- [x] Authentication system (NextAuth.js with JWT)
- [x] Form validation (React Hook Form + Zod)
- [x] Image upload system (Cloudinary)
- [x] Email OTP verification for admin users
- [x] Lazy database initialization for Edge Runtime

#### **Phase 3: Admin Panel** (100% Complete)
- [x] Admin dashboard with statistics
- [x] Product management (CRUD with color variants and multiple images)
- [x] Category & section management
- [x] Order management with status tracking
- [x] Customer management
- [x] User management with role-based permissions
- [x] Permission system (23 permissions across 6 categories)
- [x] Email notifications for orders
- [x] Homepage content management (11 customizable sections)

#### **Phase 4: E-Commerce Features** (100% Complete)
- [x] Customer-facing homepage with dynamic content
- [x] Product catalog page with advanced filtering
- [x] Product detail pages with color selection
- [x] Shopping cart (backend + frontend)
- [x] Checkout flow with address management
- [x] Phone-based customer authentication (SMS OTP)
- [x] Order placement system
- [x] Email notifications (order confirmations, status updates)
- [x] Customer profile page with order history

### 🚧 In Progress

#### **Phase 5: Production Deployment** (70% Complete)
- [x] Environment configuration
- [x] Edge Runtime compatibility
- [x] Build optimization
- [ ] Custom domain setup
- [ ] SSL/HTTPS configuration
- [ ] Production database finalization
- [ ] Performance optimization (caching, image optimization)
- [ ] SEO optimization (metadata, sitemaps)
- [ ] Analytics integration

### 📋 Future Enhancements (Planned)

#### **Phase 6: Advanced Features**
- [ ] Payment gateway integration (Razorpay/Stripe for COD, UPI, Card, Net Banking)
- [ ] Invoice generation (PDF)
- [ ] WhatsApp notifications (via WhatsApp Business API)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Product search with autocomplete
- [ ] Bulk product upload (CSV/Excel import)
- [ ] Inventory management with stock alerts
- [ ] Sales reports and analytics dashboard
- [ ] Customer loyalty program
- [ ] Multi-language support (Hindi, English)
- [ ] PWA features (offline support, push notifications)

---

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 14.2.33** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.2.0** - Type safety
- **Tailwind CSS 3.3.5** - Utility-first styling
- **React Hook Form 7.48.2** - Form management
- **Zod 3.22.4** - Schema validation

### **Backend**
- **PostgreSQL** - Relational database (hosted on Neon)
- **Drizzle ORM 0.44.7** - Type-safe database ORM
- **NextAuth.js 4.24.13** - Authentication framework
- **bcryptjs 2.4.3** - Password hashing

### **External Services**
- **Neon** - Managed PostgreSQL hosting
- **Cloudinary** - Image hosting and CDN
- **Resend** - Email notifications (FREE for 3,000 emails/month)
- **2Factor** - SMS OTP verification

### **Development Tools**
- **Drizzle Kit 0.31.7** - Database migrations
- **tsx 4.20.6** - TypeScript execution
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📁 Project Structure

```
Sudhakant-Saree-WebServer/
├── app/                              # Next.js 14 App Router
│   ├── (shop)/                       # Customer-facing pages
│   │   ├── page.tsx                  # Homepage
│   │   ├── shop/                     # Product catalog
│   │   ├── product/[id]/             # Product detail pages
│   │   ├── cart/                     # Shopping cart
│   │   ├── checkout/                 # Checkout flow
│   │   └── profile/                  # Customer profile
│   ├── admin/                        # Admin panel
│   │   ├── dashboard/                # Admin dashboard
│   │   ├── products/                 # Product management
│   │   ├── categories/               # Category management
│   │   ├── sections/                 # Section management
│   │   ├── orders/                   # Order management
│   │   ├── customers/                # Customer management
│   │   ├── users/                    # Admin user management
│   │   └── homepage/                 # Homepage content management
│   ├── api/                          # API routes
│   │   ├── admin/                    # Admin API endpoints
│   │   ├── auth/                     # Authentication
│   │   ├── cart/                     # Shopping cart
│   │   ├── customers/                # Customer management
│   │   ├── email/                    # Email notifications
│   │   ├── homepage/                 # Homepage content
│   │   ├── orders/                   # Order processing
│   │   ├── phone/                    # Phone OTP
│   │   └── products/                 # Product data
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
│
├── components/                       # Reusable React components
│   ├── Header.tsx                    # Main navigation
│   ├── Footer.tsx                    # Site footer
│   ├── ProductCard.tsx               # Product card
│   ├── ShopByCategory.tsx            # Category grid
│   ├── BestsellerProducts.tsx        # Bestsellers section
│   └── ...                           # 30+ components
│
├── db/                               # Database
│   ├── schema/                       # Drizzle ORM schema
│   │   └── index.ts                  # All table definitions
│   ├── migrations/                   # SQL migration files
│   ├── migrate.ts                    # Migration runner
│   ├── seed.ts                       # Database seeding
│   └── generate-password.ts          # Password hashing utility
│
├── lib/                              # Utility libraries
│   ├── auth.ts                       # NextAuth configuration
│   ├── db.ts                         # Database connection
│   ├── email.ts                      # Email sending functions
│   ├── permissions.ts                # Permission definitions
│   └── permission-guards.ts          # API permission guards
│
├── types/                            # TypeScript types
│   └── product.ts                    # Product type definitions
│
├── scripts/                          # Utility scripts
│   └── seed-homepage.ts              # Homepage seeding
│
├── public/                           # Static assets
│
└── Configuration Files
    ├── package.json                  # Dependencies
    ├── tsconfig.json                 # TypeScript config
    ├── tailwind.config.ts            # Tailwind theme
    ├── next.config.js                # Next.js config
    ├── drizzle.config.ts             # Drizzle ORM config
    ├── .env                          # Environment variables (NOT in Git)
    └── .env.example                  # Environment template
```

---

## 🗄️ Database Schema

### **Tables Overview** (27 tables)

#### **Admin & Authentication**
- `users` - Admin users with role-based access
- `email_otps` - Email verification OTPs
- `permissions` - 23 system permissions
- `role_permissions` - Role-to-permission mappings
- `user_permissions` - User-specific permission overrides

#### **Customer Management**
- `customers` - Customer accounts (phone-based)
- `addresses` - Customer delivery addresses

#### **Product Catalog**
- `sections` - Top-level categories (e.g., "Traditional Sarees")
- `categories` - Sub-categories (e.g., "Silk Sarees", "Cotton Sarees")
- `products` - Product catalog (name, price, description, etc.)
- `product_images` - Multiple images per product
- `product_colors` - Color variants
- `color_images` - Images for each color variant

#### **Shopping & Orders**
- `carts` - Shopping carts (customer or session-based)
- `cart_items` - Items in shopping carts
- `orders` - Customer orders
- `order_items` - Line items in orders

#### **Homepage Content** (11 tables)
- `homepage_sections` - Control section visibility/order
- `announcements` - Promotional banner messages
- `hero_banners` - Homepage hero banners
- `featured_collections` - Curated product collections
- `occasions` - Shop by occasion cards
- `mid_page_banner` - Mid-page promotional banner
- `brand_story` - Brand heritage section
- `brand_story_stats` - Statistics for brand story
- `instagram_posts` - Instagram feed integration
- `instagram_settings` - Instagram account settings
- `trust_badges` - Trust/features section

### **Entity Relationships**

```
Section (1) ──► (Many) Category
Category (1) ──► (Many) Product
Product (1) ──► (Many) ProductImage
Product (1) ──► (Many) ProductColor
ProductColor (1) ──► (Many) ColorImage

Customer (1) ──► (Many) Address
Customer (1) ──► (1) Cart
Cart (1) ──► (Many) CartItem
CartItem (Many) ──► (1) Product
CartItem (Many) ──► (1) ProductColor (optional)

Customer (1) ──► (Many) Order
Order (1) ──► (Many) OrderItem
OrderItem (Many) ──► (1) Product
Order (Many) ──► (1) Address

User (1) ──► (Many) UserPermission
Permission (1) ──► (Many) RolePermission
Permission (1) ──► (Many) UserPermission
```

---

## 🔐 Authentication & Permissions

### **Admin Authentication (NextAuth.js)**
- Email + password login
- Email OTP verification for new admins
- JWT session tokens
- Secure password hashing with bcryptjs

### **Customer Authentication (Phone-based)**
- Phone number + OTP login
- SMS OTP via 2Factor API
- Session-based authentication
- No passwords required

### **Role-Based Access Control**

#### **Three Admin Roles:**

**1. SUPER_ADMIN** (Full Access)
- Manage all admin users
- Full CRUD on all resources
- Access to all analytics and reports
- System configuration

**2. SHOP_MANAGER** (Product & Order Management)
- Full product management
- Full order management
- View/edit categories and sections
- View customer data
- Cannot manage admin users

**3. SALESMAN** (Limited Access)
- Add/edit products (cannot delete)
- View active orders (cannot update status)
- Cannot access customer personal info
- Cannot manage categories or users

#### **23 Granular Permissions:**
Permissions are organized into 6 categories:
- **Dashboard** (2): View dashboard, View financials
- **Products** (4): View, Create, Edit, Delete
- **Orders** (4): View, View all, Update, Delete
- **Catalog** (4): View categories, Manage categories, View sections, Manage sections
- **Customers** (3): View, Edit, Delete
- **System** (4): View users, Manage users, Manage permissions, System settings

User-specific permission overrides allow fine-grained access control.

---

## 🎨 Design System

### **Color Palette**
```css
--maroon: #800000        /* Primary brand color */
--saffron: #FF9933       /* Accent/CTA color */
--golden: #FFD700        /* Luxury/highlight */
--deep-maroon: #5C0A0A   /* Dark variant */
--silk-white: #FFF8DC    /* Background */
--indian-green: #138808  /* Success states */
--indian-red: #CD5C5C    /* Error states */
```

### **Typography**
- **Font:** Poppins (Google Fonts)
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)

### **Custom CSS Utilities**
- `.pattern-bg` - Diagonal stripe pattern overlay
- `.golden-border` - Border with golden glow effect
- `.text-gradient` - Maroon to Saffron gradient text
- `.card-hover` - Scale + shadow on hover
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.section-padding` - Responsive padding
- `.ornament-divider` - Decorative golden divider

### **Responsive Breakpoints**
- Mobile: `< 768px` (1 column)
- Tablet: `768px - 1024px` (2 columns)
- Desktop: `> 1024px` (3-4 columns)

---

## 🚀 Getting Started (New Session)

### **1. Clone & Install**
```bash
git clone <repository-url>
cd Sudhakant-Saree-WebServer
git checkout dev
npm install
```

### **2. Environment Setup**
```bash
cp .env.example .env
# Edit .env with actual credentials (see INFRASTRUCTURE_GUIDE.md)
```

### **3. Database Setup**
```bash
# Apply migrations (or use Neon SQL Editor)
npm run db:migrate

# Seed initial data
npm run db:seed
npm run db:seed-permissions
npm run db:seed-homepage
```

### **4. Run Development Server**
```bash
npm run dev
# Visit http://localhost:3000
```

### **5. Access Admin Panel**
```
URL: http://localhost:3000/admin/login
Default Admin: (See .env or create via db:seed)
```

---

## 📦 Available NPM Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code

# Database
npm run db:generate      # Generate Drizzle migrations
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed          # Seed products/categories
npm run db:seed-permissions  # Seed permissions
npm run db:seed-homepage     # Seed homepage content
npm run db:hash-password <password>  # Generate password hash
```

---

## 🌟 Key Features Explained

### **1. Dynamic Homepage**
The homepage is fully customizable via the admin panel with 11 sections:
- Announcement bar (promotional messages)
- Hero banners (up to 3 rotating banners)
- Shop by category (featured categories)
- Featured collections
- Bestseller products
- Mid-page banner
- Shop by occasion
- New arrivals
- Brand story
- Instagram feed
- Trust badges

Each section can be toggled on/off and reordered via `homepage_sections` table.

### **2. Product Color Variants**
Products can have multiple color variants, each with its own:
- Color name and hex code
- Multiple images (with display order)
- Stock status
- Cloudinary-hosted images

### **3. Advanced Filtering (Shop Page)**
Customers can filter products by:
- **Categories** - Hierarchical section/category structure
- **Price Range** - Slider with min/max inputs
- **Colors** - Visual color swatches
- **Materials** - Silk, Cotton, Georgette, etc.
- **Occasions** - Wedding, Festival, Party, Casual
- **Work Types** - Handloom, Zari Work, Print, Embroidery
- **Status** - Blouse piece included, In stock, On sale

Filters are URL-persisted, allowing shareable filtered links.

### **4. Email Notifications**
Automated emails are sent for:
- Order confirmation (when order is placed)
- Order status updates (Confirmed, Processing, Shipped, Delivered, Cancelled)
- Welcome email (when customer signs up)

Templates use React Email components with brand styling.

### **5. Permission System**
Granular role-based + user-specific permissions:
- **Role Permissions:** Default permissions for each role
- **User Permissions:** Overrides for specific users
- **Permission Guards:** API route protection
- **UI Guards:** Conditional rendering based on permissions

---

## 🔧 Common Development Tasks

### **Add a New Product**
1. Go to `/admin/products`
2. Click "Add New Product"
3. Fill in details (name, description, price, category)
4. Add product images via Cloudinary upload
5. Add color variants with images
6. Mark as featured/bestseller/new arrival if needed
7. Save

### **Manage Homepage Content**
1. Go to `/admin/homepage`
2. Toggle section visibility
3. Edit individual sections (banners, collections, etc.)
4. Upload images via Cloudinary
5. Changes reflect immediately on homepage

### **Process an Order**
1. Go to `/admin/orders`
2. Find the order
3. Update status (Confirmed → Processing → Shipped → Delivered)
4. Customer receives email notification automatically
5. Add tracking number when shipped

### **Manage Admin Users**
1. Go to `/admin/users`
2. Create new user with role (Super Admin, Shop Manager, Salesman)
3. Send email verification OTP
4. Optionally override individual permissions
5. Toggle active/inactive status

---

## 🐛 Common Issues & Solutions

### **Database Connection Fails**
- Check `DATABASE_URL` in `.env`
- Verify Neon database is active
- Check network restrictions (use Neon SQL Editor if needed)

### **Images Not Uploading**
- Verify Cloudinary credentials in `.env`
- Check upload preset exists in Cloudinary dashboard
- Ensure preset is set to "Unsigned" mode

### **Email Notifications Not Sending**
- Verify `RESEND_API_KEY` in `.env`
- Check email domain verification in Resend dashboard
- Check console logs for error messages

### **Build Errors**
- Run `npm run build` to see TypeScript errors
- Check for missing environment variables
- Verify database schema is up to date

---

## 📚 Related Documentation

- **INFRASTRUCTURE_GUIDE.md** - Deployment, hosting, and external services setup
- **CLAUDE.md** - Detailed AI assistant guide (technical implementation details)

---

## 📞 Support & Resources

### **External Documentation**
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Resend Docs](https://resend.com/docs)

### **Quick Links**
- **Database:** [Neon Console](https://console.neon.tech)
- **Images:** [Cloudinary Dashboard](https://cloudinary.com/console)
- **Email:** [Resend Dashboard](https://resend.com/emails)
- **SMS:** [2Factor Dashboard](https://2factor.in/panel)

---

## ✅ Project Health Checklist

Use this checklist to verify the project is healthy:

- [ ] `npm install` runs without errors
- [ ] `npm run build` succeeds
- [ ] Database connection works (`npm run db:studio`)
- [ ] Admin login works
- [ ] Customer homepage loads
- [ ] Product images display
- [ ] Shopping cart works
- [ ] Checkout flow completes
- [ ] Email notifications send
- [ ] SMS OTP works

---

**Last Updated:** December 13, 2025
**Version:** 2.0.0
**Maintained By:** Development Team
