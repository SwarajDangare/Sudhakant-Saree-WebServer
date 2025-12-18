CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"productColorId" text,
	"size" text,
	"stockQuantity" integer DEFAULT 0 NOT NULL,
	"sku" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cartItems" ADD COLUMN "productVariantId" text;--> statement-breakpoint
ALTER TABLE "cartItems" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "productVariantId" text;--> statement-breakpoint
ALTER TABLE "orderItems" ADD COLUMN "size" text;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productColorId_product_colors_id_fk" FOREIGN KEY ("productColorId") REFERENCES "public"."product_colors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productVariantId_product_variants_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productVariantId_product_variants_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;