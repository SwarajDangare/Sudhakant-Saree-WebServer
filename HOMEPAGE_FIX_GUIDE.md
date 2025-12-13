# 🔧 Homepage Fix Guide

## Problem Summary

Your homepage is not loading and showing blank content due to database schema mismatches. The errors include:

1. **Missing Database Columns**: The `mid_page_banner` table is missing `backgroundColor` and `textColor` columns
2. **No Seeded Content**: Homepage sections are active but have no data to display

## Error Messages

```
Error: column "backgroundColor" does not exist
Failed query: select "id", "title", "subtitle", "description", "imageUrl", "imagePublicId",
"linkUrl", "linkText", "backgroundColor", "textColor", "isActive", "createdAt", "updatedAt"
from "mid_page_banner"
```

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Fix Database Schema

**Option A: Using Neon SQL Editor (Recommended)**
1. Open [Neon Dashboard](https://console.neon.tech)
2. Navigate to your project
3. Click on "SQL Editor"
4. Copy and paste the content from `MIGRATION_FIX.sql`
5. Click "Run"
6. Verify you see success messages

**Option B: Using Migration Command (If you have network access)**
```bash
npm run db:migrate
```

### Step 2: Seed Homepage Content

After fixing the schema, you need to populate the homepage with initial content:

**Method 1: Using Admin Panel (Easiest)**
1. Navigate to: `https://your-domain.com/api/admin/seed-homepage` (POST request)
2. Or use curl:
```bash
curl -X POST https://your-domain.com/api/admin/seed-homepage
```

**Method 2: Using Postman/Thunder Client**
- URL: `POST /api/admin/seed-homepage`
- No authentication required (for initial setup)
- This will create:
  - Hero Slider (3 slides)
  - Announcements (3 promo bars)
  - Featured Collections (2 collections)
  - Featured Categories (3 categories)
  - Bestseller Products (4 products)
  - Mid-Page Banner
  - Occasions (4 occasion cards)
  - Brand Story with stats
  - Instagram Feed (6 posts)
  - Trust Badges (4 badges)
  - New Arrivals settings

### Step 3: Verify Homepage

1. Visit your homepage: `https://your-domain.com/`
2. You should now see all sections populated with demo content
3. Go to Admin Panel → Homepage to customize each section

---

## 📝 What Was Fixed

### 1. Database Schema
- ✅ Added `backgroundColor` column to `mid_page_banner` table
- ✅ Added `textColor` column to `mid_page_banner` table (default: `#FFFFFF`)

### 2. Homepage Sections
The following 11 sections will be activated and populated:
1. **Hero Slider** - Rotating banner carousel
2. **Announcement Bar** - Promo messages at top
3. **Shop by Category** - Category grid (3 cards)
4. **Featured Collections** - Curated collections (2 cards)
5. **Bestseller Products** - Product grid (4 products)
6. **Mid-Page Banner** - Full-width promotional banner
7. **Shop by Occasion** - Occasion-based browsing (4 occasions)
8. **New Arrivals** - Latest products
9. **Brand Story** - About section with stats
10. **Instagram Feed** - Social media integration (6 posts)
11. **Trust Badges** - Features like free shipping, secure payment

---

## 🔍 Troubleshooting

### Issue: Homepage still not loading after migration
**Solution**: Clear Next.js cache and rebuild
```bash
rm -rf .next
npm run build
```

### Issue: "Table mid_page_banner does not exist"
**Solution**: Run the full migration
```bash
npm run db:migrate
```
Or manually run migration `0008_fixed_wind_dancer.sql` in Neon SQL Editor

### Issue: Seed script returns "Already exists"
**Solution**: This is normal if you've run it before. To re-seed:
1. Delete existing data from homepage tables in Neon SQL Editor
2. Run the seed script again

### Issue: Homepage sections show but no content
**Checklist**:
- ✅ Run seed script: `POST /api/admin/seed-homepage`
- ✅ Check admin panel: Verify sections are set to "Active"
- ✅ Check database: Verify tables have data
```sql
SELECT COUNT(*) FROM homepage_sections WHERE "isActive" = true;
SELECT COUNT(*) FROM hero_slides WHERE "isActive" = true;
SELECT COUNT(*) FROM mid_page_banner WHERE "isActive" = true;
```

---

## 🎨 Customization After Setup

Once the homepage is loading:

1. **Admin Panel** → **Homepage**
2. Click on any section to customize:
   - Upload your own images
   - Change titles and descriptions
   - Reorder sections
   - Toggle sections on/off

### Adding Real Products
1. Go to **Admin** → **Products** → **New Product**
2. Add product details, images, colors
3. Mark products as "Featured" to show in Bestsellers
4. Or manually configure in **Homepage** → **Bestseller Products**

---

## 📊 Database Schema Reference

### mid_page_banner table structure:
```sql
CREATE TABLE "mid_page_banner" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "subtitle" text,
  "description" text,
  "imageUrl" text NOT NULL,
  "imagePublicId" text NOT NULL,
  "linkUrl" text,
  "linkText" text DEFAULT 'Shop Now',
  "backgroundColor" text,              -- ✨ Fixed
  "textColor" text DEFAULT '#FFFFFF',  -- ✨ Fixed
  "isActive" boolean DEFAULT true NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
```

---

## 📞 Support

If you continue to experience issues:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify DATABASE_URL environment variable is set correctly
4. Ensure Cloudinary credentials are configured (for image uploads)

---

## ✅ Success Checklist

- [ ] Migration script executed successfully
- [ ] No errors in Neon SQL Editor
- [ ] Seed script returns success message
- [ ] Homepage loads without errors
- [ ] At least 3-4 sections visible on homepage
- [ ] Images loading correctly (demo images from Cloudinary)
- [ ] Admin panel accessible at `/admin/homepage`

---

*Last Updated: December 13, 2024*
*Migration File: `db/migrations/0012_add_missing_banner_columns.sql`*
