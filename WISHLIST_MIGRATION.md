# Wishlist Feature - SQL Migration for Neon Database

## Quick Start

Copy and paste the SQL below into your **Neon SQL Editor** and execute it.

---

## SQL Migration Query

```sql
-- ============================================
-- WISHLIST FEATURE MIGRATION FOR NEON DATABASE
-- ============================================

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) 
    REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE CASCADE,
  
  -- Ensure a customer can only add a product once to wishlist
  CONSTRAINT unique_customer_product UNIQUE (customer_id, product_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlist_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist_items(product_id);

-- Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wishlist_items'
ORDER BY ordinal_position;
```

---

## What This Does

1. **Creates `wishlist_items` table** with:
   - Unique ID for each wishlist entry
   - Link to customer (who added it)
   - Link to product (what was added)
   - Timestamp of when it was added

2. **Adds constraints** to:
   - Automatically delete wishlist items when customer is deleted
   - Automatically delete wishlist items when product is deleted
   - Prevent duplicate entries (same customer + product)

3. **Creates indexes** for:
   - Fast lookups by customer
   - Fast lookups by product

4. **Verifies** the table structure

---

## After Running the Migration

Once you've executed the SQL in Neon, the wishlist feature will be fully functional:

✅ Users can add products to wishlist  
✅ Wishlist persists across sessions for logged-in users  
✅ Guest users can use wishlist (stored in browser)  
✅ Automatic sync when guest users log in  

---

## Testing the Feature

1. **Navigate to your shop page**: `/shop`
2. **Click the heart icon** on any product card (top-right corner)
3. **Click the wishlist icon** in the header
4. **View your wishlist** at `/wishlist`

---

## Files Changed

All code changes have been implemented:
- ✅ Database schema updated
- ✅ API endpoints created (`/api/wishlist`)
- ✅ Wishlist context enhanced
- ✅ Wishlist page created (`/wishlist`)
- ✅ Product cards updated with heart icon

**No additional code changes needed!** Just run the SQL migration above.
