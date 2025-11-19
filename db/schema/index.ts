import { pgTable, text, boolean, timestamp, integer, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('Role', ['SUPER_ADMIN', 'SHOP_MANAGER', 'SALESMAN']);
export const discountTypeEnum = pgEnum('DiscountType', ['NONE', 'PERCENTAGE', 'FIXED']);
export const orderStatusEnum = pgEnum('OrderStatus', ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const paymentMethodEnum = pgEnum('PaymentMethod', ['COD', 'UPI', 'CARD', 'NET_BANKING']);

// User Management (Admin Users)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('passwordHash').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').default('SALESMAN').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Customer Management (Phone-based authentication)
export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  phoneNumber: text('phoneNumber').notNull().unique(),
  name: text('name'),
  email: text('email'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Customer Addresses
export const addresses = pgTable('addresses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customerId').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // Full name for this address
  phoneNumber: text('phoneNumber').notNull(),
  addressLine1: text('addressLine1').notNull(),
  addressLine2: text('addressLine2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),
  isDefault: boolean('isDefault').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Shopping Cart
export const carts = pgTable('carts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customerId').references(() => customers.id, { onDelete: 'cascade' }),
  sessionId: text('sessionId'), // For anonymous users
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Cart Items
export const cartItems = pgTable('cartItems', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cartId: text('cartId').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  productColorId: text('productColorId').references(() => productColors.id, { onDelete: 'set null' }),
  quantity: integer('quantity').default(1).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Orders
export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text('orderNumber').notNull().unique(),
  customerId: text('customerId').notNull().references(() => customers.id, { onDelete: 'restrict' }),
  addressId: text('addressId').notNull().references(() => addresses.id, { onDelete: 'restrict' }),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  paymentMethod: paymentMethodEnum('paymentMethod').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0').notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Order Items
export const orderItems = pgTable('orderItems', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('orderId').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'restrict' }),
  productColorId: text('productColorId').references(() => productColors.id, { onDelete: 'set null' }),
  productName: text('productName').notNull(), // Store product name at time of order
  productColor: text('productColor'), // Store color at time of order
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
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
  discountType: discountTypeEnum('discountType').default('NONE').notNull(),
  discountValue: decimal('discountValue', { precision: 10, scale: 2 }).default('0').notNull(),
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

// Customer Relations
export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
  carts: many(carts),
  orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
  orders: many(orders),
}));

// Cart Relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [carts.customerId],
    references: [customers.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  productColor: one(productColors, {
    fields: [cartItems.productColorId],
    references: [productColors.id],
  }),
}));

// Order Relations
export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  productColor: one(productColors, {
    fields: [orderItems.productColorId],
    references: [productColors.id],
  }),
}));
