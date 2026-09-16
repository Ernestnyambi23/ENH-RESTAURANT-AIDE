import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth mapping)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('staff'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Restaurant configuration table
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  restaurantName: text('restaurant_name').notNull(),
  tagline: text('tagline'),
  currency: text('currency').default('KES'),
  phone: text('phone'),
  address: text('address'),
  taxRate: integer('tax_rate').default(16),
  defaultDeliveryFee: integer('default_delivery_fee').default(150),
  defaultPrepMinutes: integer('default_prep_minutes').default(20),
  overdueThresholdMinutes: integer('overdue_threshold_minutes').default(30),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Menu items
export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  stock: integer('stock').default(0).notNull(),
  price: integer('price').notNull(),
  description: text('description'),
  icon: text('icon'),
  imageUrl: text('image_url'),
  isPopular: boolean('is_popular').default(false),
  isChefSpecial: boolean('is_chef_special').default(false),
  isSaturdaySpecial: boolean('is_saturday_special').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: text('order_number').notNull(),
  customerName: text('customer_name').notNull(),
  phone: text('phone'),
  orderType: text('order_type').notNull(),
  tableNumber: text('table_number'),
  subtotal: integer('subtotal').default(0),
  tax: integer('tax').default(0),
  deliveryFee: integer('delivery_fee').default(0),
  total: integer('total').notNull(),
  paidAmount: integer('paid_amount').default(0),
  debtAmount: integer('debt_amount').default(0),
  isPaid: boolean('is_paid').default(false),
  isCompleted: boolean('is_completed').default(false),
  paymentMethod: text('payment_method').default('cash'),
  paymentStatus: text('payment_status').default('pending'),
  status: text('status').notNull().default('pending'),
  source: text('source'),
  estimatedPrepMinutes: integer('estimated_prep_minutes').default(20),
  createdAt: timestamp('created_at').defaultNow(),
});

// Staff
export const staffMembers = pgTable('staff_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username'),
  roleTitle: text('role_title').notNull(),
  age: integer('age'),
  emergencyPhone1: text('emergency_phone1'),
  emergencyPhone2: text('emergency_phone2'),
  guardianName: text('guardian_name'),
  agreedSalary: integer('agreed_salary').default(0),
  employmentDate: text('employment_date'),
  salaryPaymentStatus: text('salary_payment_status').default('unpaid'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Purchases / Procurement
export const purchases = pgTable('purchases', {
  id: text('id').primaryKey(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  pricePerUnit: integer('price_per_unit').notNull(),
  totalCost: integer('total_cost').notNull(),
  purchaseDate: text('purchase_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
