# Phase 2 Implementation Plan: Admin Management for Homepage Sections

> **Goal**: Make all 11 homepage sections fully admin-manageable with no code changes needed for content updates

## Table of Contents
1. [Overview](#overview)
2. [Database Schema Design](#database-schema-design)
3. [API Endpoints](#api-endpoints)
4. [Admin Panel Pages](#admin-panel-pages)
5. [Frontend Integration](#frontend-integration)
6. [Implementation Order](#implementation-order)
7. [Testing Strategy](#testing-strategy)

---

## Overview

### Current State (Phase 1)
- ✅ All 11 sections built with mock data
- ✅ Responsive design implemented
- ✅ Performance optimized (< 2s load time)
- ✅ HeroSlider already has database integration

### Phase 2 Goals
- [ ] Database tables for all sections
- [ ] CRUD API endpoints for each section
- [ ] Admin UI for managing all content
- [ ] Show/hide toggles for each section
- [ ] Image/video upload integration
- [ ] Homepage fetches from database
- [ ] Admin can update homepage in < 10 minutes

### Success Criteria
1. All section content editable from admin panel
2. Each section can be hidden/shown independently
3. Section order can be customized
4. No developer intervention needed for updates
5. Image/video uploads work seamlessly
6. Changes reflect on homepage immediately

---

## Database Schema Design

### 1. Homepage Sections Control Table

**Purpose**: Control visibility and order of all homepage sections

```typescript
// db/schema/homepageSections.ts
export const homepageSections = pgTable('homepage_sections', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  sectionKey: text('section_key').notNull().unique(), // 'hero_slider', 'promo_bar', etc.
  sectionName: text('section_name').notNull(), // Display name
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  description: text('description'), // For admin reference
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Initial Data**:
```sql
INSERT INTO homepage_sections (section_key, section_name, display_order, is_active) VALUES
  ('hero_slider', 'Hero Slider', 1, true),
  ('promo_bar', 'Announcement Bar', 2, true),
  ('shop_by_category', 'Shop by Category', 3, true),
  ('featured_collections', 'Featured Collections', 4, true),
  ('bestseller_products', 'Bestseller Products', 5, true),
  ('mid_page_banner', 'Mid-Page Banner', 6, true),
  ('shop_by_occasion', 'Shop by Occasion', 7, true),
  ('new_arrivals', 'New Arrivals', 8, true),
  ('brand_story', 'Brand Story', 9, true),
  ('instagram_feed', 'Instagram Feed', 10, true),
  ('trust_badges', 'Trust Badges', 11, true);
```

---

### 2. Promo Bar / Announcements

**Status**: ✅ HeroSlider already has `banners` table (can be reused or create new)

```typescript
// db/schema/announcements.ts
export const announcements = pgTable('announcements', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  text: text('text').notNull(),
  highlightText: text('highlight_text'), // Optional highlighted portion
  linkUrl: text('link_url'),
  linkText: text('link_text'),
  backgroundColor: text('background_color').default('#8B1538'), // Maroon
  textColor: text('text_color').default('#FFFFFF'),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Features**:
- Auto-rotate every 4 seconds
- Schedule announcements (start/end date)
- Custom colors
- Optional link
- Active/inactive status
- Display order

---

### 3. Shop by Category

**Status**: ⚠️ Uses existing `categories` table, needs enhancement

**Enhancement Needed**:
```typescript
// Add to existing categories table
featuredOnHome: boolean('featured_on_home').default(false),
homeDisplayOrder: integer('home_display_order'),
homeTagline: text('home_tagline'), // "Timeless Elegance"
homeDescription: text('home_description'), // "Handwoven pure silk sarees"
```

**Admin Features**:
- Select which 3 categories to show on homepage
- Customize tagline and description per category
- Upload/change category image
- Reorder categories

---

### 4. Featured Collections

**Status**: ❌ New table needed

```typescript
// db/schema/collections.ts
export const collections = pgTable('collections', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline'), // "Bridal Elegance"
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  imagePublicId: text('image_public_id').notNull(), // Cloudinary
  linkUrl: text('link_url').notNull(), // Where to redirect
  productsCount: integer('products_count').default(0),
  isFeatured: boolean('is_featured').default(false),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Admin Features**:
- Create/edit/delete collections
- Upload collection image (Cloudinary)
- Set tagline, description, link
- Mark as featured (max 2 for homepage)
- Reorder collections

---

### 5. Bestseller Products

**Status**: ⚠️ Uses existing `products` table, needs enhancement

**Enhancement Needed**:
```typescript
// Add to existing products table
isBestseller: boolean('is_bestseller').default(false),
bestsellerRank: integer('bestseller_rank'),
```

**Admin Features**:
- Toggle bestseller status on products
- Select which 4 products to show on homepage
- Automatic rank based on sales (future enhancement)
- Reorder bestsellers

---

### 6. Mid-Page Banner

**Status**: ❌ New table needed

```typescript
// db/schema/midPageBanner.ts
export const midPageBanner = pgTable('mid_page_banner', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  imagePublicId: text('image_public_id').notNull(),
  linkUrl: text('link_url'),
  linkText: text('link_text').default('Shop Now'),
  backgroundColor: text('background_color'),
  textColor: text('text_color').default('#FFFFFF'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Admin Features**:
- Single banner (only one active at a time)
- Upload banner image
- Customize title, subtitle, CTA
- Custom colors
- Active/inactive toggle

---

### 7. Shop by Occasion

**Status**: ❌ New table needed

```typescript
// db/schema/occasions.ts
export const occasions = pgTable('occasions', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(), // Emoji or icon code
  imageUrl: text('image_url').notNull(),
  imagePublicId: text('image_public_id').notNull(),
  gradientFrom: text('gradient_from').default('from-pink-600/80'),
  gradientTo: text('gradient_to').default('to-red-600/80'),
  linkUrl: text('link_url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Admin Features**:
- Create occasions (Wedding, Festival, Party, Casual, etc.)
- Upload occasion image
- Select icon/emoji
- Customize gradient colors
- Reorder occasions
- Max 4 occasions on homepage

---

### 8. New Arrivals

**Status**: ⚠️ Uses existing `products` table with date filtering

**Enhancement Needed**:
```typescript
// Add to existing products table
isNewArrival: boolean('is_new_arrival').default(false),
newArrivalUntil: timestamp('new_arrival_until'), // Auto-expire after X days
```

**Admin Features**:
- Toggle "New Arrival" status on products
- Set expiry date for new arrival badge
- Display 4 most recent products
- Manual selection override

---

### 9. Brand Story

**Status**: ❌ New table needed (single record)

```typescript
// db/schema/brandStory.ts
export const brandStory = pgTable('brand_story', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  heading: text('heading').notNull(),
  subtitle: text('subtitle'), // "About Us"
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  imagePublicId: text('image_public_id').notNull(),
  buttonText: text('button_text').default('Our Story'),
  buttonLink: text('button_link').default('/about'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const brandStoryStats = pgTable('brand_story_stats', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  brandStoryId: text('brand_story_id').references(() => brandStory.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // "Years of Heritage"
  value: text('value').notNull(), // "50+"
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Admin Features**:
- Single record (only one brand story)
- Edit heading, description
- Upload brand story image
- Manage 3 stats (label + value)
- Customize CTA button

---

### 10. Instagram Feed

**Status**: ❌ New table needed

```typescript
// db/schema/instagramPosts.ts
export const instagramPosts = pgTable('instagram_posts', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text('image_url').notNull(),
  imagePublicId: text('image_public_id').notNull(),
  postUrl: text('post_url').notNull(), // Instagram post link
  caption: text('caption'),
  likes: integer('likes').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  postedAt: timestamp('posted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const instagramSettings = pgTable('instagram_settings', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  instagramHandle: text('instagram_handle').default('@sudhakantsarees'),
  profileUrl: text('profile_url'),
  autoSync: boolean('auto_sync').default(false), // Future: Auto-fetch from Instagram API
  maxPosts: integer('max_posts').default(6),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Admin Features**:
- Upload Instagram post images manually
- Add post URL (links to Instagram)
- Manage up to 6 posts
- Customize Instagram handle
- Reorder posts
- Future: Auto-sync from Instagram API

---

### 11. Trust Badges / Features

**Status**: ❌ New table needed

```typescript
// db/schema/trustBadges.ts
export const trustBadges = pgTable('trust_badges', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(), // "FREE SHIPPING"
  description: text('description').notNull(),
  iconType: text('icon_type').notNull(), // 'shipping', 'payment', 'authentic', 'returns', 'custom'
  iconSvg: text('icon_svg'), // Custom SVG code if iconType is 'custom'
  isActive: boolean('is_active').default(true).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Admin Features**:
- Create/edit/delete trust badges
- Predefined icon options
- Custom icon upload (SVG)
- Max 4 badges on homepage
- Reorder badges

---

## API Endpoints

### Base Structure

All API endpoints follow RESTful conventions:

```
/api/admin/homepage/
  ├── sections/                  # GET, PUT (update order/visibility)
  ├── announcements/             # GET, POST, PUT, DELETE
  ├── collections/               # GET, POST, PUT, DELETE
  ├── occasions/                 # GET, POST, PUT, DELETE
  ├── mid-page-banner/           # GET, POST, PUT (single record)
  ├── brand-story/               # GET, POST, PUT (single record)
  ├── brand-story/stats/         # GET, POST, PUT, DELETE
  ├── instagram-posts/           # GET, POST, PUT, DELETE
  ├── instagram-settings/        # GET, PUT (single record)
  └── trust-badges/              # GET, POST, PUT, DELETE

/api/homepage/
  ├── sections/                  # GET (public - for homepage)
  ├── announcements/             # GET (public)
  ├── featured-categories/       # GET (public - 3 categories)
  ├── collections/               # GET (public - featured only)
  ├── bestsellers/               # GET (public - 4 products)
  ├── mid-page-banner/           # GET (public)
  ├── occasions/                 # GET (public)
  ├── new-arrivals/              # GET (public - 4 products)
  ├── brand-story/               # GET (public)
  ├── instagram-feed/            # GET (public - 6 posts)
  └── trust-badges/              # GET (public - 4 badges)
```

### Detailed Endpoint Specs

#### 1. Homepage Sections Control

**GET /api/admin/homepage/sections**
- Returns all sections with visibility and order
- Response:
```json
{
  "sections": [
    {
      "id": "uuid",
      "sectionKey": "hero_slider",
      "sectionName": "Hero Slider",
      "isActive": true,
      "displayOrder": 1
    },
    ...
  ]
}
```

**PUT /api/admin/homepage/sections**
- Update order and visibility of sections
- Request:
```json
{
  "sections": [
    { "id": "uuid", "isActive": true, "displayOrder": 1 },
    { "id": "uuid", "isActive": false, "displayOrder": 2 }
  ]
}
```

#### 2. Announcements

**GET /api/admin/homepage/announcements**
- Returns all announcements (admin view)

**POST /api/admin/homepage/announcements**
- Create new announcement
- Request:
```json
{
  "text": "FLAT 10% OFF on your first order | Use code",
  "highlightText": "WELCOME10",
  "linkUrl": "/offers",
  "isActive": true,
  "displayOrder": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**PUT /api/admin/homepage/announcements/:id**
- Update announcement

**DELETE /api/admin/homepage/announcements/:id**
- Delete announcement (soft delete or hard delete)

**GET /api/homepage/announcements** (Public)
- Returns active announcements only
- Filters by date range
- Ordered by displayOrder

#### 3. Collections

**GET /api/admin/homepage/collections**
- Returns all collections

**POST /api/admin/homepage/collections**
- Create collection
- Handle image upload to Cloudinary
- Request (multipart/form-data):
```json
{
  "name": "Wedding Special",
  "tagline": "Bridal Elegance",
  "description": "...",
  "image": File,
  "linkUrl": "/collections/wedding",
  "productsCount": 48,
  "isFeatured": true
}
```

**PUT /api/admin/homepage/collections/:id**
- Update collection
- Handle image replacement

**DELETE /api/admin/homepage/collections/:id**
- Delete collection
- Delete Cloudinary image

**GET /api/homepage/collections** (Public)
- Returns featured collections only
- Max 2 collections
- Ordered by displayOrder

#### 4. Mid-Page Banner

**GET /api/admin/homepage/mid-page-banner**
- Returns current banner (single record)

**POST /api/admin/homepage/mid-page-banner**
- Create banner (if none exists)

**PUT /api/admin/homepage/mid-page-banner/:id**
- Update banner
- Handle image upload

**GET /api/homepage/mid-page-banner** (Public)
- Returns active banner

#### 5. Occasions

**GET /api/admin/homepage/occasions**
**POST /api/admin/homepage/occasions**
**PUT /api/admin/homepage/occasions/:id**
**DELETE /api/admin/homepage/occasions/:id**
**GET /api/homepage/occasions** (Public)

Similar pattern to Collections

#### 6. Brand Story

**GET /api/admin/homepage/brand-story**
**PUT /api/admin/homepage/brand-story/:id**
**GET /api/homepage/brand-story** (Public)

**Brand Story Stats**:
**GET /api/admin/homepage/brand-story/stats**
**POST /api/admin/homepage/brand-story/stats**
**PUT /api/admin/homepage/brand-story/stats/:id**
**DELETE /api/admin/homepage/brand-story/stats/:id**

#### 7. Instagram Posts

**GET /api/admin/homepage/instagram-posts**
**POST /api/admin/homepage/instagram-posts**
**PUT /api/admin/homepage/instagram-posts/:id**
**DELETE /api/admin/homepage/instagram-posts/:id**
**GET /api/homepage/instagram-feed** (Public)

#### 8. Trust Badges

**GET /api/admin/homepage/trust-badges**
**POST /api/admin/homepage/trust-badges**
**PUT /api/admin/homepage/trust-badges/:id**
**DELETE /api/admin/homepage/trust-badges/:id**
**GET /api/homepage/trust-badges** (Public)

---

## Admin Panel Pages

### Main Homepage Management Dashboard

**Route**: `/admin/homepage`

**Features**:
- Overview of all sections
- Quick toggle for section visibility
- Drag-and-drop section reordering
- Navigation to individual section management
- Preview homepage button

**UI Components**:
```
┌─────────────────────────────────────────────┐
│ Homepage Management                          │
├─────────────────────────────────────────────┤
│ [Preview Homepage]                           │
│                                              │
│ Sections (Drag to reorder)                   │
│ ┌──────────────────────────────────────┐    │
│ │ ☰ Hero Slider         [ON] [Manage] │    │
│ │ ☰ Announcement Bar    [ON] [Manage] │    │
│ │ ☰ Shop by Category    [ON] [Manage] │    │
│ │ ☰ Featured Collections [ON] [Manage] │    │
│ │ ☰ Bestseller Products [ON] [Manage] │    │
│ │ ☰ Mid-Page Banner     [ON] [Manage] │    │
│ │ ☰ Shop by Occasion    [ON] [Manage] │    │
│ │ ☰ New Arrivals        [ON] [Manage] │    │
│ │ ☰ Brand Story         [ON] [Manage] │    │
│ │ ☰ Instagram Feed      [ON] [Manage] │    │
│ │ ☰ Trust Badges        [ON] [Manage] │    │
│ └──────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Individual Section Management Pages

#### 1. Announcements Management
**Route**: `/admin/homepage/announcements`

- List view with all announcements
- Add/Edit/Delete announcements
- Toggle active status
- Schedule announcements
- Drag to reorder

#### 2. Collections Management
**Route**: `/admin/homepage/collections`

- Grid view of collections
- Add new collection button
- Edit/Delete options
- Image upload
- Mark as featured (max 2)
- Drag to reorder

#### 3. Occasions Management
**Route**: `/admin/homepage/occasions`

- Similar to collections
- Icon/emoji picker
- Gradient color picker
- Max 4 occasions

#### 4. Mid-Page Banner
**Route**: `/admin/homepage/mid-page-banner`

- Single form (not a list)
- Image upload
- Title, subtitle, CTA fields
- Color customization
- Active toggle

#### 5. Brand Story
**Route**: `/admin/homepage/brand-story`

- Single form
- Image upload
- Heading, description
- Stats management (3 stats)
- CTA button customization

#### 6. Instagram Posts
**Route**: `/admin/homepage/instagram`

- Grid view of 6 posts
- Upload image + add Instagram URL
- Settings tab (handle, max posts)
- Drag to reorder

#### 7. Trust Badges
**Route**: `/admin/homepage/trust-badges`

- List of 4 badges
- Icon selection
- Title, description
- Reorder

---

## Frontend Integration

### Homepage Data Fetching Strategy

**Option 1: Single API Call (Recommended)**
```typescript
// app/(shop)/page.tsx
export default async function Home() {
  // Fetch all homepage data in one call
  const homepageData = await fetch('/api/homepage/all', {
    cache: 'no-store' // or revalidate
  });

  const {
    sections,
    announcements,
    categories,
    collections,
    bestsellers,
    midPageBanner,
    occasions,
    newArrivals,
    brandStory,
    instagramFeed,
    trustBadges
  } = await homepageData.json();

  return (
    <>
      {sections.find(s => s.key === 'hero_slider')?.isActive && <HeroSlider />}
      {sections.find(s => s.key === 'shop_by_category')?.isActive && (
        <ShopByCategory categories={categories} />
      )}
      {sections.find(s => s.key === 'featured_collections')?.isActive && (
        <FeaturedCollections collections={collections} />
      )}
      {/* ... other sections */}
    </>
  );
}
```

**Option 2: Individual API Calls**
```typescript
export default async function Home() {
  const [sections, categories, collections, ...] = await Promise.all([
    fetch('/api/homepage/sections'),
    fetch('/api/homepage/featured-categories'),
    fetch('/api/homepage/collections'),
    // ...
  ]);

  // Render sections
}
```

### Component Updates

Update each component to accept props instead of using mock data:

**Before (Phase 1)**:
```typescript
export default function ShopByCategory() {
  const categories = [ /* mock data */ ];
  // ...
}
```

**After (Phase 2)**:
```typescript
interface ShopByCategoryProps {
  categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  if (!categories || categories.length === 0) return null;
  // ...
}
```

### Caching & Real-Time Updates Strategy

**IMPORTANT**: Website must update immediately when admin makes changes

**Implementation**:

```typescript
// 1. API Route Pattern - Revalidate after every change
// app/api/admin/homepage/[section]/route.ts

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Save to database
    const result = await db.insert(table).values(data);

    // 2. IMMEDIATELY revalidate homepage cache
    revalidatePath('/(shop)');
    revalidatePath('/');

    // 3. Return success
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Similar pattern - always revalidate after update
  const result = await db.update(table).set(data);
  revalidatePath('/(shop)');
  return NextResponse.json({ success: true, data: result });
}

export async function DELETE(request: Request) {
  // Similar pattern - always revalidate after delete
  await db.delete(table).where(eq(table.id, id));
  revalidatePath('/(shop)');
  return NextResponse.json({ success: true });
}
```

**Cache Strategy Options**:

**Option 1: On-Demand Revalidation (Recommended)**
- Admin makes change → API updates DB → Revalidate cache → Homepage updates
- Near-instant updates (< 1 second)
- No stale content
- Best user experience

**Option 2: Time-Based ISR**
- Revalidate every 10 seconds
- Faster than 60s but may show stale content briefly
- Use as fallback if on-demand doesn't work

**Option 3: No Cache (Development/Testing)**
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

**Implementation in Homepage**:
```typescript
// app/(shop)/page.tsx

// Use ISR with short revalidation as backup
export const revalidate = 10; // 10 seconds

export default async function Home() {
  // Fetch fresh data from database
  const homepageData = await fetch('/api/homepage/all', {
    cache: 'no-store' // Always fresh during development
  });

  // On-demand revalidation ensures this is fresh after admin changes
  // ...
}
```

**Admin Success Notification**:
```typescript
// After successful API call in admin panel
toast.success('Changes saved! Homepage will update in a few seconds.');

// Optional: Auto-refresh preview
setTimeout(() => {
  router.refresh(); // Refresh the page to show changes
}, 2000);
```

---

## Implementation Order

### Week 1: Foundation & Core Tables
**Priority**: High

1. ✅ **Database Schema**
   - [ ] Create all database tables
   - [ ] Run migrations
   - [ ] Seed initial data

2. ✅ **Homepage Sections Control**
   - [ ] Create `homepage_sections` table
   - [ ] API: GET, PUT for sections
   - [ ] Admin page: Section visibility/order

3. ✅ **Announcements/Promo Bar**
   - [ ] Create `announcements` table
   - [ ] API: CRUD endpoints
   - [ ] Admin page: Manage announcements
   - [ ] Frontend: Update PromoBar component

### Week 2: Collections & Products
**Priority**: High

4. ✅ **Featured Collections**
   - [ ] Create `collections` table
   - [ ] API: CRUD endpoints with image upload
   - [ ] Admin page: Manage collections
   - [ ] Frontend: Update FeaturedCollections component

5. ✅ **Mid-Page Banner**
   - [ ] Create `mid_page_banner` table
   - [ ] API: CRUD endpoints with image upload
   - [ ] Admin page: Single banner form
   - [ ] Frontend: Update MidPageBanner component

6. ✅ **Product Enhancements**
   - [ ] Add `isBestseller`, `isNewArrival` fields to products
   - [ ] API: Update product endpoints
   - [ ] Admin: Bestseller/New Arrival toggles on product form
   - [ ] Frontend: Update BestsellerProducts, NewArrivals components

### Week 3: Occasions & Content
**Priority**: Medium

7. ✅ **Shop by Occasion**
   - [ ] Create `occasions` table
   - [ ] API: CRUD endpoints with image upload
   - [ ] Admin page: Manage occasions
   - [ ] Frontend: Update ShopByOccasion component

8. ✅ **Brand Story**
   - [ ] Create `brand_story` and `brand_story_stats` tables
   - [ ] API: CRUD endpoints
   - [ ] Admin page: Brand story form with stats
   - [ ] Frontend: Update BrandStory component

9. ✅ **Category Enhancements**
   - [ ] Add `featuredOnHome`, `homeTagline` fields to categories
   - [ ] API: Update category endpoints
   - [ ] Admin: Homepage feature toggle on category form
   - [ ] Frontend: Update ShopByCategory component

### Week 4: Social & Final Polish
**Priority**: Medium

10. ✅ **Instagram Feed**
    - [ ] Create `instagram_posts`, `instagram_settings` tables
    - [ ] API: CRUD endpoints with image upload
    - [ ] Admin page: Manage Instagram posts
    - [ ] Frontend: Update InstagramFeed component

11. ✅ **Trust Badges**
    - [ ] Create `trust_badges` table
    - [ ] API: CRUD endpoints
    - [ ] Admin page: Manage badges with icon picker
    - [ ] Frontend: Update Features component

12. ✅ **Integration & Testing**
    - [ ] Homepage data aggregation API
    - [ ] Update homepage to fetch from database
    - [ ] Remove all mock data
    - [ ] Test all admin functions
    - [ ] Test homepage rendering
    - [ ] Performance testing

### Week 5: UX & Polish
**Priority**: Low

13. ✅ **Admin Dashboard Enhancements**
    - [ ] Homepage management overview page
    - [ ] Drag-and-drop section reordering
    - [ ] Quick preview functionality
    - [ ] Bulk actions

14. ✅ **Validation & Error Handling**
    - [ ] Zod schemas for all forms
    - [ ] Error messages
    - [ ] Loading states
    - [ ] Success notifications

15. ✅ **Documentation**
    - [ ] Admin user guide
    - [ ] API documentation
    - [ ] Database schema diagram
    - [ ] Deployment checklist

---

## Testing Strategy

### 1. Database Testing
- [ ] Test all migrations
- [ ] Test seed data
- [ ] Test relationships and cascades
- [ ] Test constraints and validations

### 2. API Testing
- [ ] Test CRUD operations for each endpoint
- [ ] Test authentication/authorization
- [ ] Test image upload to Cloudinary
- [ ] Test error handling
- [ ] Test edge cases (empty data, max limits)

### 3. Admin Panel Testing
- [ ] Test all forms
- [ ] Test image uploads
- [ ] Test drag-and-drop reordering
- [ ] Test toggles and switches
- [ ] Test responsiveness
- [ ] Test validation messages

### 4. Frontend Testing
- [ ] Test homepage with real data
- [ ] Test with sections hidden
- [ ] Test with empty data
- [ ] Test performance (load time)
- [ ] Test responsiveness
- [ ] Test SEO metadata

### 5. Integration Testing
- [ ] Test complete flow: Admin create → Homepage display
- [ ] Test updates reflect immediately
- [ ] Test deletion cascades
- [ ] Test cache invalidation
- [ ] Test concurrent edits

### 6. Performance Testing
- [ ] Measure homepage load time (< 2s goal)
- [ ] Test with many images
- [ ] Test API response times
- [ ] Test database query performance
- [ ] Test Cloudinary CDN performance

---

## Technical Specifications

### Image Upload Requirements

**Cloudinary Integration**:
- Use existing Cloudinary setup
- Folder structure: `/homepage/announcements/`, `/homepage/collections/`, etc.
- Image optimization: Auto format, quality 80
- Thumbnail generation for admin
- Delete old images when replaced

**Accepted Formats**:
- Images: JPG, PNG, WebP
- Max size: 5MB
- Recommended dimensions:
  - Collections: 1600x1000px (16:10)
  - Categories: 800x1200px (3:4)
  - Occasions: 800x600px (4:3)
  - Mid-page banner: 1920x1200px
  - Brand story: 800x1000px (4:5)
  - Instagram: 800x800px (1:1)

### Validation Rules

**Announcements**:
- Text: Required, max 150 characters
- Highlight: Optional, max 50 characters
- Display order: Unique integers

**Collections**:
- Name: Required, max 100 characters
- Slug: Auto-generated, unique
- Max 2 featured at a time

**Occasions**:
- Name: Required, max 50 characters
- Max 4 active at a time

**Mid-Page Banner**:
- Only 1 active at a time
- Title: Required, max 100 characters

**Brand Story**:
- Only 1 record allowed
- Description: Required, max 1000 characters
- Exactly 3 stats required

**Instagram Posts**:
- Max 6 active posts
- Post URL: Valid Instagram URL

**Trust Badges**:
- Max 4 active badges
- Title: Required, max 50 characters
- Description: Required, max 150 characters

### Permission Requirements

**Admin Roles**:
- SUPER_ADMIN: Full access to all homepage management
- SHOP_MANAGER: Can edit all sections
- SALESMAN: Read-only access (view only)

**Permissions Needed**:
- `homepage.sections.view`
- `homepage.sections.edit`
- `homepage.announcements.create`
- `homepage.announcements.edit`
- `homepage.announcements.delete`
- `homepage.collections.create`
- `homepage.collections.edit`
- `homepage.collections.delete`
- ... (similar for all sections)

---

## Migration Strategy

### Step 1: Create Tables
```bash
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations (or use Neon SQL Editor)
```

**Migration Files to Create**:
- `0001_homepage_sections.sql` - Homepage sections control
- `0002_announcements.sql` - Announcement bar
- `0003_collections.sql` - Featured collections
- `0004_occasions.sql` - Shop by occasion
- `0005_mid_page_banner.sql` - Mid-page banner
- `0006_brand_story.sql` - Brand story + stats
- `0007_instagram.sql` - Instagram posts + settings
- `0008_trust_badges.sql` - Trust badges
- `0009_product_enhancements.sql` - Add fields to products table
- `0010_category_enhancements.sql` - Add fields to categories table

### Step 2: Seed Initial Data
**CRITICAL**: Database must have initial data for website to work

**Create Seed Script**: `scripts/seed-homepage.ts`

```typescript
import { db } from '@/db';
import {
  homepageSections,
  announcements,
  collections,
  occasions,
  midPageBanner,
  brandStory,
  brandStoryStats,
  instagramPosts,
  instagramSettings,
  trustBadges
} from '@/db/schema';

async function seedHomepageSections() {
  console.log('Seeding homepage sections...');

  await db.insert(homepageSections).values([
    { sectionKey: 'hero_slider', sectionName: 'Hero Slider', displayOrder: 1, isActive: true },
    { sectionKey: 'promo_bar', sectionName: 'Announcement Bar', displayOrder: 2, isActive: true },
    { sectionKey: 'shop_by_category', sectionName: 'Shop by Category', displayOrder: 3, isActive: true },
    { sectionKey: 'featured_collections', sectionName: 'Featured Collections', displayOrder: 4, isActive: true },
    { sectionKey: 'bestseller_products', sectionName: 'Bestseller Products', displayOrder: 5, isActive: true },
    { sectionKey: 'mid_page_banner', sectionName: 'Mid-Page Banner', displayOrder: 6, isActive: true },
    { sectionKey: 'shop_by_occasion', sectionName: 'Shop by Occasion', displayOrder: 7, isActive: true },
    { sectionKey: 'new_arrivals', sectionName: 'New Arrivals', displayOrder: 8, isActive: true },
    { sectionKey: 'brand_story', sectionName: 'Brand Story', displayOrder: 9, isActive: true },
    { sectionKey: 'instagram_feed', sectionName: 'Instagram Feed', displayOrder: 10, isActive: true },
    { sectionKey: 'trust_badges', sectionName: 'Trust Badges', displayOrder: 11, isActive: true },
  ]);

  console.log('✅ Homepage sections seeded');
}

async function seedAnnouncements() {
  console.log('Seeding announcements...');

  await db.insert(announcements).values([
    {
      text: '🎉 FLAT 10% OFF on your first order | Use code',
      highlightText: 'WELCOME10',
      isActive: true,
      displayOrder: 1,
    },
    {
      text: '🚚 FREE Shipping on orders above',
      highlightText: '₹999',
      isActive: true,
      displayOrder: 2,
    },
    {
      text: '💰 COD Available | Easy Returns | 100% Authentic',
      highlightText: null,
      isActive: true,
      displayOrder: 3,
    },
  ]);

  console.log('✅ Announcements seeded');
}

async function seedCollections() {
  console.log('Seeding collections...');

  // TODO: Upload placeholder images to Cloudinary first
  await db.insert(collections).values([
    {
      name: 'Wedding Special',
      slug: 'wedding-special',
      tagline: 'Bridal Elegance',
      description: 'Exquisite sarees for your special day',
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/wedding-collection.jpg',
      imagePublicId: 'homepage/wedding-collection',
      linkUrl: '/collections/wedding-special',
      productsCount: 48,
      isFeatured: true,
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Festive Favorites',
      slug: 'festive',
      tagline: 'Celebrate in Style',
      description: 'Perfect for all your celebrations',
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/festive-collection.jpg',
      imagePublicId: 'homepage/festive-collection',
      linkUrl: '/collections/festive',
      productsCount: 36,
      isFeatured: true,
      isActive: true,
      displayOrder: 2,
    },
  ]);

  console.log('✅ Collections seeded');
}

async function seedOccasions() {
  console.log('Seeding occasions...');

  await db.insert(occasions).values([
    {
      name: 'Wedding',
      slug: 'wedding',
      icon: '💍',
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/wedding-occasion.jpg',
      imagePublicId: 'homepage/wedding-occasion',
      gradientFrom: 'from-pink-600/80',
      gradientTo: 'to-red-600/80',
      linkUrl: '/categories?occasion=wedding',
      isActive: true,
      displayOrder: 1,
    },
    {
      name: 'Festival',
      slug: 'festival',
      icon: '🎉',
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/festival-occasion.jpg',
      imagePublicId: 'homepage/festival-occasion',
      gradientFrom: 'from-purple-600/80',
      gradientTo: 'to-indigo-600/80',
      linkUrl: '/categories?occasion=festival',
      isActive: true,
      displayOrder: 2,
    },
    {
      name: 'Party',
      slug: 'party',
      icon: '🥳',
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/party-occasion.jpg',
      imagePublicId: 'homepage/party-occasion',
      gradientFrom: 'from-blue-600/80',
      gradientTo: 'to-cyan-600/80',
      linkUrl: '/categories?occasion=party',
      isActive: true,
      displayOrder: 3,
    },
    {
      name: 'Casual',
      slug: 'casual',
      icon: '👗',
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/casual-occasion.jpg',
      imagePublicId: 'homepage/casual-occasion',
      gradientFrom: 'from-green-600/80',
      gradientTo: 'to-teal-600/80',
      linkUrl: '/categories?occasion=casual',
      isActive: true,
      displayOrder: 4,
    },
  ]);

  console.log('✅ Occasions seeded');
}

async function seedMidPageBanner() {
  console.log('Seeding mid-page banner...');

  await db.insert(midPageBanner).values({
    title: 'Wedding Season Sale',
    subtitle: 'EXCLUSIVE OFFER',
    description: 'Get up to 50% OFF on bridal collection',
    imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/mid-page-banner.jpg',
    imagePublicId: 'homepage/mid-page-banner',
    linkUrl: '/sale/wedding-season',
    linkText: 'Shop Now',
    isActive: true,
  });

  console.log('✅ Mid-page banner seeded');
}

async function seedBrandStory() {
  console.log('Seeding brand story...');

  const [story] = await db.insert(brandStory).values({
    heading: 'Weaving Traditions, Creating Memories',
    subtitle: 'About Us',
    description: 'For over three generations, Sudhakant Sarees has been the epitome of authentic Indian craftsmanship. Each saree in our collection tells a story of dedication, artistry, and timeless elegance. We work directly with master weavers across India to bring you the finest handloom and silk sarees, ensuring that every piece is a work of art that honors our rich cultural heritage.',
    imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/brand-story.jpg',
    imagePublicId: 'homepage/brand-story',
    buttonText: 'Our Story',
    buttonLink: '/about',
    isActive: true,
  }).returning();

  await db.insert(brandStoryStats).values([
    { brandStoryId: story.id, label: 'Years of Heritage', value: '50+', displayOrder: 1 },
    { brandStoryId: story.id, label: 'Master Artisans', value: '200+', displayOrder: 2 },
    { brandStoryId: story.id, label: 'Happy Customers', value: '10K+', displayOrder: 3 },
  ]);

  console.log('✅ Brand story seeded');
}

async function seedInstagram() {
  console.log('Seeding Instagram posts...');

  await db.insert(instagramSettings).values({
    instagramHandle: '@sudhakantsarees',
    profileUrl: 'https://instagram.com/sudhakantsarees',
    maxPosts: 6,
  });

  await db.insert(instagramPosts).values([
    {
      imageUrl: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/v1/homepage/instagram-1.jpg',
      imagePublicId: 'homepage/instagram-1',
      postUrl: 'https://instagram.com/p/example1',
      caption: 'Beautiful silk saree',
      isActive: true,
      displayOrder: 1,
    },
    // ... repeat for 6 posts
  ]);

  console.log('✅ Instagram posts seeded');
}

async function seedTrustBadges() {
  console.log('Seeding trust badges...');

  await db.insert(trustBadges).values([
    {
      title: 'FREE SHIPPING',
      description: 'Free shipping on orders above ₹999 across India',
      iconType: 'shipping',
      isActive: true,
      displayOrder: 1,
    },
    {
      title: 'SECURE PAYMENT',
      description: '100% secure payment with COD & online options',
      iconType: 'payment',
      isActive: true,
      displayOrder: 2,
    },
    {
      title: '100% AUTHENTIC',
      description: 'Original handloom sarees with quality guarantee',
      iconType: 'authentic',
      isActive: true,
      displayOrder: 3,
    },
    {
      title: 'EASY RETURNS',
      description: '7-day easy return & exchange policy',
      iconType: 'returns',
      isActive: true,
      displayOrder: 4,
    },
  ]);

  console.log('✅ Trust badges seeded');
}

async function main() {
  try {
    console.log('🌱 Starting homepage database seeding...\n');

    await seedHomepageSections();
    await seedAnnouncements();
    await seedCollections();
    await seedOccasions();
    await seedMidPageBanner();
    await seedBrandStory();
    await seedInstagram();
    await seedTrustBadges();

    console.log('\n✅ All homepage data seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
```

**Run Seed Script**:
```bash
npm run db:seed:homepage
# or
tsx scripts/seed-homepage.ts
```

### Step 3: Migrate Mock Data to Database

**IMPORTANT**: Before removing mock data, ensure database has all content

1. **Verify Database Connection**
   ```bash
   npm run db:studio  # Check tables are created
   ```

2. **Check Seeded Data**
   - Open Drizzle Studio
   - Verify all tables have data
   - Test queries

3. **Upload Placeholder Images**
   - Upload all placeholder images to Cloudinary
   - Update seed script with actual Cloudinary URLs
   - Re-run seed if needed

### Step 4: Update Components to Use Database

**Pattern for Each Component**:

```typescript
// BEFORE (Phase 1 - Mock Data)
export default function ShopByCategory() {
  const categories = [ /* hardcoded mock data */ ];
  return <div>{/* render */}</div>;
}

// AFTER (Phase 2 - Database)
interface ShopByCategoryProps {
  categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  // Handle empty state
  if (!categories || categories.length === 0) {
    return null; // Or show placeholder
  }

  return <div>{/* render with props */}</div>;
}
```

**Homepage Integration**:
```typescript
// app/(shop)/page.tsx
export default async function Home() {
  // Fetch from database
  const data = await fetch('/api/homepage/all', {
    cache: 'no-store'
  }).then(res => res.json());

  return (
    <>
      {data.sections.hero_slider?.isActive && <HeroSlider />}
      {data.sections.shop_by_category?.isActive && (
        <ShopByCategory categories={data.categories} />
      )}
      {/* Pass data from database to each component */}
    </>
  );
}
```

### Step 5: Remove Mock Data (Final Step)

**Only after confirming database integration works**:

1. Delete mock data constants from components
2. Update imports
3. Test homepage loads correctly
4. Test with empty database (should handle gracefully)
5. Test with sections hidden
6. Final build test

---

## Success Metrics

### Performance Metrics
- [ ] Homepage load time < 2 seconds
- [ ] Lighthouse score > 90
- [ ] API response time < 500ms
- [ ] Image load time < 1s (Cloudinary CDN)

### Usability Metrics
- [ ] Admin can update all content in < 10 minutes
- [ ] No code changes needed for content updates
- [ ] All sections independently toggleable
- [ ] Changes reflect within 60 seconds (cache)

### Quality Metrics
- [ ] Zero TypeScript errors
- [ ] All API endpoints have error handling
- [ ] All forms have validation
- [ ] All images optimized
- [ ] Mobile responsive (100% score)

---

## Risks & Mitigation

### Risk 1: Performance Degradation
**Risk**: Multiple database queries slow down homepage
**Mitigation**:
- Single aggregated API endpoint
- Aggressive caching (ISR 60s)
- Database query optimization
- Use Cloudinary CDN

### Risk 2: Data Consistency
**Risk**: Admin makes conflicting changes
**Mitigation**:
- Validation rules (max featured items)
- Optimistic locking
- Clear error messages
- Audit logs

### Risk 3: Image Storage Costs
**Risk**: Too many images uploaded to Cloudinary
**Mitigation**:
- Image compression
- Delete old images when replaced
- Set reasonable limits
- Monitor storage usage

### Risk 4: Complex Admin UI
**Risk**: Admin UI too complicated
**Mitigation**:
- Progressive disclosure
- Tooltips and help text
- Video tutorials
- Simple, intuitive design

---

## Future Enhancements (Post-Phase 2)

1. **Analytics Dashboard**
   - Track which sections get most engagement
   - A/B testing different layouts
   - Click tracking on CTAs

2. **Scheduling System**
   - Schedule section visibility
   - Schedule content changes
   - Recurring events

3. **Multi-language Support**
   - Translate all content
   - Language switcher
   - RTL support

4. **AI-Powered Features**
   - Auto-generate descriptions
   - Image optimization suggestions
   - Content recommendations

5. **Instagram API Integration**
   - Auto-fetch latest posts
   - Sync captions and likes
   - Real-time updates

6. **Advanced Customization**
   - Custom CSS per section
   - Layout variants
   - Color theme switcher

---

## Conclusion

Phase 2 will transform the homepage from static mock data to a fully dynamic, admin-controlled system. The implementation is designed to be:

- **Modular**: Each section is independent
- **Scalable**: Easy to add more sections
- **User-friendly**: Admin can update in minutes
- **Performant**: < 2s load time maintained
- **Maintainable**: Clear code structure

**Estimated Timeline**: 4-5 weeks
**Estimated Effort**: 120-150 hours
**Priority**: High (Critical for business operations)

---

*Last updated: 2024-12-10*
