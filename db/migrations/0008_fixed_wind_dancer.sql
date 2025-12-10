CREATE TABLE "announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"highlightText" text,
	"linkUrl" text,
	"linkText" text,
	"backgroundColor" text DEFAULT '#8B1538',
	"textColor" text DEFAULT '#FFFFFF',
	"isActive" boolean DEFAULT true NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"startDate" timestamp,
	"endDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_story" (
	"id" text PRIMARY KEY NOT NULL,
	"heading" text NOT NULL,
	"subtitle" text,
	"description" text NOT NULL,
	"imageUrl" text NOT NULL,
	"imagePublicId" text NOT NULL,
	"buttonText" text DEFAULT 'Our Story',
	"buttonLink" text DEFAULT '/about',
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_story_stats" (
	"id" text PRIMARY KEY NOT NULL,
	"brandStoryId" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text,
	"description" text,
	"imageUrl" text NOT NULL,
	"imagePublicId" text NOT NULL,
	"linkUrl" text NOT NULL,
	"productsCount" integer DEFAULT 0,
	"isFeatured" boolean DEFAULT false,
	"isActive" boolean DEFAULT true NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "homepage_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"sectionKey" text NOT NULL,
	"sectionName" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "homepage_sections_sectionKey_unique" UNIQUE("sectionKey")
);
--> statement-breakpoint
CREATE TABLE "instagram_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"imageUrl" text NOT NULL,
	"imagePublicId" text NOT NULL,
	"postUrl" text NOT NULL,
	"caption" text,
	"likes" integer DEFAULT 0,
	"isActive" boolean DEFAULT true NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"postedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instagram_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"instagramHandle" text DEFAULT '@sudhakantsarees',
	"profileUrl" text,
	"autoSync" boolean DEFAULT false,
	"maxPosts" integer DEFAULT 6,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mid_page_banner" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"imageUrl" text NOT NULL,
	"imagePublicId" text NOT NULL,
	"linkUrl" text,
	"linkText" text DEFAULT 'Shop Now',
	"backgroundColor" text,
	"textColor" text DEFAULT '#FFFFFF',
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occasions" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"imageUrl" text NOT NULL,
	"imagePublicId" text NOT NULL,
	"gradientFrom" text DEFAULT 'from-pink-600/80',
	"gradientTo" text DEFAULT 'to-red-600/80',
	"linkUrl" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "occasions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "trust_badges" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"iconType" text NOT NULL,
	"iconSvg" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "featuredOnHome" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "homeDisplayOrder" integer;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "homeTagline" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "homeDescription" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "isBestseller" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "bestsellerRank" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "isNewArrival" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "newArrivalUntil" timestamp;--> statement-breakpoint
ALTER TABLE "brand_story_stats" ADD CONSTRAINT "brand_story_stats_brandStoryId_brand_story_id_fk" FOREIGN KEY ("brandStoryId") REFERENCES "public"."brand_story"("id") ON DELETE cascade ON UPDATE no action;