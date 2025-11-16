import { pgTable, text, boolean, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('Role', ['SUPER_ADMIN', 'PRODUCT_MANAGER']);

// User Management
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').default('PRODUCT_MANAGER').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Hierarchical Category System
export const sections = pgTable('sections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  order: integer('order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectionId: text('sectionId').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  order: integer('order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Product Management
export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('categoryId').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  material: text('material').notNull(),
  length: text('length').notNull(),
  occasion: text('occasion').notNull(),
  careInstructions: text('careInstructions').notNull(),
  featured: boolean('featured').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Multiple images per product
export const productImages = pgTable('product_images', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('publicId').notNull(), // Cloudinary public ID for deletion
  altText: text('altText'),
  displayOrder: integer('displayOrder').default(0).notNull(),
  isPrimary: boolean('isPrimary').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Color variants
export const productColors = pgTable('product_colors', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  color: text('color').notNull(),
  colorCode: text('colorCode').notNull(),
  inStock: boolean('inStock').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Multiple images per color variant
export const colorImages = pgTable('color_images', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productColorId: text('productColorId').notNull().references(() => productColors.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  publicId: text('publicId').notNull(), // Cloudinary public ID for deletion
  altText: text('altText'),
  displayOrder: integer('displayOrder').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Relations
export const sectionsRelations = relations(sections, ({ many }) => ({
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  section: one(sections, {
    fields: [categories.sectionId],
    references: [sections.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  colors: many(productColors),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productColorsRelations = relations(productColors, ({ one, many }) => ({
  product: one(products, {
    fields: [productColors.productId],
    references: [products.id],
  }),
  images: many(colorImages),
}));

export const colorImagesRelations = relations(colorImages, ({ one }) => ({
  productColor: one(productColors, {
    fields: [colorImages.productColorId],
    references: [productColors.id],
  }),
}));
