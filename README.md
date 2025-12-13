# Sudhakant Sarees - Elegant Indian Saree Marketplace

> A beautiful, full-featured e-commerce platform for traditional Indian sarees built with Next.js 14, PostgreSQL, and modern web technologies.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech/)

---

## 🎯 What Is This?

**Sudhakant Sarees** is a production-ready e-commerce platform featuring:

- 🛍️ **Customer Storefront** - Browse products, filter by category/color/price, add to cart, checkout
- 🎨 **Dynamic Homepage** - Fully customizable via admin panel (11 sections)
- 📦 **Order Management** - Complete order lifecycle from placement to delivery
- 👨‍💼 **Admin Panel** - Product management, customer management, order tracking, content management
- 🔐 **Authentication** - Phone-based (OTP) for customers, email-based for admins
- 📧 **Email Notifications** - Automated order confirmations and status updates
- 🖼️ **Image Management** - Cloudinary integration for fast, optimized images
- 📱 **Fully Responsive** - Mobile-first design with beautiful UI

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- npm or yarn
- PostgreSQL database (we use [Neon](https://neon.tech))

### **Installation**

```bash
# 1. Clone the repository
git clone <repository-url>
cd Sudhakant-Saree-WebServer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual credentials

# 4. Run database migrations
npm run db:migrate

# 5. Seed the database
npm run db:seed
npm run db:seed-permissions
npm run db:seed-homepage

# 6. Start development server
npm run dev
```

Visit `http://localhost:3000` to see the customer-facing site.
Visit `http://localhost:3000/admin` to access the admin panel.

---

## 📚 Documentation

### **For New Developers:**
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Complete project overview, features, tech stack, and getting started guide

### **For Deployment:**
- **[INFRASTRUCTURE_GUIDE.md](./INFRASTRUCTURE_GUIDE.md)** - Hosting, database, Cloudinary, email setup, and deployment instructions

### **For Development:**
- **[CLAUDE.md](./CLAUDE.md)** - Detailed guide for AI assistants (covers all technical implementation details)
- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Database setup and initial configuration

### **For Specific Features:**
- **[PERMISSIONS_GUIDE.md](./PERMISSIONS_GUIDE.md)** - Role-based permission system guide
- **[USER_MANAGEMENT_GUIDE.md](./USER_MANAGEMENT_GUIDE.md)** - Admin user management guide
- **[CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md)** - Cloudinary image hosting setup
- **[EMAIL_SETUP.md](./EMAIL_SETUP.md)** - Email notification setup (Resend)
- **[WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)** - WhatsApp integration guide

---

## 🏗️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS 3
- React Hook Form + Zod

**Backend:**
- PostgreSQL (Neon)
- Drizzle ORM
- NextAuth.js
- Cloudinary (images)
- Resend (emails)
- 2Factor (SMS OTP)

**Deployment:**
- Vercel or Cloudflare Pages (recommended)
- Edge Runtime compatible

---

## 🎨 Design

**Color Theme:**
- Maroon (#800000) - Primary brand color
- Saffron (#FF9933) - Accent/CTA color
- Golden (#FFD700) - Luxury highlights
- Silk White (#FFF8DC) - Backgrounds

**Typography:**
- Font: Poppins (Google Fonts)
- Weights: 300, 400, 500, 600, 700

**Responsive:**
- Mobile-first design
- Breakpoints: 768px (tablet), 1024px (desktop)

---

## 📦 Key Features

### **Customer Features**
✅ Browse products with advanced filtering (category, color, material, price)
✅ Product detail pages with color variants and zoom
✅ Shopping cart with persistent sessions
✅ Phone-based authentication (SMS OTP)
✅ Address management (multiple addresses)
✅ Order placement and tracking
✅ Order history in customer profile
✅ Responsive design (mobile, tablet, desktop)

### **Admin Features**
✅ Complete product management (CRUD with color variants)
✅ Category & section hierarchy
✅ Order management with status updates
✅ Customer management
✅ Homepage content management (11 customizable sections)
✅ User management with role-based permissions
✅ Email OTP verification for admins
✅ Cloudinary image uploads
✅ Email notifications for orders

### **Technical Features**
✅ Server-side rendering (SSR) with Next.js
✅ Database ORM with Drizzle
✅ Role-based access control (3 roles, 23 permissions)
✅ Email notifications (Resend)
✅ SMS OTP (2Factor)
✅ CDN image hosting (Cloudinary)
✅ Edge Runtime compatible
✅ TypeScript for type safety
✅ Form validation with Zod

---

## 📊 Project Status

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 1:** Foundation | ✅ Complete | 100% |
| **Phase 2:** Backend Integration | ✅ Complete | 100% |
| **Phase 3:** Admin Panel | ✅ Complete | 100% |
| **Phase 4:** E-Commerce Features | ✅ Complete | 100% |
| **Phase 5:** Production Deployment | 🚧 In Progress | 70% |
| **Phase 6:** Advanced Features | 📋 Planned | 0% |

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for detailed status.

---

## 🗄️ Database

**27 tables** organized into:
- Admin & Authentication (5 tables)
- Customer Management (2 tables)
- Product Catalog (8 tables)
- Shopping & Orders (4 tables)
- Homepage Content (11 tables)

**ORM:** Drizzle ORM for type-safe database access

**Migrations:** Located in `db/migrations/`

**Seeding:**
```bash
npm run db:seed              # Products and categories
npm run db:seed-permissions  # Permission system
npm run db:seed-homepage     # Homepage content
```

---

## 📜 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Lint code

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Drizzle Studio GUI
npm run db:seed          # Seed database
npm run db:hash-password <password>  # Generate password hash
```

---

## 🚀 Deployment

This project can be deployed to:
- **Vercel** (recommended) - [vercel.com](https://vercel.com)
- **Cloudflare Pages** - [pages.cloudflare.com](https://pages.cloudflare.com)
- **Any Node.js hosting** that supports Next.js

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Node.js Version: 18.x

See [INFRASTRUCTURE_GUIDE.md](./INFRASTRUCTURE_GUIDE.md) for detailed deployment instructions.

---

## 🌟 Screenshots

### **Homepage**
Dynamic homepage with customizable sections (banners, categories, collections, bestsellers, etc.)

### **Product Catalog**
Advanced filtering by category, color, material, price range with responsive grid/list views.

### **Admin Panel**
Complete product management, order tracking, customer management, and content management.

### **Mobile Responsive**
Beautiful mobile experience with touch-friendly navigation and optimized layouts.

---

## 🔒 Environment Variables

Create a `.env` file with these variables:

```env
# Database (Neon)
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Cloudinary (Images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Resend (Email)
RESEND_API_KEY="re_..."
EMAIL_FROM="Sudhakant Sarees <orders@example.com>"

# 2Factor (SMS OTP)
TWOFACTOR_API_KEY="your-api-key"

# Optional
NEXT_PUBLIC_WHATSAPP_NUMBER="919876543210"
```

See `.env.example` for full template and [INFRASTRUCTURE_GUIDE.md](./INFRASTRUCTURE_GUIDE.md) for setup instructions.

---

## 🤝 Contributing

This is a private project for Sudhakant Sarees. For team members:

1. Always work on the `dev` branch for new features
2. Create feature branches from `dev`
3. Test thoroughly before merging to `dev`
4. Only merge `dev` → `main` for production deployments
5. Follow existing code patterns and conventions

---

## 📄 License

© 2025 Sudhakant Sarees. All rights reserved.

---

## 📞 Support

For questions or issues:
- Check documentation in `/docs` folder
- Review [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for project details
- Review [INFRASTRUCTURE_GUIDE.md](./INFRASTRUCTURE_GUIDE.md) for deployment help
- Contact the development team

---

## 🎯 Next Steps

**For New Developers:**
1. Read [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
2. Set up your development environment
3. Run the project locally
4. Explore the admin panel
5. Review the codebase structure

**For Deployment:**
1. Read [INFRASTRUCTURE_GUIDE.md](./INFRASTRUCTURE_GUIDE.md)
2. Set up external services (Neon, Cloudinary, Resend, 2Factor)
3. Configure environment variables
4. Deploy to Vercel or Cloudflare Pages
5. Set up custom domain

---

**Built with ❤️ for Sudhakant Sarees**
