# Database Setup Instructions

Since this development environment has network restrictions, follow these steps to set up your database:

## Step 1: Apply Database Migration

1. **Go to your Neon dashboard:** https://console.neon.tech
2. **Select your project:** `sudhakant-sarees`
3. **Click "SQL Editor"** in the left sidebar
4. **Copy the entire contents** of `db/migrations/0000_unique_big_bertha.sql`
5. **Paste it into the SQL Editor**
6. **Click "Run"** to execute the migration

This will create all 7 tables:
- `users` - Admin user management
- `sections` - Top-level categories (e.g., "Sarees", "Dresses")
- `categories` - Sub-categories (e.g., "Silk", "Cotton")
- `products` - Product catalog
- `product_images` - Multiple images per product
- `product_colors` - Color variants
- `color_images` - Images for each color variant

## Step 2: Create Your Super Admin Account

After the migration succeeds, run this SQL in the Neon SQL Editor:

```sql
-- Create your Super Admin account
-- Replace 'YOUR_PASSWORD_HERE' with a strong password

INSERT INTO users (id, email, "passwordHash", name, role, active, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'swarajdangare2016@gmail.com',
  '$2a$10$PLACEHOLDER_HASH',  -- We'll update this with the real hash
  'Swaraj Dangare',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

**Note:** The password hash above is a placeholder. You'll need to generate a proper bcrypt hash for your password. We'll create a utility script for this.

## Step 3: Add Initial Categories

Run this SQL to add your saree categories:

```sql
-- Create "Sarees" section
INSERT INTO sections (id, name, slug, description, "order", active, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'Sarees',
  'sarees',
  'Traditional Indian sarees in various fabrics and styles',
  1,
  true,
  NOW(),
  NOW()
);

-- Get the section ID (you'll need this for categories)
-- Run: SELECT id FROM sections WHERE slug = 'sarees';
-- Copy the ID and use it in the next queries

-- Add categories (replace 'SECTION_ID_HERE' with the actual section ID)
INSERT INTO categories (id, "sectionId", name, slug, description, "order", active, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'SECTION_ID_HERE', 'Silk Sarees', 'silk', 'Pure silk sarees', 1, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SECTION_ID_HERE', 'Cotton Sarees', 'cotton', 'Comfortable cotton sarees', 2, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SECTION_ID_HERE', 'Banarasi Sarees', 'banarasi', 'Traditional Banarasi silk sarees', 3, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SECTION_ID_HERE', 'Kanjivaram Sarees', 'kanjivaram', 'South Indian Kanjivaram silk sarees', 4, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SECTION_ID_HERE', 'Patola Sarees', 'patola', 'Double ikat Patola sarees', 5, true, NOW(), NOW());
```

## Step 4: Verify Setup

Run this query to verify everything is created:

```sql
-- Check all tables
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Sections', COUNT(*) FROM sections
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products;
```

You should see:
- 1 user (you!)
- 1 section (Sarees)
- 5 categories (Silk, Cotton, Banarasi, Kanjivaram, Patola)
- 0 products (you'll add these through the admin panel!)

## Step 5: Continue Development

Once the database is set up, you can continue building the admin panel locally:

1. **Clone the repository** to your local computer
2. **Create `.env` file** with your credentials (already done in this session)
3. **Run `npm install`** to install dependencies
4. **Run `npm run dev`** to start the development server
5. **Open http://localhost:3000/admin** to access the admin panel (once we build it!)

---

## Troubleshooting

**If migration fails:**
- Make sure you're running the SQL in the correct database
- Check for syntax errors in the SQL
- Try running each CREATE TABLE statement separately

**If you can't create the user:**
- We'll create a password hash generator script
- Use the provided utility to generate a bcrypt hash for your password

**Need help?**
- The database schema is defined in `db/schema/index.ts`
- The migration SQL is in `db/migrations/0000_unique_big_bertha.sql`
- All changes are committed to your Git repository
