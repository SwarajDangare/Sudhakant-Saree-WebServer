CREATE TYPE "public"."DiscountType" AS ENUM('NONE', 'PERCENTAGE', 'FIXED');--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "discountType" "DiscountType" DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "discountValue" numeric(10, 2) DEFAULT '0' NOT NULL;