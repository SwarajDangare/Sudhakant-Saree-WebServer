# CLAUDE.md - AI Assistant Guide for Sudhakant Sarees

> **Last Updated:** November 16, 2025
> **Project:** Sudhakant Sarees - Elegant Saree Marketplace
> **Stage:** Phase 2 Development (API Integration & Admin Panel)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Codebase Structure](#codebase-structure)
4. [Tech Stack](#tech-stack)
5. [Database Schema](#database-schema)
6. [Development Workflows](#development-workflows)
7. [Key Conventions & Patterns](#key-conventions--patterns)
8. [Component Architecture](#component-architecture)
9. [Styling Guidelines](#styling-guidelines)
10. [API Development](#api-development)
11. [Common Tasks](#common-tasks)
12. [Deployment](#deployment)
13. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Project Overview

**Sudhakant Sarees** is an e-commerce platform for traditional Indian sarees built with Next.js 14, featuring:

- **Frontend:** Fully responsive UI with custom design system
- **Backend:** PostgreSQL database (Neon) with Prisma ORM
- **Authentication:** NextAuth.js (infrastructure ready, not yet implemented)
- **Media:** Cloudinary integration for image management
- **Deployment:** Cloudflare Pages with Edge Runtime support

### Current Status

✅ **Completed:**
- UI/UX design and responsive layout
- Component architecture
- Database schema (Prisma models)
- Static routing and navigation
- Mock data for development
- Design system and branding

🚧 **In Progress:**
- API endpoints implementation
- Admin panel for product management
- Authentication system
- Real database integration
- Image upload functionality

---

## Quick Start

### Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with actual credentials

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

---

## Codebase Structure

```
/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx               # Root layout (Header + Footer)
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles + custom utilities
│   ├── about/page.tsx           # Static about page
│   ├── contact/page.tsx         # Contact form page
│   ├── products/[category]/     # Dynamic category pages
│   │   └── page.tsx             # Category filtering
│   └── product/[id]/            # Dynamic product detail pages
│       └── page.tsx             # Individual product view
│
├── components/                   # Reusable React components
│   ├── Header.tsx               # Navigation (desktop + mobile)
│   ├── Footer.tsx               # Footer with links
│   ├── Hero.tsx                 # Landing page hero
│   ├── CategorySection.tsx       # Category grid display
│   ├── FeaturedProducts.tsx      # Featured products section
│   ├── ProductCard.tsx           # Product card component
│   └── ProductDetailClient.tsx   # Product detail view
│
├── data/                         # Static data & mock content
│   ├── categories.ts            # Category definitions
│   └── mockProducts.ts          # Mock product database
│
├── types/                        # TypeScript type definitions
│   └── product.ts               # Product & color variant types
│
├── prisma/                       # Database ORM
│   └── schema.prisma            # Database models
│
├── public/                       # Static assets
│
└── Configuration Files
    ├── package.json             # Dependencies & scripts
    ├── tsconfig.json            # TypeScript config
    ├── tailwind.config.ts        # Tailwind theme
    ├── next.config.js            # Next.js config
    └── .env.example              # Environment template
```

---

## Tech Stack

### Core Framework
- **Next.js 14.0.0** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.2.0** - Type safety

### Database & ORM
- **Prisma 5.7.0** - Database ORM
- **PostgreSQL** - Database (hosted on Neon)
- **@prisma/client** - Prisma client

### Authentication
- **NextAuth.js 4.24.5** - Authentication framework
- **bcryptjs 2.4.3** - Password hashing

### Styling
- **Tailwind CSS 3.3.5** - Utility-first CSS
- **PostCSS 8.4.31** - CSS processing
- **Autoprefixer 10.4.16** - CSS vendor prefixes

### Forms & Validation
- **React Hook Form 7.48.2** - Form state management
- **Zod 3.22.4** - Schema validation
- **@hookform/resolvers 3.3.2** - Form validation integration

### Media Management
- **Cloudinary 1.41.0** - Image hosting
- **next-cloudinary 5.11.0** - Next.js Cloudinary integration

### Development Tools
- **Node.js 18** - Runtime (see `.node-version`)
- **ESLint** - Code linting
- **Prisma Studio** - Database GUI

---

## Database Schema

### Entity Relationship Overview

```
Section (Level 1 Categories)
  ↓ one-to-many
Category (Level 2 Categories)
  ↓ one-to-many
Product
  ↓ one-to-many
  ├── ProductImage (multiple images)
  └── ProductColor (color variants)
        ↓ one-to-many
      ColorImage (images per color)

User (Admin Management)
```

### Key Models

#### User (Admin Management)
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         UserRole @default(PRODUCT_MANAGER)
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum UserRole {
  SUPER_ADMIN
  PRODUCT_MANAGER
}
```

#### Section (Top-level Categories)
```prisma
model Section {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String?
  order       Int        @default(0)
  active      Boolean    @default(true)
  categories  Category[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

#### Category
```prisma
model Category {
  id          String    @id @default(cuid())
  sectionId   String
  section     Section   @relation(fields: [sectionId], references: [id])
  name        String
  slug        String    @unique
  description String?
  order       Int       @default(0)
  active      Boolean   @default(true)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### Product (Core Entity)
```prisma
model Product {
  id               String         @id @default(cuid())
  categoryId       String
  category         Category       @relation(fields: [categoryId], references: [id])
  name             String
  description      String         @db.Text
  price            Decimal        @db.Decimal(10, 2)
  material         String?
  length           String?
  occasion         String?
  careInstructions String?        @db.Text
  featured         Boolean        @default(false)
  active           Boolean        @default(true)
  images           ProductImage[]
  colors           ProductColor[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt
}
```

#### ProductImage (Multiple Images per Product)
```prisma
model ProductImage {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url          String
  publicId     String   // Cloudinary public ID for deletion
  altText      String?
  displayOrder Int      @default(0)
  isPrimary    Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

#### ProductColor (Color Variants)
```prisma
model ProductColor {
  id        String       @id @default(cuid())
  productId String
  product   Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  color     String
  colorCode String       // Hex color code
  inStock   Boolean      @default(true)
  images    ColorImage[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}
```

#### ColorImage (Images for Each Color Variant)
```prisma
model ColorImage {
  id              String       @id @default(cuid())
  productColorId  String
  productColor    ProductColor @relation(fields: [productColorId], references: [id], onDelete: Cascade)
  url             String
  publicId        String       // Cloudinary public ID
  altText         String?
  displayOrder    Int          @default(0)
  createdAt       DateTime     @default(now())
}
```

### Database Operations

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio (GUI database browser)
npm run db:studio
```

---

## Development Workflows

### 1. Adding a New Feature

```bash
# 1. Create feature branch (if applicable)
git checkout -b feature/your-feature-name

# 2. Make changes
# 3. Test locally
npm run dev

# 4. Lint code
npm run lint

# 5. Build to check for errors
npm run build

# 6. Commit and push
git add .
git commit -m "Add feature: description"
git push origin feature/your-feature-name
```

### 2. Database Schema Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate new Prisma client
npm run db:generate

# 3. Push changes to database
npm run db:push

# 4. Verify in Prisma Studio
npm run db:studio
```

### 3. Adding a New Component

```typescript
// 1. Create component file in /components
// components/MyComponent.tsx

'use client' // Only if client-side interactivity needed

interface MyComponentProps {
  title: string
  // ... other props
}

export default function MyComponent({ title }: MyComponentProps) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}

// 2. Import and use in pages
import MyComponent from '@/components/MyComponent'
```

### 4. Creating API Routes

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Create this utility

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        images: true,
        colors: { include: { images: true } },
        category: true
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests
}
```

---

## Key Conventions & Patterns

### TypeScript Path Aliases

Use `@/` prefix for imports from the root directory:

```typescript
// ✅ Good
import Header from '@/components/Header'
import { Product } from '@/types/product'
import { categories } from '@/data/categories'

// ❌ Avoid
import Header from '../../../components/Header'
```

### Server vs Client Components

**Default to Server Components** unless you need:
- Client-side state (useState, useReducer)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useEffect, useContext)

```typescript
// Server Component (default)
export default function ProductList() {
  // No 'use client' directive
  return <div>...</div>
}

// Client Component
'use client'

import { useState } from 'react'

export default function ProductCard() {
  const [selected, setSelected] = useState(false)
  return <div onClick={() => setSelected(!selected)}>...</div>
}
```

### Component Props Interface Naming

```typescript
// Pattern: [ComponentName]Props
interface ProductCardProps {
  product: Product
  onSelect?: () => void
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  // ...
}
```

### Dynamic Routes with Static Generation

```typescript
// app/products/[category]/page.tsx

// Generate static paths at build time
export async function generateStaticParams() {
  return [
    { category: 'silk' },
    { category: 'cotton' },
    { category: 'banarasi' },
    { category: 'kanjivaram' },
    { category: 'patola' }
  ]
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { category: string } }) {
  return {
    title: `${params.category} Sarees | Sudhakant Sarees`,
    description: `Browse our collection of ${params.category} sarees`
  }
}

// Page component
export default function CategoryPage({ params }: { params: { category: string } }) {
  // ...
}
```

### Edge Runtime Support

For Cloudflare Pages compatibility:

```typescript
// Add to page components or API routes
export const runtime = 'edge'
```

### Error Handling

```typescript
import { notFound } from 'next/navigation'

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id)

  if (!product) {
    notFound() // Returns Next.js 404 page
  }

  return <div>{product.name}</div>
}
```

---

## Component Architecture

### Layout Components

**Header** (`components/Header.tsx`)
- Client component ('use client')
- Desktop navigation with category dropdowns
- Mobile hamburger menu with state management
- Responsive logo and branding

**Footer** (`components/Footer.tsx`)
- Server component
- Brand section with social links
- Quick links and category navigation
- Copyright information

### Page Section Components

**Hero** (`components/Hero.tsx`)
- Landing page hero section
- Gradient background with pattern overlay
- CTA buttons and statistics
- Decorative imagery

**CategorySection** (`components/CategorySection.tsx`)
- Server component
- Displays category grid (3 columns)
- Hover effects on cards
- Links to category pages

**FeaturedProducts** (`components/FeaturedProducts.tsx`)
- Server component
- Filters and displays featured products
- Responsive product grid
- "View All" CTA

### Product Components

**ProductCard** (`components/ProductCard.tsx`)
- Client component for interactivity
- Color variant selection
- Stock status indicator
- Price display with formatting
- Category badge
- Hover effects

**ProductDetailClient** (`components/ProductDetailClient.tsx`)
- Client component for color selection
- Breadcrumb navigation
- Large product image display
- Color thumbnail grid
- Product details and specifications
- Care instructions
- Add to cart button
- Related products link

---

## Styling Guidelines

### Design System Colors

Defined in `tailwind.config.ts` and available as Tailwind classes:

```typescript
// Primary Colors
'maroon': '#800000'      // Primary brand color
'saffron': '#FF9933'     // Accent color
'golden': '#FFD700'      // Highlight/luxury color

// Supporting Colors
'silk-white': '#FFF8DC'  // Background
'indian-green': '#138808'
'indian-red': '#CD5C5C'
'deep-maroon': '#5C0A0A'
```

Usage:
```tsx
<div className="bg-maroon text-silk-white border-golden">
  {/* Content */}
</div>
```

### Custom CSS Utilities

Defined in `app/globals.css`:

```css
/* Pattern overlay background */
.pattern-bg { /* diagonal stripes */ }

/* Golden border with glow effect */
.golden-border { /* border + shadow */ }

/* Gradient text effect */
.text-gradient { /* maroon to saffron */ }

/* Card hover effect */
.card-hover { /* scale + shadow */ }

/* Primary button */
.btn-primary { /* maroon bg, saffron hover */ }

/* Secondary button */
.btn-secondary { /* bordered variant */ }

/* Section spacing */
.section-padding { /* responsive padding */ }

/* Decorative divider */
.ornament-divider { /* golden gradient lines */ }
```

### Typography

**Font:** Poppins (Google Fonts)
**Weights:** 300, 400, 500, 600, 700

```tsx
// Applied globally via layout.tsx
<html className={poppins.variable}>
```

### Responsive Design

Mobile-first approach with Tailwind breakpoints:

```tsx
<div className="
  grid
  grid-cols-1           /* Mobile: 1 column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  gap-4
  md:gap-6
  lg:gap-8
">
  {/* Grid items */}
</div>
```

### Gradient Backgrounds

```tsx
// Common pattern in hero sections
<div className="bg-gradient-to-br from-maroon via-indian-red to-saffron">
  {/* Content */}
</div>
```

---

## API Development

### API Route Structure (To Be Implemented)

```
app/api/
├── products/
│   ├── route.ts              # GET all, POST new
│   ├── [id]/route.ts         # GET, PUT, DELETE by ID
│   └── featured/route.ts     # GET featured products
├── categories/
│   ├── route.ts              # GET all, POST new
│   └── [slug]/route.ts       # GET, PUT, DELETE by slug
├── auth/
│   └── [...nextauth]/route.ts # NextAuth.js handler
└── upload/
    └── route.ts              # Cloudinary image upload
```

### Prisma Client Setup

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### Example API Patterns

**Fetching with Relations:**
```typescript
const product = await prisma.product.findUnique({
  where: { id: productId },
  include: {
    category: true,
    images: {
      orderBy: { displayOrder: 'asc' }
    },
    colors: {
      include: { images: true }
    }
  }
})
```

**Creating with Relations:**
```typescript
const product = await prisma.product.create({
  data: {
    name: 'Beautiful Silk Saree',
    price: 5999,
    categoryId: categoryId,
    images: {
      create: [
        { url: 'https://...', publicId: 'abc123', isPrimary: true }
      ]
    },
    colors: {
      create: [
        { color: 'Red', colorCode: '#FF0000', inStock: true }
      ]
    }
  }
})
```

---

## Common Tasks

### Add a New Category

1. Update database:
```typescript
await prisma.category.create({
  data: {
    name: 'Designer Sarees',
    slug: 'designer',
    sectionId: sectionId, // Get from Section table
    description: 'Exclusive designer collection',
    order: 6,
    active: true
  }
})
```

2. Update `data/categories.ts` if using mock data
3. Update navigation in `components/Header.tsx`
4. Create route in `app/products/designer/page.tsx`

### Add a New Product

```typescript
await prisma.product.create({
  data: {
    name: 'Elegant Banarasi Silk',
    description: 'Handwoven pure silk saree...',
    price: 8999.00,
    categoryId: categoryId,
    material: 'Pure Silk',
    length: '6.5 meters',
    occasion: 'Wedding, Festival',
    careInstructions: 'Dry clean only',
    featured: true,
    active: true,
    images: {
      create: [
        {
          url: 'https://res.cloudinary.com/...',
          publicId: 'sarees/product-1',
          altText: 'Banarasi silk saree',
          displayOrder: 0,
          isPrimary: true
        }
      ]
    },
    colors: {
      create: [
        {
          color: 'Royal Blue',
          colorCode: '#4169E1',
          inStock: true,
          images: {
            create: [
              {
                url: 'https://res.cloudinary.com/...',
                publicId: 'sarees/product-1-blue',
                altText: 'Royal blue variant',
                displayOrder: 0
              }
            ]
          }
        }
      ]
    }
  }
})
```

### Upload Image to Cloudinary

```typescript
// Using next-cloudinary
import { CldUploadWidget } from 'next-cloudinary'

<CldUploadWidget
  uploadPreset="your_preset"
  onSuccess={(result) => {
    const { public_id, secure_url } = result.info
    // Save to database
  }}
>
  {({ open }) => (
    <button onClick={() => open()}>Upload Image</button>
  )}
</CldUploadWidget>
```

### Create a Form with Validation

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type FormData = z.infer<typeof formSchema>

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: FormData) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    // Handle response
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      {/* Other fields */}
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## Deployment

### Cloudflare Pages Configuration

**Build Settings:**
- **Build Command:** `npm run build`
- **Build Output Directory:** `.next`
- **Node Version:** 18 (specified in `.node-version`)

**Environment Variables to Set:**
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Edge Runtime

Add to pages/routes for Cloudflare compatibility:
```typescript
export const runtime = 'edge'
```

### Build Validation

Before deploying:
```bash
# Check for TypeScript errors
npm run build

# Check for linting issues
npm run lint

# Ensure Prisma client is generated
npm run db:generate
```

---

## Important Notes for AI Assistants

### What to Check Before Making Changes

1. **Read existing code patterns** - This project has established conventions
2. **Check TypeScript types** - Maintain type safety throughout
3. **Server vs Client components** - Use 'use client' only when necessary
4. **Database schema** - Check Prisma schema before data operations
5. **Responsive design** - Test mobile, tablet, and desktop layouts
6. **Color scheme** - Use defined brand colors from config
7. **Edge runtime** - Ensure compatibility with Cloudflare Pages

### Common Pitfalls to Avoid

❌ **Don't:**
- Use relative imports when `@/` alias is available
- Create client components unnecessarily (default to server)
- Hardcode colors instead of using Tailwind classes
- Ignore TypeScript errors
- Skip Prisma client generation after schema changes
- Commit `.env` file (use `.env.example` as template)
- Use `force push` to main branches

✅ **Do:**
- Follow existing naming conventions
- Use TypeScript interfaces for all props
- Maintain responsive design patterns
- Test database queries in Prisma Studio
- Generate static params for dynamic routes
- Handle errors gracefully with try-catch
- Use existing utility classes before creating new ones

### Code Quality Standards

- **TypeScript:** Strict mode enabled - no `any` types
- **Linting:** Run `npm run lint` before committing
- **Formatting:** Follow existing code style
- **Comments:** Add JSDoc comments for complex functions
- **Error Handling:** Always handle potential errors in API routes
- **Performance:** Use Next.js Image component for images
- **Security:** Sanitize user inputs, use environment variables for secrets

### Files You Should Read First

When starting a new task:

1. **Relevant page:** `app/[route]/page.tsx`
2. **Related components:** `components/[Component].tsx`
3. **Type definitions:** `types/product.ts`
4. **Database schema:** `prisma/schema.prisma`
5. **Styles:** `app/globals.css` and `tailwind.config.ts`

### Getting Help

- **Next.js 14 Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **NextAuth.js:** https://next-auth.js.org/
- **Cloudinary:** https://cloudinary.com/documentation/nextjs_integration

---

## Project Roadmap (For Context)

### Phase 1: Foundation ✅
- [x] UI/UX Design
- [x] Component Architecture
- [x] Database Schema
- [x] Mock Data Setup

### Phase 2: Backend Integration 🚧
- [ ] API Routes Implementation
- [ ] Database Integration
- [ ] Image Upload System
- [ ] Authentication System
- [ ] Form Validation

### Phase 3: Admin Panel (Upcoming)
- [ ] Admin Dashboard
- [ ] Product Management CRUD
- [ ] Category Management
- [ ] User Management
- [ ] Image Management

### Phase 4: E-Commerce Features (Upcoming)
- [ ] Shopping Cart
- [ ] Checkout Flow
- [ ] Order Management
- [ ] Payment Integration
- [ ] Email Notifications

---

## Contact & Support

For questions about this codebase:
- Check this CLAUDE.md file first
- Review the README.md for general project info
- Examine existing code patterns before implementing new features
- Test changes locally before committing

**Remember:** This is a production-ready e-commerce platform. Maintain high code quality and test thoroughly!

---

*Last updated by AI Assistant on November 16, 2025*
