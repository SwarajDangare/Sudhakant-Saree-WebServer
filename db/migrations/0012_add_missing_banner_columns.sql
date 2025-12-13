-- Migration: Add missing backgroundColor and textColor columns to mid_page_banner table
-- This migration safely adds columns that were defined in schema but may not exist in production database

-- Add backgroundColor column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'mid_page_banner' AND column_name = 'backgroundColor'
    ) THEN
        ALTER TABLE "mid_page_banner" ADD COLUMN "backgroundColor" text;
    END IF;
END $$;

-- Add textColor column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'mid_page_banner' AND column_name = 'textColor'
    ) THEN
        ALTER TABLE "mid_page_banner" ADD COLUMN "textColor" text DEFAULT '#FFFFFF';
    END IF;
END $$;
