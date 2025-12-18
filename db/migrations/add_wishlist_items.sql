-- ============================================
-- WISHLIST FEATURE MIGRATION FOR NEON DATABASE
-- ============================================
-- Run this SQL directly in your Neon SQL Editor
-- This creates the wishlist_items table with all necessary constraints

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
