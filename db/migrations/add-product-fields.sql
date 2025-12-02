-- Add new fields to products table for enhanced saree product management
-- Run this in Neon SQL Editor

-- Add new product detail fields
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "fabricComposition" text,
  ADD COLUMN IF NOT EXISTS "weight" text,
  ADD COLUMN IF NOT EXISTS "blousePieceIncluded" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "workType" text,
  ADD COLUMN IF NOT EXISTS "borderType" text,
  ADD COLUMN IF NOT EXISTS "palluDetails" text,
  ADD COLUMN IF NOT EXISTS "washCare" text,
  ADD COLUMN IF NOT EXISTS "sku" text,
  ADD COLUMN IF NOT EXISTS "stockQuantity" integer,
  ADD COLUMN IF NOT EXISTS "tags" text,
  ADD COLUMN IF NOT EXISTS "metaDescription" text;

-- Make existing fields nullable (optional)
ALTER TABLE "products"
  ALTER COLUMN "material" DROP NOT NULL,
  ALTER COLUMN "length" DROP NOT NULL,
  ALTER COLUMN "occasion" DROP NOT NULL,
  ALTER COLUMN "careInstructions" DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN "products"."fabricComposition" IS 'e.g., 100% Silk, Cotton-Silk Blend';
COMMENT ON COLUMN "products"."weight" IS 'Fabric weight in GSM or other units';
COMMENT ON COLUMN "products"."blousePieceIncluded" IS 'Whether blouse piece is included with saree';
COMMENT ON COLUMN "products"."workType" IS 'e.g., Handloom, Embroidery, Print, Woven';
COMMENT ON COLUMN "products"."borderType" IS 'e.g., Zari Border, Contrast Border, Plain Border';
COMMENT ON COLUMN "products"."palluDetails" IS 'Description of pallu design and patterns';
COMMENT ON COLUMN "products"."washCare" IS 'Detailed washing and care instructions';
COMMENT ON COLUMN "products"."sku" IS 'Stock Keeping Unit - Unique product code';
COMMENT ON COLUMN "products"."stockQuantity" IS 'Current stock quantity available';
COMMENT ON COLUMN "products"."tags" IS 'Comma-separated tags for search and filtering';
COMMENT ON COLUMN "products"."metaDescription" IS 'SEO meta description for search engines';

-- Success message
SELECT 'Migration completed successfully! New product fields added.' as message;
