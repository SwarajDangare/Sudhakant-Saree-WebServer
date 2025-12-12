ALTER TABLE "featured_bestsellers" ADD COLUMN "overrideImageUrl" text;--> statement-breakpoint
ALTER TABLE "featured_bestsellers" ADD COLUMN "overrideImagePublicId" text;--> statement-breakpoint
ALTER TABLE "featured_bestsellers" ADD COLUMN "overrideTitle" text;--> statement-breakpoint
ALTER TABLE "featured_bestsellers" ADD COLUMN "overrideDescription" text;--> statement-breakpoint
ALTER TABLE "featured_bestsellers" ADD COLUMN "overrideLinkUrl" text;--> statement-breakpoint
ALTER TABLE "featured_categories" ADD COLUMN "overrideImageUrl" text;--> statement-breakpoint
ALTER TABLE "featured_categories" ADD COLUMN "overrideImagePublicId" text;--> statement-breakpoint
ALTER TABLE "featured_categories" ADD COLUMN "overrideTitle" text;--> statement-breakpoint
ALTER TABLE "featured_categories" ADD COLUMN "overrideDescription" text;--> statement-breakpoint
ALTER TABLE "featured_categories" ADD COLUMN "overrideLinkUrl" text;--> statement-breakpoint
ALTER TABLE "featured_new_arrivals" ADD COLUMN "overrideImageUrl" text;--> statement-breakpoint
ALTER TABLE "featured_new_arrivals" ADD COLUMN "overrideImagePublicId" text;--> statement-breakpoint
ALTER TABLE "featured_new_arrivals" ADD COLUMN "overrideTitle" text;--> statement-breakpoint
ALTER TABLE "featured_new_arrivals" ADD COLUMN "overrideDescription" text;--> statement-breakpoint
ALTER TABLE "featured_new_arrivals" ADD COLUMN "overrideLinkUrl" text;--> statement-breakpoint
ALTER TABLE "collections" DROP COLUMN "productsCount";