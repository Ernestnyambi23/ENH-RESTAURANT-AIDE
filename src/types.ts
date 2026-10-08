import { UserRole } from './utils/rbac';

export type Role = 'customer' | 'staff' | 'manager';

export {
  UserRole,
  Module,
  type PermissionAction,
  PERMISSIONS,
  hasPermission,
  authorize,
  type ModuleInfo,
  MODULE_REGISTRY,
  ROLE_PERMISSIONS_REGISTRY,
  getDefaultRolePermissionsConfig,
  loadRolePermissionsConfig,
  saveRolePermissionsConfig,
  isPermissionGranted,
  isTabAllowedForRole,
  applyPresetPermissions,
} from './utils/rbac';


export type TabType =
  | 'order'
  | 'order_received'
  | 'order_completed'
  | 'admin'
  | 'menu'
  | 'orders'
  | 'cart'
  | 'inventory'
  | 'analytics'
  | 'debts'
  | 'finances'
  | 'purchases'
  | 'shopping'
  | 'customers'
  | 'suppliers'
  | 'mpesa'
  | 'notifications';

export type Category =
  | 'All'
  | 'Pizza'
  | 'Sausages'
  | 'Burgers & Sandwiches'
  | 'Chicken & Meat'
  | 'Sides & Snacks'
  | 'Soups & Local Meals'
  | 'Salads'
  | 'Combo Packs & Boxes'
  | 'Drinks & Milkshakes'
  | 'Groceries & Extras'
  | 'Main'
  | 'Snacks'
  | 'Beverages'
  | 'Saturday Special'
  | 'Chicken'
  | 'Meals & Plates'
  | 'Sides & Extras'
  | 'Drinks';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'selcom' | 'tips';

export type SettlementStatus = 'paid' | 'debt';

export type Language = 'en' | 'sw';

export type AppTheme = 'white' | 'light' | 'dark' | 'auto';

export interface Variant {
  label: string; // e.g. "Small", "Medium", "Large"
  price: number; // in TZS / Tsh
}

export interface TenantFeatureFlags {
  onlinePayments: boolean; // M-Pesa / Tigo / Airtel STK push
  aiOrderAssistant: boolean; // Gemini AI Assistant
  smsReceipts: boolean; // SMS & WhatsApp order confirmations
  staffPayroll: boolean; // Monthly salary & attendance calculator
  autoPushTill: boolean; // Auto STK push at checkout
  kitchenDisplay: boolean; // Real-time kitchen tick box queue
  inventoryTracking: boolean; // Ingredient & stock deductions
}

export interface RestaurantBranch {
  id: string; // e.g. "ollis-branch-main", "ollis-branch-posta"
  restaurant_id: string; // Parent registered business/restaurant ID
  name: string; // e.g. "Main Branch (Ifakara)", "Downtown Posta Branch"
  code: string; // e.g. "BR-01", "BR-02"
  address: string;
  phone: string;
  managerName?: string;
  managerPhone?: string;
  email?: string;
  isPrimary: boolean; // Primary or flagship branch of this registered business
  status: 'active' | 'inactive';
  openingHours?: string;
  createdAt: number;
}

export interface TenantRestaurant {
  id: string; // restaurant_id (Registered Business ID in SaaS application)
  uniqueCode: string; // e.g. "REST-9021" - Unique Tenant / Business Access Code
  name: string; // Registered Business Name (e.g. Olli's Pizza House & Take Aways)
  businessRegistrationNumber?: string; // e.g. "TIN-992-102-12" or BRELA Reg No
  businessType?: string; // e.g. "Pizzeria & Grill", "Bistro & Restaurant"
  slug: string;
  tagline: string;
  currency: string;
  logoUrl?: string;
  icon?: string; // custom culinary icon (e.g. pizza, utensils, flame, burger, coffee, chef)
  themeColor: string;
  status: 'active' | 'suspended' | 'trial';
  ownerEmail: string;
  ownerName: string;
  ownerId?: string; // Links Registered Business Owner Account
  branches?: RestaurantBranch[]; // All branches owned by this registered restaurant owner
  activeBranchId?: string; // Currently active operating branch ID
  branchName?: string; // Currently active branch name (kept for fast display)
  categories?: string[];
  paymentMethods?: string[];
  phone: string;
  address: string;
  featureFlags: TenantFeatureFlags;
  isUnderMaintenance?: boolean; // Global or per-tenant maintenance lock
  maintenanceMessage?: string;
  layoutConfig?: Record<string, any>; // Developer drag-and-drop component positioning
  topBarConfig?: TopBarLayoutConfig;
  rolePermissionsConfig?: RolePermissionsConfig;
  customCss?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MenuItem {
  id: string;
  restaurant_id?: string; // Multi-tenant row scoping
  name: string;
  category: string;
  stock: number;
  icon: string; // lucide icon identifier or emoji
  price?: number; // base price if no variants
  variants?: Variant[];
  description?: string;
  isPopular?: boolean;
  isSpicy?: boolean;
  isChefSpecial?: boolean;
  isSaturdaySpecial?: boolean;
  imageUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface CartItem {
  id: string; // unique item id + variant label
  menuItemId: string;
  restaurant_id?: string;
  name: string;
  category: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  icon?: string;
}

export interface Order {
  id: string;
  restaurant_id?: string; // Multi-tenant row scoping (e.g. 'ollis-pizza')
  orderNumber: string; // e.g. "2026-08-31-001" or "#1042"
  orderDate?: string; // YYYY-MM-DD
  orderSequence?: number;
  customerName: string;
  phone?: string;
  arrivalTime?: string; // YYYY-MM-DDTHH:MM for scheduled arrival
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paidAmount: number;
  debtAmount: number;
  isPaid: boolean;
  isCompleted: boolean;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'debt';
  settlementStatus?: SettlementStatus; // 'paid' (OK Paid) or 'debt' (Unpaid Debt)
  debtorName?: string;
  debtorPhone?: string;
  debtNotes?: string;
  debtDueDate?: number;
  debtSettledAt?: number;
  debtSettledMethod?: PaymentMethod;
  debtCleared?: boolean;
  debtClearedDate?: number;
  selcomTransId?: string;
  selcomReference?: string;
  selcomGatewayType?: 'MOBILE' | 'CARD' | 'BANK_QR' | 'TIPS';
  selcomStatus?: string;
  selcomPhone?: string;
  notificationSent?: boolean;
  status: OrderStatus;
  createdAt: number; // timestamp ms
  updatedAt: number;
  orderTimeReceived?: number;
  orderTimeComplete?: number;
  completedAt?: number;
  estimatedPrepMinutes: number;
  notes?: string;
  source: 'Online Kiosk' | 'POS Counter' | 'Mobile Web' | 'Bar Terminal';
  cashierName?: string;
  changeDue?: number;
  isAcknowledged?: boolean;
  checkedItemIndices?: number[]; // indices of items marked as prepared in kitchen
  isDeleted?: boolean; // Soft-delete flag for Trash Bin
  deletedAt?: number; // Timestamp (ms) when order was moved to trash
  deletedBy?: string; // Optional user who deleted the order
  isMerged?: boolean; // True if this bill was consolidated from multiple orders
  mergedFromOrderNumbers?: string[]; // Source order numbers that were merged
  mergedFromOrderIds?: string[]; // Source order IDs that were merged
  mergedAt?: number; // Timestamp ms when merged
}

export interface Purchase {
  id: string;
  restaurant_id?: string;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  purchaseDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
}

export interface Capital {
  id: string;
  amount: number;
  notes?: string;
  updatedAt: number;
}

export interface MpesaTransaction {
  id: string;
  restaurant_id?: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  amount: number;
  transactionDate: number;
  reference: string;
  notes?: string;
  createdAt?: number;
}

export interface ShoppingItem {
  id: string;
  restaurant_id?: string;
  itemName: string;
  quantity?: string;
  estimatedPrice?: number;
  isBought: boolean;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface NotificationItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  phone?: string;
  arrivalTime?: string;
  message: string;
  sentAt: number;
  isRead: boolean;
  type?: 'arrival' | 'ready' | 'debt' | 'payment' | 'system';
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  arrivalTime?: string;
  createdAt: number;
  lastVisit?: number;
  totalOrders: number;
  totalSpent: number;
  totalDebt: number;
}

export interface ConnectedDevice {
  id: string;
  restaurant_id?: string;
  name: string;
  deviceType: 'pos' | 'kitchen_display' | 'kiosk' | 'waiter_phone' | 'manager_laptop';
  assignedLocation: string;
  ipAddress: string;
  browserInfo: string;
  status: 'active' | 'disabled' | 'pending_approval';
  lastActive: number;
  registeredAt: number;
  isCurrent?: boolean;
  pairingCode?: string;
  requestedAt?: number;
}

export interface StaffMember {
  id: string;
  restaurant_id?: string;
  name: string;
  username?: string; // staff username to login to the app
  password?: string; // staff login password / access passcode
  pin?: string; // 4-digit quick access PIN
  roleTitle: string; // e.g. Head Chef, Cashier, Waiter, Manager
  assignedRole?: UserRole; // system role: STAFF, CASHIER, KITCHEN, WAITER, MANAGER, etc.
  accessEnabled?: boolean; // toggle: true (active access) or false (suspended/disabled)
  email?: string;
  phone?: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  fromLocation: string;
  emergencyPhone1: string;
  emergencyPhone2: string;
  guardianName: string;
  agreedSalary: number; // monthly salary in TZS
  employmentDate: string; // YYYY-MM-DD
  salaryPaymentStatus?: 'paid' | 'pending' | 'due_soon';
  lastSalaryPaidDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt?: number;
}

export interface StaffPayrollRecord {
  staffId: string;
  staffName: string;
  roleTitle?: string;
  monthlyGrossSalary: number;
  daysAbsent: number;
  month: number;
  year: number;
  totalDaysInMonth: number;
  calculatedDailyRate: number;
  totalDeduction: number;
  netPayableSalary: number;
  calculatedByAi?: boolean;
  status?: 'pending' | 'paid';
  paidAt?: number;
}

export interface OneTimePasscode {
  id: string;
  code: string; // 6-digit numeric string
  createdAt: number;
  expiresAt: number;
  isUsed: boolean;
  usedByDevice?: string;
  note?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  restaurant_id: string; // "ALL" for Developer/Super Admin, or specific tenant e.g. "ollis-pizza"
  businessId: string | null;
  email?: string;
  avatar?: string;
  token?: string;
  lastLoginAt: number;
  permissions?: string[];
}

export interface BusinessOwnerAccount {
  id: string;
  name: string;
  username: string; // Business owner login username (e.g. ernest_owner)
  password: string; // Business owner login password
  pin?: string; // 4-digit quick PIN
  email?: string;
  phone?: string;
  businessName?: string;
  ownerType?: 'primary' | 'co_owner' | 'franchisee' | 'director';
  accessEnabled: boolean; // toggle: true (active) or false (locked/disabled)
  createdAt: number;
  lastLoginAt?: number;
  notes?: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  currency: string;
  phone: string;
  address: string;
  logoUrl?: string; // custom restaurant brand logo URL or data URL
  taxRate: number; // e.g. 0.0 for included or 0.18
  defaultDeliveryFee: number;
  defaultPrepMinutes: number;
  overdueThresholdMinutes: number;
  enableSoundAlerts: boolean;
  adminPassword: string;
  ownerName: string;
  ownerEmail: string;
  ownershipLicense: string;
  activeBranchId?: string; // Currently active operating branch ID of this registered business
  activeBranchName?: string; // Currently active operating branch name (e.g. Main Branch - Ifakara)
  branches?: RestaurantBranch[]; // All branches of this registered restaurant
  // Appearance & Control additions
  language?: Language;
  theme?: AppTheme;
  headerBgImage?: string;
  backgroundImage?: string; // custom background image data URL or URL from gallery
  backgroundOpacity?: number; // 0.05 to 1.0 (opacity of background wallpaper)
  backgroundBlur?: number; // blur in px (0 to 20)
  reduceBlur?: boolean; // Reduce blur across the app appearance for crisp, high-contrast clarity
  backgroundFit?: 'cover' | 'contain' | 'tile';
  backgroundOverlay?: 'none' | 'light' | 'dark' | 'emerald' | 'warm';
  admissionPolicy?: string;
  hideAdminFromNav?: boolean;
  reportEmails?: string[];
  reportWhatsAppNumber?: string;
  reportDayOfMonth?: number;
  supportPhoneNumber?: string;
  isSaturdayPreview?: boolean; // toggle for testing Saturday specials anytime
  deviceControlEnabled?: boolean; // master toggle: enable/disable device authorization and lockout security
  requireDeviceApproval?: boolean; // require admin approval before new terminal can place orders
  notificationsEnabled?: boolean; // receive app alerts, order dings & updates
  autoBackupEnabled?: boolean; // run daily background system snapshots
  systemLoggingEnabled?: boolean; // send crash reports and network telemetry
  debugModeEnabled?: boolean; // overlay real-time performance and API flags
  lastAutoBackupTime?: number;
  topBarConfig?: TopBarLayoutConfig;
  rolePermissionsConfig?: RolePermissionsConfig;
}

export type RolePermissionCategory = 'function' | 'view' | 'settings';
export type RolePermissionRisk = 'low' | 'medium' | 'high' | 'critical';

export interface RolePermissionItem {
  id: string;
  name: string;
  category: RolePermissionCategory;
  description: string;
  defaultForOwner: boolean;
  defaultForStaff: boolean;
  riskLevel: RolePermissionRisk;
  associatedTab?: TabType;
  associatedAction?: string;
}

export interface RolePermissionsConfig {
  owner: Record<string, boolean>;
  staff: Record<string, boolean>;
  updatedAt?: number;
  updatedBy?: string;
}

export type TopBarPlacement =
  | 'header_left'
  | 'header_center'
  | 'header_right'
  | 'nav_tabs'
  | 'dropdown_menu'
  | 'hidden';

export type TopBarComponentType = 'header_element' | 'nav_tab';

export interface TopBarComponentSetting {
  id: string; // unique identifier
  type: TopBarComponentType;
  name: string; // default name
  customLabel: string; // admin edited / renamed label
  customSubtitle?: string; // optional secondary label or description
  placement: TopBarPlacement; // situated location
  order: number; // sequential order in section
  visible: boolean; // toggle visibility
  showBadge?: boolean; // toggle badge visibility
  icon?: string; // icon identifier
  color?: string; // accent color badge
}

export interface TopBarLayoutConfig {
  components: Record<string, TopBarComponentSetting>;
  headerAlignment?: 'left_right' | 'center_brand' | 'compact' | 'reversed';
  showNavRow?: boolean;
  navTabsStyle?: 'pills' | 'segmented' | 'cards';
  updatedAt?: number;
}

export interface Supplier {
  id: string;
  restaurant_id?: string;
  name: string;
  contact: string;
  category?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  balanceDue?: number;
  paymentTerms?: string;
  notes?: string;
  createdAt: number;
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  restaurant_id?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  expectedDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  notes?: string;
  createdAt: number;
}



