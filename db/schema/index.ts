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
  emailVerified: boolean('emailVerified').default(false).notNull(),
  passwordHash: text('passwordHash').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').default('SALESMAN').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Email OTP Verification
export const emailOtps = pgTable('email_otps', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull(),
  otp: text('otp').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Permissions System (Dynamic)
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // Display name (e.g., "Manage Products")
  key: text('key').notNull().unique(), // Unique identifier (e.g., "manage_products")
  description: text('description').notNull(),
  category: text('category').notNull(), // Group permissions (e.g., "Products", "Orders", "System")
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Role Permissions Matrix (Many-to-Many with enabled status)
export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  role: roleEnum('role').notNull(),
  permissionId: text('permissionId').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  enabled: boolean('enabled').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// User-Specific Permissions (Override role permissions for individual users)
export const userPermissions = pgTable('user_permissions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permissionId: text('permissionId').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  enabled: boolean('enabled').default(false).notNull(),
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

// Wishlist Items
export const wishlistItems = pgTable('wishlist_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customerId').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
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
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(),
  order: integer('order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),

  // Homepage Features (Phase 2)
  featuredOnHome: boolean('featuredOnHome').default(false).notNull(),
  homeDisplayOrder: integer('homeDisplayOrder'),
  homeTagline: text('homeTagline'), // "Timeless Elegance"
  homeDescription: text('homeDescription'), // "Handwoven pure silk sarees"

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

  // Basic Product Details
  material: text('material'),
  fabricComposition: text('fabricComposition'),
  weight: text('weight'), // GSM or weight info
  length: text('length'),

  // Saree-Specific Details
  blousePieceIncluded: boolean('blousePieceIncluded').default(false).notNull(),
  workType: text('workType'), // e.g., Handloom, Embroidery, Print
  borderType: text('borderType'), // e.g., Zari Border, Contrast Border
  palluDetails: text('palluDetails'),

  // Additional Info
  occasion: text('occasion'),
  careInstructions: text('careInstructions'),
  washCare: text('washCare'), // Detailed wash care instructions

  // Inventory & SEO
  sku: text('sku'), // Product SKU/Code
  stockQuantity: integer('stockQuantity'), // Stock quantity
  tags: text('tags'), // Comma-separated tags for search
  metaDescription: text('metaDescription'), // SEO meta description

  // Status
  featured: boolean('featured').default(false).notNull(),
  active: boolean('active').default(true).notNull(),

  // Homepage Features (Phase 2)
  isBestseller: boolean('isBestseller').default(false).notNull(),
  bestsellerRank: integer('bestsellerRank'),
  isNewArrival: boolean('isNewArrival').default(false).notNull(),
  newArrivalUntil: timestamp('newArrivalUntil'), // Auto-expire after X days

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

// Homepage Settings & Banners
export const homepageBanners = pgTable('homepage_banners', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  imageUrl: text('imageUrl').notNull(), // Cloudinary URL
  imagePublicId: text('imagePublicId').notNull(), // For deletion
  linkUrl: text('linkUrl'), // Optional link for CTA
  linkText: text('linkText'), // CTA button text
  displayOrder: integer('displayOrder').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Homepage Sections Control (Phase 2)
export const homepageSections = pgTable('homepage_sections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sectionKey: text('sectionKey').notNull().unique(), // 'hero_slider', 'promo_bar', etc.
  sectionName: text('sectionName').notNull(), // Display name
  isActive: boolean('isActive').default(true).notNull(),
  displayOrder: integer('displayOrder').default(0).notNull(),
  description: text('description'), // For admin reference
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Announcements / Promo Bar (Phase 2)
export const announcements = pgTable('announcements', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  text: text('text').notNull(),
  highlightText: text('highlightText'), // Optional highlighted portion
  linkUrl: text('linkUrl'),
  linkText: text('linkText'),
  backgroundColor: text('backgroundColor').default('#8B1538'), // Maroon
  textColor: text('textColor').default('#FFFFFF'),
  isActive: boolean('isActive').default(true).notNull(),
  displayOrder: integer('displayOrder').default(0).notNull(),
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Featured Collections (Phase 2)
export const collections = pgTable('collections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline'), // "Bridal Elegance"
  description: text('description'),
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(), // Cloudinary
  linkUrl: text('linkUrl').notNull(), // Where to redirect
  isFeatured: boolean('isFeatured').default(false),
  isActive: boolean('isActive').default(true).notNull(),
  displayOrder: integer('displayOrder').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Shop by Occasion (Phase 2)
export const occasions = pgTable('occasions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(), // Emoji or icon code
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(),
  gradientFrom: text('gradientFrom').default('from-pink-600/80'),
  gradientTo: text('gradientTo').default('to-red-600/80'),
  linkUrl: text('linkUrl').notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  displayOrder: integer('displayOrder').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Mid-Page Banner (Phase 2)
export const midPageBanner = pgTable('mid_page_banner', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(),
  linkUrl: text('linkUrl'),
  linkText: text('linkText').default('Shop Now'),
  backgroundColor: text('backgroundColor'),
  gradientColor: text('gradientColor').default('#800000'), // Maroon default
  textColor: text('textColor').default('#FFFFFF'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Brand Story (Phase 2)
export const brandStory = pgTable('brand_story', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  heading: text('heading').notNull(),
  subtitle: text('subtitle'), // "About Us"
  description: text('description').notNull(),
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(),
  buttonText: text('buttonText').default('Our Story'),
  buttonLink: text('buttonLink').default('/about'),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Brand Story Stats (Phase 2)
export const brandStoryStats = pgTable('brand_story_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  brandStoryId: text('brandStoryId').notNull().references(() => brandStory.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // "Years of Heritage"
  value: text('value').notNull(), // "50+"
  displayOrder: integer('displayOrder').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Instagram Posts (Phase 2)
export const instagramPosts = pgTable('instagram_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(),
  postUrl: text('postUrl').notNull(), // Instagram post link
  caption: text('caption'),
  likes: integer('likes').default(0),
  isActive: boolean('isActive').default(true).notNull(),
  displayOrder: integer('displayOrder').default(0).notNull(),
  postedAt: timestamp('postedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Instagram Settings (Phase 2)
export const instagramSettings = pgTable('instagram_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  instagramHandle: text('instagramHandle').default('@sudhakantsarees'),
  profileUrl: text('profileUrl'),
  autoSync: boolean('autoSync').default(false), // Future: Auto-fetch from Instagram API
  maxPosts: integer('maxPosts').default(6),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Trust Badges / Features (Phase 2)
export const trustBadges = pgTable('trust_badges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(), // "FREE SHIPPING"
  description: text('description').notNull(),
  iconType: text('iconType').notNull(), // 'shipping', 'payment', 'authentic', 'returns', 'custom'
  iconSvg: text('iconSvg'), // Custom SVG code if iconType is 'custom'
  isActive: boolean('isActive').default(true).notNull(),
  displayOrder: integer('displayOrder').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Hero Slider (Phase 2)
export const heroSlides = pgTable('hero_slides', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  description: text('description'),
  imageUrl: text('imageUrl').notNull(),
  imagePublicId: text('imagePublicId').notNull(),
  ctaText: text('ctaText').default('Shop Now'),
  ctaLink: text('ctaLink'),
  displayOrder: integer('displayOrder').default(0).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Featured Categories for Homepage (Phase 2)
export const featuredCategories = pgTable('featured_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('categoryId').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  displayOrder: integer('displayOrder').default(0).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  // Override fields for homepage customization
  overrideImageUrl: text('overrideImageUrl'),
  overrideImagePublicId: text('overrideImagePublicId'),
  overrideTitle: text('overrideTitle'),
  overrideDescription: text('overrideDescription'),
  overrideLinkUrl: text('overrideLinkUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// Featured Bestsellers for Homepage (Phase 2)
export const featuredBestsellers = pgTable('featured_bestsellers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  displayOrder: integer('displayOrder').default(0).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  // Override fields for homepage customization
  overrideImageUrl: text('overrideImageUrl'),
  overrideImagePublicId: text('overrideImagePublicId'),
  overrideTitle: text('overrideTitle'),
  overrideDescription: text('overrideDescription'),
  overrideLinkUrl: text('overrideLinkUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

// New Arrivals Settings (Phase 2)
export const newArrivalsSettings = pgTable('new_arrivals_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  mode: text('mode').default('automatic').notNull(), // 'automatic' or 'manual'
  count: integer('count').default(8).notNull(), // How many to show if automatic
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});

// Featured New Arrivals for Homepage (Phase 2) - Used when mode is 'manual'
export const featuredNewArrivals = pgTable('featured_new_arrivals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
  displayOrder: integer('displayOrder').default(0).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  // Override fields for homepage customization
  overrideImageUrl: text('overrideImageUrl'),
  overrideImagePublicId: text('overrideImagePublicId'),
  overrideTitle: text('overrideTitle'),
  overrideDescription: text('overrideDescription'),
  overrideLinkUrl: text('overrideLinkUrl'),
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
  wishlistItems: many(wishlistItems),
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

// Permissions Relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  userPermissions: many(userPermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  permission: one(permissions, {
    fields: [userPermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  userPermissions: many(userPermissions),
}));

// Homepage Relations (Phase 2)
export const brandStoryRelations = relations(brandStory, ({ many }) => ({
  stats: many(brandStoryStats),
}));

export const brandStoryStatsRelations = relations(brandStoryStats, ({ one }) => ({
  brandStory: one(brandStory, {
    fields: [brandStoryStats.brandStoryId],
    references: [brandStory.id],
  }),
}));

// Wishlist Relations
export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  customer: one(customers, {
    fields: [wishlistItems.customerId],
    references: [customers.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

