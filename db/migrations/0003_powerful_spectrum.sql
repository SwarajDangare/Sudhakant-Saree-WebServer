ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SALESMAN'::text;--> statement-breakpoint
DROP TYPE "public"."Role";--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SALESMAN'::"public"."Role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."Role" USING "role"::"public"."Role";