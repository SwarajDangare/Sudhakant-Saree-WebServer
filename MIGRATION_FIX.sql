-- =========================================================================
-- HOMEPAGE FIX: Add Missing Columns to mid_page_banner Table
-- =========================================================================
--
-- Issue: The mid_page_banner table is missing backgroundColor and textColor columns
-- causing the homepage to fail with error: column "backgroundColor" does not exist
--
-- Instructions:
-- 1. Open Neon Dashboard (https://console.neon.tech)
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
--
-- This script is safe to run multiple times - it checks for column existence first.
-- =========================================================================

-- Add backgroundColor column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'mid_page_banner'
        AND column_name = 'backgroundColor'
    ) THEN
        ALTER TABLE "mid_page_banner" ADD COLUMN "backgroundColor" text;
        RAISE NOTICE 'Added backgroundColor column to mid_page_banner table';
    ELSE
        RAISE NOTICE 'backgroundColor column already exists in mid_page_banner table';
    END IF;
END $$;

-- Add textColor column if it doesn't exist (with default value)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'mid_page_banner'
        AND column_name = 'textColor'
    ) THEN
        ALTER TABLE "mid_page_banner" ADD COLUMN "textColor" text DEFAULT '#FFFFFF';
        RAISE NOTICE 'Added textColor column to mid_page_banner table';
    ELSE
        RAISE NOTICE 'textColor column already exists in mid_page_banner table';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'mid_page_banner'
AND column_name IN ('backgroundColor', 'textColor');

-- =========================================================================
-- Expected Output:
-- You should see two rows showing:
-- - backgroundColor | text | null
-- - textColor      | text | '#FFFFFF'::text
-- =========================================================================
