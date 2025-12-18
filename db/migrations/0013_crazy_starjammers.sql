CREATE TABLE "wishlist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"productId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cartItems" DROP CONSTRAINT "cartItems_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "orderItems" DROP CONSTRAINT "orderItems_productId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "cartItems" ALTER COLUMN "productId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orderItems" ALTER COLUMN "productId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;