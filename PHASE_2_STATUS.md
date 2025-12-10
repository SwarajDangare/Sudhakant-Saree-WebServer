# Phase 2 Implementation Status

## ✅ Completed Tasks

### 1. Database Schema ✅ DONE
- ✅ Created 10 new homepage tables:
  - `homepage_sections` - Control visibility/order
  - `announcements` - Promo bar
  - `collections` - Featured collections
  - `occasions` - Shop by occasion
  - `mid_page_banner` - Mid-page banner
  - `brand_story` + `brand_story_stats` - Brand heritage
  - `instagram_posts` + `instagram_settings` - Social feed
  - `trust_badges` - Features section
- ✅ Added homepage fields to existing tables:
  - `products`: `isBestseller`, `bestsellerRank`, `isNewArrival`, `newArrivalUntil`
  - `categories`: `featuredOnHome`, `homeDisplayOrder`, `homeTagline`, `homeDescription`
- ✅ Added relations for brand story stats
- ✅ **Migration generated**: `db/migrations/0008_fixed_wind_dancer.sql`

### 2. Seed Script ✅ DONE
- ✅ Created complete seed script: `scripts/seed-homepage.ts`
- ✅ Seeds all 11 homepage sections
- ✅ Includes initial data for all tables
- ✅ Added npm script: `npm run db:seed-homepage`

### 3. API Endpoints ✅ DONE
- ✅ Created aggregated API endpoint: `/api/homepage/all`
- ✅ Fetches all homepage data in one call
- ✅ Includes:
  - Section visibility/order
  - Active announcements (filtered by date)
  - Featured collections (max 2)
  - Featured categories (max 3)
  - Bestseller products (max 4)
  - New arrivals (max 4)
  - Active mid-page banner
  - Active occasions (max 4)
  - Brand story + stats
  - Instagram feed (max 6)
  - Trust badges (max 4)
- ✅ 10-second ISR cache with on-demand revalidation
- ✅ Error handling and fallback data

### 4. Homepage Integration ✅ DONE
- ✅ Updated `app/(shop)/page.tsx` to fetch from API
- ✅ Conditional rendering based on section visibility
- ✅ Passes data to all components as props
- ✅ Graceful fallback for missing data

### 5. Component Updates (Partial - 3/9 done)
- ✅ **ShopByCategory** - Accepts `categories` prop from database
- ✅ **FeaturedCollections** - Accepts `collections` prop from database
- ✅ **BestsellerProducts** - Accepts `products` prop from database
- ⏳ **MidPageBanner** - Needs to accept `banner` prop
- ⏳ **ShopByOccasion** - Needs to accept `occasions` prop
- ⏳ **NewArrivals** - Needs to accept `products` prop
- ⏳ **BrandStory** - Needs to accept `story` and `stats` props
- ⏳ **InstagramFeed** - Needs to accept `posts` and `handle` props
- ⏳ **Features** - Needs to accept `badges` prop

---

## ⏳ Remaining Tasks

### 1. Finish Component Updates (6 components)
Update the following components to accept props instead of using mock data:

```typescript
// MidPageBanner.tsx
interface MidPageBannerProps {
  banner: {
    id: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    imageUrl: string;
    linkUrl?: string | null;
    linkText?: string | null;
  };
}

// ShopByOccasion.tsx
interface ShopByOccasionProps {
  occasions: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
    imageUrl: string;
    gradientFrom: string;
    gradientTo: string;
    linkUrl: string;
  }>;
}

// NewArrivals.tsx
interface NewArrivalsProps {
  products: Product[]; // Same as BestsellerProducts
}

// BrandStory.tsx
interface BrandStoryProps {
  story: {
    id: string;
    heading: string;
    subtitle?: string | null;
    description: string;
    imageUrl: string;
    buttonText: string;
    buttonLink: string;
  };
  stats: Array<{
    id: string;
    label: string;
    value: string;
    displayOrder: number;
  }>;
}

// InstagramFeed.tsx
interface InstagramFeedProps {
  posts: Array<{
    id: string;
    imageUrl: string;
    postUrl: string;
    caption?: string | null;
  }>;
  handle: string;
}

// Features.tsx
interface FeaturesProps {
  badges: Array<{
    id: string;
    title: string;
    description: string;
    iconType: string;
  }>;
}
```

### 2. Run Database Migration
**IMPORTANT**: Before testing, you MUST apply the migration

**Option A: Manual (Neon SQL Editor)**
```bash
# 1. Copy the contents of db/migrations/0008_fixed_wind_dancer.sql
# 2. Go to Neon Console > SQL Editor
# 3. Paste and execute the SQL
```

**Option B: Automatic (if network allows)**
```bash
npm run db:migrate
```

### 3. Seed Homepage Data
After migration is complete:
```bash
npm run db:seed-homepage
```

This will populate:
- 11 homepage section controls
- 3 announcements
- 2 featured collections
- 4 occasions
- 1 mid-page banner
- 1 brand story with 3 stats
- 6 Instagram posts
- 4 trust badges

### 4. Update Existing Categories
To see categories on homepage, you need to mark some as featured:
```sql
UPDATE categories
SET
  "featuredOnHome" = true,
  "homeDisplayOrder" = 1,
  "homeTagline" = 'Timeless Elegance',
  "homeDescription" = 'Handwoven pure silk sarees'
WHERE slug = 'silk-sarees';

-- Repeat for 2-3 more categories
```

### 5. Mark Products as Bestsellers/New Arrivals
```sql
-- Mark some products as bestsellers
UPDATE products
SET
  "isBestseller" = true,
  "bestsellerRank" = 1
WHERE id IN (SELECT id FROM products LIMIT 4);

-- Mark some products as new arrivals
UPDATE products
SET
  "isNewArrival" = true,
  "newArrivalUntil" = NOW() + INTERVAL '30 days'
WHERE id IN (SELECT id FROM products WHERE "isBestseller" = false LIMIT 4);
```

### 6. Test Homepage
```bash
npm run dev
```

Visit `http://localhost:3000` and verify:
- [ ] Sections render with database data
- [ ] Categories show (if marked as featuredOnHome)
- [ ] Collections display
- [ ] Bestsellers show (if products marked)
- [ ] All sections can be toggled via database

---

## 🎯 Next Steps (Priority Order)

1. **IMMEDIATE**: Finish updating remaining 6 components
2. **RUN**: Database migration
3. **SEED**: Homepage data
4. **UPDATE**: Mark categories/products as featured
5. **TEST**: Homepage rendering
6. **BUILD**: Test production build
7. **ADMIN**: Create admin pages for managing homepage (Phase 2B)

---

## 📝 Notes

### Current Limitations
- Categories and products use placeholder images (demo Cloudinary URLs)
- No admin UI yet for managing homepage content
- Need to manually update database to mark items as featured
- PromoBar component not yet updated (still uses mock data)

### Performance
- Homepage API call fetches all data in one request
- 10-second ISR cache for performance
- On-demand revalidation ready (just need admin endpoints)

### Admin Pages (Future)
Once components are working, create admin pages:
- `/admin/homepage` - Main dashboard
- `/admin/homepage/announcements` - Manage promo bar
- `/admin/homepage/collections` - Manage featured collections
- `/admin/homepage/occasions` - Manage occasions
- `/admin/homepage/mid-page-banner` - Edit banner
- `/admin/homepage/brand-story` - Edit brand story
- `/admin/homepage/instagram` - Manage Instagram feed
- `/admin/homepage/trust-badges` - Manage badges

Each admin page needs:
- CRUD operations
- Image upload (Cloudinary)
- Reorder functionality
- Toggle active/inactive
- Real-time preview

---

## 🐛 Troubleshooting

### Homepage shows no data
1. Check migration was applied: `npm run db:studio`
2. Check seed data exists in tables
3. Check API endpoint: `curl http://localhost:3000/api/homepage/all`
4. Check browser console for errors

### TypeScript errors
1. Run `npm run build` to see all errors
2. Check component prop interfaces match API response
3. Verify nullable fields have `?` or `| null`

### Images not showing
1. Check Cloudinary URLs are valid
2. Verify Next.js image domains in `next.config.js`
3. Check browser network tab for 404s

---

*Last updated: 2024-12-10 (Phase 2 in progress)*
