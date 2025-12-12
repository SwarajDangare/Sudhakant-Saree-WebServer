CREATE TABLE "homepage_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"imageUrl" text NOT NULL,
	"imagePublicId" text NOT NULL,
	"linkUrl" text,
	"linkText" text,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "material" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "length" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "occasion" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "careInstructions" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "fabricComposition" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "blousePieceIncluded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "workType" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "borderType" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "palluDetails" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "washCare" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "stockQuantity" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "metaDescription" text;