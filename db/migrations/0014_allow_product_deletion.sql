-- Migration: Allow product deletion by making productId nullable in orderItems and cartItems
-- This allows products to be deleted while preserving order history

-- Make productId nullable in orderItems and change constraint to SET NULL
ALTER TABLE "orderItems" DROP CONSTRAINT "orderItems_productId_products_id_fk";
ALTER TABLE "orderItems" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_products_id_fk" 
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- Make productId nullable in cartItems and change constraint to SET NULL  
ALTER TABLE "cartItems" DROP CONSTRAINT "cartItems_productId_products_id_fk";
ALTER TABLE "cartItems" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productId_products_id_fk" 
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
