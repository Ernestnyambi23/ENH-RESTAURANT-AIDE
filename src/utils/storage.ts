import {
  MenuItem,
  Order,
  RestaurantSettings,
  ConnectedDevice,
  StaffMember,
  BusinessOwnerAccount,
  OneTimePasscode,
  Purchase,
  Capital,
  ShoppingItem,
  MpesaTransaction,
  NotificationItem,
  AuthUser,
  TenantRestaurant,
  RestaurantBranch,
  Supplier,
  PurchaseOrder,
} from '../types';
import {
  DEFAULT_SETTINGS,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_CONNECTED_DEVICES,
  INITIAL_STAFF_MEMBERS,
  INITIAL_BUSINESS_OWNERS,
  INITIAL_OTP_CODES,
  INITIAL_CAPITAL,
  INITIAL_PURCHASES,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_MPESA_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import {
  SAFARI_BISTRO_MENU,
  ZANZIBAR_SPICE_MENU,
  getDefaultMenuItemsForTenant,
} from '../data/restaurantMenus';

export const INITIAL_TENANTS_LIST: TenantRestaurant[] = [
  {
    id: 'ollis-pizza',
    uniqueCode: 'REST-9021',
    name: "Olli's Pizza House & Take Aways",
    businessRegistrationNumber: 'BRELA-TZ-884920 / TIN: 142-990-881',
    businessType: 'Pizzeria, Grill & Take Aways',
    slug: 'ollis-pizza',
    activeBranchId: 'ollis-branch-main',
    branchName: 'Main Branch (Ifakara)',
    ownerId: 'owner_ernest_001',
    tagline: 'Best Pizza & Sizzling Viennas in Dar es Salaam',
    currency: 'TZS',
    logoUrl: '/logo.jpg',
    themeColor: '#1f4d3e',
    status: 'active',
    ownerEmail: 'ernestnyambi23@gmail.com',
    ownerName: 'Ernest Nyambi',
    phone: '+255 713 057 325',
    address: 'Village House (Kijiji), Lipangalala Street,\nThe Place Rd., Near Lipangalala Primary School,\nIfakara, Tanzania.',
    branches: [
      {
        id: 'ollis-branch-main',
        restaurant_id: 'ollis-pizza',
        name: 'Main Branch (Ifakara)',
        code: 'BR-01',
        address: 'Village House (Kijiji), Lipangalala Street, The Place Rd., Ifakara',
        phone: '+255 713 057 325',
        managerName: 'Ernest Nyambi',
        managerPhone: '+255 713 057 325',
        email: 'ernestnyambi23@gmail.com',
        isPrimary: true,
        status: 'active',
        openingHours: '08:00 AM - 11:00 PM',
        createdAt: 1725148800000,
      },
      {
        id: 'ollis-branch-posta',
        restaurant_id: 'ollis-pizza',
        name: 'Downtown Posta Branch',
        code: 'BR-02',
        address: 'Samora Avenue & Azikiwe St, City Centre Posta, Dar es Salaam',
        phone: '+255 714 889 120',
        managerName: 'Kelvin Mushi',
        managerPhone: '+255 714 889 120',
        email: 'posta@ollispizza.co.tz',
        isPrimary: false,
        status: 'active',
        openingHours: '09:00 AM - 10:30 PM',
        createdAt: 1725200000000,
      },
      {
        id: 'ollis-branch-kariakoo',
        restaurant_id: 'ollis-pizza',
        name: 'Kariakoo Express Outlet',
        code: 'BR-03',
        address: 'Msimbazi & Uhuru St Junction, Kariakoo, Dar es Salaam',
        phone: '+255 715 332 901',
        managerName: 'Fatma Juma',
        managerPhone: '+255 715 332 901',
        email: 'kariakoo@ollispizza.co.tz',
        isPrimary: false,
        status: 'active',
        openingHours: '08:30 AM - 11:30 PM',
        createdAt: 1725250000000,
      },
    ],
    categories: ['Pizza', 'Sausages', 'Burgers & Sandwiches', 'Chicken & Meat', 'Drinks & Milkshakes'],
    paymentMethods: ['Cash', 'M-Pesa', 'Card', 'Selcom'],
    isUnderMaintenance: false,
    featureFlags: {
      onlinePayments: true,
      aiOrderAssistant: true,
      smsReceipts: true,
      staffPayroll: true,
      autoPushTill: true,
      kitchenDisplay: true,
      inventoryTracking: true,
    },
    createdAt: 1725148800000,
    updatedAt: Date.now(),
  },
  {
    id: 'safari-bistro',
    uniqueCode: 'REST-4421',
    name: 'Safari Bistro & Grill',
    businessRegistrationNumber: 'BRELA-TZ-551029 / TIN: 201-443-902',
    businessType: 'Authentic African BBQ & Grill House',
    slug: 'safari-bistro',
    activeBranchId: 'safari-branch-clocktower',
    branchName: 'Arusha Clocktower Flagship',
    ownerId: 'owner_juma_002',
    tagline: 'Authentic African BBQ & Savory Skewers',
    currency: 'TZS',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    themeColor: '#b45309',
    status: 'active',
    ownerEmail: 'safari_owner@example.com',
    ownerName: 'Juma Mwakipesile',
    phone: '+255 789 443 211',
    address: 'Clocktower Roundabout, Arusha, Tanzania',
    branches: [
      {
        id: 'safari-branch-clocktower',
        restaurant_id: 'safari-bistro',
        name: 'Arusha Clocktower Flagship',
        code: 'SAF-01',
        address: 'Clocktower Roundabout, Arusha, Tanzania',
        phone: '+255 789 443 211',
        managerName: 'Juma Mwakipesile',
        managerPhone: '+255 789 443 211',
        email: 'safari_owner@example.com',
        isPrimary: true,
        status: 'active',
        openingHours: '10:00 AM - 11:00 PM',
        createdAt: 1725235200000,
      },
      {
        id: 'safari-branch-moshi',
        restaurant_id: 'safari-bistro',
        name: 'Moshi Foothills Outlet',
        code: 'SAF-02',
        address: 'Kibo Plaza, Moshi, Kilimanjaro, Tanzania',
        phone: '+255 788 123 456',
        managerName: 'Godfrey Tarimo',
        managerPhone: '+255 788 123 456',
        email: 'moshi@safaribistro.tz',
        isPrimary: false,
        status: 'active',
        openingHours: '10:00 AM - 10:00 PM',
        createdAt: 1725300000000,
      },
    ],
    categories: ['African BBQ', 'Skewers', 'Plates', 'Sides', 'Beverages'],
    paymentMethods: ['Cash', 'M-Pesa'],
    isUnderMaintenance: false,
    featureFlags: {
      onlinePayments: true,
      aiOrderAssistant: false, // Feature disabled for Restaurant B
      smsReceipts: false,
      staffPayroll: true,
      autoPushTill: false,
      kitchenDisplay: true,
      inventoryTracking: false,
    },
    createdAt: 1725235200000,
    updatedAt: Date.now(),
  },
  {
    id: 'zanzibar-spice',
    uniqueCode: 'REST-7712',
    name: 'Zanzibar Spice & Seafood Port',
    businessRegistrationNumber: 'ZNZ-BIZ-1092 / TIN: 312-778-900',
    businessType: 'Swahili Oceanfront Seafood & Spices',
    slug: 'zanzibar-spice',
    activeBranchId: 'zanzibar-branch-stonetown',
    branchName: 'Stone Town Seafront Port',
    ownerId: 'owner_amina_003',
    tagline: 'Oceanfront Swahili Spices & Fresh Catch',
    currency: 'TZS',
    logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    themeColor: '#0284c7',
    status: 'active',
    ownerEmail: 'spice_zanzibar@example.com',
    ownerName: 'Amina Khamis',
    phone: '+255 777 982 301',
    address: 'Forodhani Gardens, Stone Town, Zanzibar',
    branches: [
      {
        id: 'zanzibar-branch-stonetown',
        restaurant_id: 'zanzibar-spice',
        name: 'Stone Town Seafront Port',
        code: 'ZNZ-01',
        address: 'Forodhani Gardens, Stone Town, Zanzibar',
        phone: '+255 777 982 301',
        managerName: 'Amina Khamis',
        managerPhone: '+255 777 982 301',
        email: 'spice_zanzibar@example.com',
        isPrimary: true,
        status: 'active',
        openingHours: '11:00 AM - Midnight',
        createdAt: 1725321600000,
      },
      {
        id: 'zanzibar-branch-nungwi',
        restaurant_id: 'zanzibar-spice',
        name: 'Nungwi Beach Pavilion',
        code: 'ZNZ-02',
        address: 'North Beach Esplanade, Nungwi, Zanzibar',
        phone: '+255 776 554 433',
        managerName: 'Hassan Ali',
        managerPhone: '+255 776 554 433',
        email: 'nungwi@zanzibarspice.tz',
        isPrimary: false,
        status: 'active',
        openingHours: '12:00 PM - 11:00 PM',
        createdAt: 1725350000000,
      },
    ],
    categories: ['Seafood', 'Swahili Curries', 'Sides', 'Tropical Juices'],
    paymentMethods: ['Cash', 'M-Pesa', 'Card'],
    isUnderMaintenance: false,
    featureFlags: {
      onlinePayments: true,
      aiOrderAssistant: true,
      smsReceipts: true,
      staffPayroll: false,
      autoPushTill: true,
      kitchenDisplay: true,
      inventoryTracking: true,
    },
    createdAt: 1725321600000,
    updatedAt: Date.now(),
  },
];

const STORAGE_KEYS = {
  ITEMS: 'orderup_items_v2',
  ORDERS: 'orderup_orders_v1',
  SETTINGS: 'orderup_settings_v1',
  DEVICES: 'orderup_devices_v1',
  STAFF: 'orderup_staff_v1',
  BUSINESS_OWNERS: 'orderup_business_owners_v1',
  OTP: 'orderup_otp_v1',
  CAPITAL: 'orderup_capital_v1',
  PURCHASES: 'orderup_purchases_v1',
  SHOPPING: 'orderup_shopping_v1',
  MPESA: 'orderup_mpesa_v1',
  NOTIFICATIONS: 'orderup_notifications_v1',
  CURRENT_DEVICE_ID: 'orderup_current_device_id_v1',
  ADMIN_SESSION: 'orderup_admin_session_v1',
  AUTH_USER: 'orderup_auth_user_v1',
  TENANTS: 'orderup_tenants_v1',
  CURRENT_TENANT_ID: 'orderup_current_tenant_id_v1',
  JWT_TOKEN: 'orderup_jwt_token_v1',
  SUPPLIERS: 'orderup_suppliers_v1',
  PURCHASE_ORDERS: 'orderup_purchase_orders_v1',
};

export function getCurrentDeviceId(): string {
  try {
    let devId = localStorage.getItem(STORAGE_KEYS.CURRENT_DEVICE_ID);
    if (!devId) {
      devId = 'dev-current';
      localStorage.setItem(STORAGE_KEYS.CURRENT_DEVICE_ID, devId);
    }
    return devId;
  } catch {
    return 'dev-current';
  }
}

export function loadStoredDevices(): ConnectedDevice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (!raw) {
      saveStoredDevices(INITIAL_CONNECTED_DEVICES);
      return INITIAL_CONNECTED_DEVICES;
    }
    const parsed: ConnectedDevice[] = JSON.parse(raw);
    const curId = getCurrentDeviceId();
    return parsed.map((d) => ({
      ...d,
      isCurrent: d.id === curId,
    }));
  } catch {
    return INITIAL_CONNECTED_DEVICES;
  }
}

export function saveStoredDevices(devices: ConnectedDevice[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  } catch (e) {
    console.error('Failed to save devices', e);
  }
}

export function setDeviceStatus(deviceId: string, status: 'active' | 'disabled' | 'pending_approval'): ConnectedDevice[] {
  const currentDevices = loadStoredDevices();
  const updated = currentDevices.map((d) => {
    if (d.id === deviceId) {
      return {
        ...d,
        status,
        lastActive: Date.now(),
      };
    }
    return d;
  });
  saveStoredDevices(updated);
  return updated;
}

export function loadStoredItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      saveStoredItems(INITIAL_MENU_ITEMS);
      return INITIAL_MENU_ITEMS;
    }
    let parsed: MenuItem[] = JSON.parse(raw);
    let modified = false;

    // 1. Ensure all existing items have a valid restaurant_id (default to ollis-pizza)
    parsed = parsed.map((item) => {
      if (!item.restaurant_id) {
        modified = true;
        return { ...item, restaurant_id: 'ollis-pizza' };
      }
      return item;
    });

    // 2. Ensure Safari Bistro items exist
    const hasSafariItems = parsed.some((item) => item.restaurant_id === 'safari-bistro');
    if (!hasSafariItems) {
      parsed = [...parsed, ...SAFARI_BISTRO_MENU];
      modified = true;
    }

    // 3. Ensure Zanzibar Spice items exist
    const hasZanzibarItems = parsed.some((item) => item.restaurant_id === 'zanzibar-spice');
    if (!hasZanzibarItems) {
      parsed = [...parsed, ...ZANZIBAR_SPICE_MENU];
      modified = true;
    }

    if (modified) {
      saveStoredItems(parsed);
    }
    return parsed;
  } catch {
    return INITIAL_MENU_ITEMS;
  }
}

export function loadStoredItemsForTenant(tenantId: string): MenuItem[] {
  const allItems = loadStoredItems();
  const tenantItems = allItems.filter((i) => (i.restaurant_id || 'ollis-pizza') === tenantId);
  if (tenantItems.length === 0) {
    const defaultForTenant = getDefaultMenuItemsForTenant(tenantId);
    const updatedAll = [...allItems, ...defaultForTenant];
    saveStoredItems(updatedAll);
    return defaultForTenant;
  }
  return tenantItems;
}

export function saveStoredItems(items: MenuItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items', e);
  }
}

export function saveStoredItemsForTenant(tenantId: string, tenantItems: MenuItem[]): void {
  try {
    const allItems = loadStoredItems();
    const otherItems = allItems.filter((i) => (i.restaurant_id || 'ollis-pizza') !== tenantId);
    const updated = [...otherItems, ...tenantItems.map((i) => ({ ...i, restaurant_id: tenantId }))];
    saveStoredItems(updated);
  } catch (e) {
    console.error('Failed to save tenant items', e);
  }
}

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function isOrderExpiredFromTrash(order: Order, now = Date.now()): boolean {
  if (!order.isDeleted || !order.deletedAt) return false;
  return now - order.deletedAt >= TRASH_RETENTION_MS;
}

export function getDaysRemainingInTrash(order: Order, now = Date.now()): number {
  if (!order.deletedAt) return TRASH_RETENTION_DAYS;
  const elapsedMs = now - order.deletedAt;
  const remainingMs = TRASH_RETENTION_MS - elapsedMs;
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

export function purgeExpiredTrashOrders(orders: Order[], now = Date.now()): {
  validOrders: Order[];
  expiredOrderIds: string[];
} {
  const validOrders: Order[] = [];
  const expiredOrderIds: string[] = [];

  orders.forEach((ord) => {
    if (ord.isDeleted && ord.deletedAt && now - ord.deletedAt >= TRASH_RETENTION_MS) {
      expiredOrderIds.push(ord.id);
    } else {
      validOrders.push(ord);
    }
  });

  return { validOrders, expiredOrderIds };
}

export function loadStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      saveStoredOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    const parsed: Order[] = JSON.parse(raw);
    const now = Date.now();
    const mapped = parsed.map((o) => {
      const total = o.total || 0;
      const paid = o.paidAmount !== undefined ? o.paidAmount : (o.isPaid ? total : (o.paymentStatus === 'paid' ? total : 0));
      const debt = o.debtAmount !== undefined ? o.debtAmount : (o.isPaid ? 0 : Math.max(0, total - paid));
      return {
        ...o,
        paidAmount: paid,
        debtAmount: debt,
        isPaid: o.isPaid !== undefined ? o.isPaid : debt === 0,
        isCompleted: o.isCompleted !== undefined ? o.isCompleted : o.status === 'completed',
        settlementStatus: o.settlementStatus || (debt > 0 ? 'debt' : 'paid'),
        isDeleted: o.isDeleted ?? false,
        deletedAt: o.deletedAt,
      };
    });

    // Auto-purge orders that have passed the 30-day retention window
    const { validOrders, expiredOrderIds } = purgeExpiredTrashOrders(mapped, now);
    if (expiredOrderIds.length > 0) {
      saveStoredOrders(validOrders);
    }
    return validOrders;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders', e);
  }
}

export function loadStoredStaff(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!raw) {
      saveStoredStaff(INITIAL_STAFF_MEMBERS);
      return INITIAL_STAFF_MEMBERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STAFF_MEMBERS;
  }
}

export function saveStoredStaff(staff: StaffMember[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  } catch (e) {
    console.error('Failed to save staff', e);
  }
}

export function loadStoredBusinessOwners(): BusinessOwnerAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESS_OWNERS);
    if (!raw) {
      saveStoredBusinessOwners(INITIAL_BUSINESS_OWNERS);
      return INITIAL_BUSINESS_OWNERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BUSINESS_OWNERS;
  }
}

export function saveStoredBusinessOwners(owners: BusinessOwnerAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BUSINESS_OWNERS, JSON.stringify(owners));
  } catch (e) {
    console.error('Failed to save business owners', e);
  }
}

export function loadStoredOTPs(): OneTimePasscode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OTP);
    if (!raw) {
      saveStoredOTPs(INITIAL_OTP_CODES);
      return INITIAL_OTP_CODES;
    }
    const parsed: OneTimePasscode[] = JSON.parse(raw);
    const now = Date.now();
    return parsed.filter((p) => now - p.expiresAt < 86400000);
  } catch {
    return INITIAL_OTP_CODES;
  }
}

export function saveStoredOTPs(otps: OneTimePasscode[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.OTP, JSON.stringify(otps));
  } catch (e) {
    console.error('Failed to save OTP codes', e);
  }
}

export function loadStoredCapital(): Capital {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAPITAL);
    if (!raw) {
      saveStoredCapital(INITIAL_CAPITAL);
      return INITIAL_CAPITAL;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CAPITAL;
  }
}

export function saveStoredCapital(capital: Capital): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CAPITAL, JSON.stringify(capital));
  } catch (e) {
    console.error('Failed to save capital', e);
  }
}

export function loadStoredPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    if (!raw) {
      saveStoredPurchases(INITIAL_PURCHASES);
      return INITIAL_PURCHASES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PURCHASES;
  }
}

export function saveStoredPurchases(purchases: Purchase[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  } catch (e) {
    console.error('Failed to save purchases', e);
  }
}

export function loadStoredShoppingItems(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (!raw) {
      saveStoredShoppingItems(INITIAL_SHOPPING_ITEMS);
      return INITIAL_SHOPPING_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SHOPPING_ITEMS;
  }
}

export function saveStoredShoppingItems(items: ShoppingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save shopping items', e);
  }
}

export function loadStoredMpesaTransactions(): MpesaTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MPESA);
    if (!raw) {
      saveStoredMpesaTransactions(INITIAL_MPESA_TRANSACTIONS);
      return INITIAL_MPESA_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MPESA_TRANSACTIONS;
  }
}

export function saveStoredMpesaTransactions(txs: MpesaTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MPESA, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save mpesa transactions', e);
  }
}

export function loadStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      saveStoredNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function loadStoredSettings(): RestaurantSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveStoredSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const resolvedPassword =
      !parsed.adminPassword || parsed.adminPassword === 'admin'
        ? DEFAULT_SETTINGS.adminPassword
        : String(parsed.adminPassword).trim();

    const resolvedPhone =
      !parsed.phone || parsed.phone === '0713057325' || parsed.phone.includes('754')
        ? '+255713057325'
        : parsed.phone;

    // Default to high-visibility pure white theme if unset or legacy 'light'
    const resolvedTheme =
      parsed.theme === 'dark'
        ? 'dark'
        : parsed.theme === 'light'
        ? 'white'
        : parsed.theme || 'white';

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      phone: resolvedPhone,
      adminPassword: resolvedPassword,
      theme: resolvedTheme,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: RestaurantSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function resetAnalyticsData(): Order[] {
  saveStoredOrders([]);
  return [];
}

export function resetAllData(): {
  items: MenuItem[];
  orders: Order[];
  settings: RestaurantSettings;
  devices: ConnectedDevice[];
  staff: StaffMember[];
  businessOwners: BusinessOwnerAccount[];
  otps: OneTimePasscode[];
  capital: Capital;
  purchases: Purchase[];
  shopping: ShoppingItem[];
  mpesa: MpesaTransaction[];
  notifications: NotificationItem[];
} {
  saveStoredItems(INITIAL_MENU_ITEMS);
  saveStoredOrders(INITIAL_ORDERS);
  saveStoredSettings(DEFAULT_SETTINGS);
  saveStoredDevices(INITIAL_CONNECTED_DEVICES);
  saveStoredStaff(INITIAL_STAFF_MEMBERS);
  saveStoredBusinessOwners(INITIAL_BUSINESS_OWNERS);
  saveStoredOTPs(INITIAL_OTP_CODES);
  saveStoredCapital(INITIAL_CAPITAL);
  saveStoredPurchases(INITIAL_PURCHASES);
  saveStoredShoppingItems(INITIAL_SHOPPING_ITEMS);
  saveStoredMpesaTransactions(INITIAL_MPESA_TRANSACTIONS);
  saveStoredNotifications(INITIAL_NOTIFICATIONS);

  return {
    items: INITIAL_MENU_ITEMS,
    orders: INITIAL_ORDERS,
    settings: DEFAULT_SETTINGS,
    devices: INITIAL_CONNECTED_DEVICES,
    staff: INITIAL_STAFF_MEMBERS,
    businessOwners: INITIAL_BUSINESS_OWNERS,
    otps: INITIAL_OTP_CODES,
    capital: INITIAL_CAPITAL,
    purchases: INITIAL_PURCHASES,
    shopping: INITIAL_SHOPPING_ITEMS,
    mpesa: INITIAL_MPESA_TRANSACTIONS,
    notifications: INITIAL_NOTIFICATIONS,
  };
}

export function resetMenuCatalogOnly(): MenuItem[] {
  saveStoredItems(INITIAL_MENU_ITEMS);
  return INITIAL_MENU_ITEMS;
}

export function purgeOrdersAndTransactions(): { orders: Order[]; mpesa: MpesaTransaction[] } {
  saveStoredOrders([]);
  saveStoredMpesaTransactions([]);
  return { orders: [], mpesa: [] };
}

export function exportFullDatabaseBackup(): string {
  const backup = {
    version: '1.2.1',
    exportedAt: new Date().toISOString(),
    database: 'OrderUp Production Core Database',
    tables: {
      items: loadStoredItems(),
      orders: loadStoredOrders(),
      settings: loadStoredSettings(),
      devices: loadStoredDevices(),
      staff: loadStoredStaff(),
      businessOwners: loadStoredBusinessOwners(),
      otps: loadStoredOTPs(),
      capital: loadStoredCapital(),
      purchases: loadStoredPurchases(),
      shopping: loadStoredShoppingItems(),
      mpesa: loadStoredMpesaTransactions(),
      notifications: loadStoredNotifications(),
    },
  };
  return JSON.stringify(backup, null, 2);
}

export function restoreFullDatabaseBackup(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.tables) {
      return { success: false, error: 'Invalid backup format: missing tables root property' };
    }
    const t = parsed.tables;
    if (Array.isArray(t.items)) saveStoredItems(t.items);
    if (Array.isArray(t.orders)) saveStoredOrders(t.orders);
    if (t.settings && typeof t.settings === 'object') saveStoredSettings(t.settings);
    if (Array.isArray(t.devices)) saveStoredDevices(t.devices);
    if (Array.isArray(t.staff)) saveStoredStaff(t.staff);
    if (Array.isArray(t.businessOwners)) saveStoredBusinessOwners(t.businessOwners);
    if (Array.isArray(t.otps)) saveStoredOTPs(t.otps);
    if (t.capital && typeof t.capital === 'object') saveStoredCapital(t.capital);
    if (Array.isArray(t.purchases)) saveStoredPurchases(t.purchases);
    if (Array.isArray(t.shopping)) saveStoredShoppingItems(t.shopping);
    if (Array.isArray(t.mpesa)) saveStoredMpesaTransactions(t.mpesa);
    if (Array.isArray(t.notifications)) saveStoredNotifications(t.notifications);
    return { success: true };
  } catch (e: unknown) {
    const err = e as Error;
    return { success: false, error: err?.message || 'JSON parse error during restore' };
  }
}

export function getDatabaseMetrics(): {
  totalRows: number;
  storageBytes: number;
  tableCounts: Record<string, number>;
} {
  try {
    const tableCounts = {
      orders: loadStoredOrders().length,
      menu_items: loadStoredItems().length,
      connected_devices: loadStoredDevices().length,
      staff_members: loadStoredStaff().length,
      business_owners: loadStoredBusinessOwners().length,
      purchases: loadStoredPurchases().length,
      shopping_items: loadStoredShoppingItems().length,
      mpesa_transactions: loadStoredMpesaTransactions().length,
      notifications: loadStoredNotifications().length,
    };
    const totalRows = Object.values(tableCounts).reduce((a, b) => a + b, 0);

    let storageBytes = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);
      if (item) {
        storageBytes += (key.length + item.length) * 2;
      }
    }

    return { totalRows, storageBytes, tableCounts };
  } catch {
    return {
      totalRows: 0,
      storageBytes: 0,
      tableCounts: {},
    };
  }
}

export function loadStoredAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredAuthUser(user: AuthUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
}

export function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  } catch (e) {
    console.error('Failed to clear auth user', e);
  }
}

export function loadStoredTenants(): TenantRestaurant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TENANTS);
    if (!raw) {
      saveStoredTenants(INITIAL_TENANTS_LIST);
      return INITIAL_TENANTS_LIST;
    }
    const parsed: TenantRestaurant[] = JSON.parse(raw);
    // Backfill any missing fields for legacy stored tenants
    let modified = false;
    const enriched = parsed.map((t) => {
      const initial = INITIAL_TENANTS_LIST.find((it) => it.id === t.id);
      let tCopy = { ...t };
      if (!tCopy.uniqueCode) {
        tCopy.uniqueCode = initial?.uniqueCode || `REST-${Math.floor(1000 + Math.random() * 9000)}`;
        modified = true;
      }
      if (!tCopy.branchName) {
        tCopy.branchName = initial?.branchName || 'Main Branch';
        modified = true;
      }
      if (!tCopy.categories || tCopy.categories.length === 0) {
        tCopy.categories = initial?.categories || ['Appetizers', 'Main Course'];
        modified = true;
      }
      if (!tCopy.paymentMethods || tCopy.paymentMethods.length === 0) {
        tCopy.paymentMethods = initial?.paymentMethods || ['Cash', 'M-Pesa'];
        modified = true;
      }
      if (tCopy.isUnderMaintenance === undefined) {
        tCopy.isUnderMaintenance = false;
        modified = true;
      }
      if (!tCopy.address || (t.id === 'ollis-pizza' && tCopy.address.includes('Posta Mpya'))) {
        tCopy.address = initial?.address || 'Tanzania';
        modified = true;
      }
      if (!tCopy.phone) {
        tCopy.phone = initial?.phone || '+255713057325';
        modified = true;
      }
      if (!tCopy.branches || tCopy.branches.length === 0) {
        tCopy.branches = initial?.branches || [
          {
            id: `${tCopy.id}-branch-main`,
            restaurant_id: tCopy.id,
            name: tCopy.branchName || 'Main Branch',
            code: 'BR-01',
            address: tCopy.address || 'Tanzania',
            phone: tCopy.phone || '+255713057325',
            managerName: tCopy.ownerName || 'Store Manager',
            isPrimary: true,
            status: 'active',
            openingHours: '08:00 AM - 11:00 PM',
            createdAt: Date.now(),
          },
        ];
        modified = true;
      }
      if (!tCopy.activeBranchId && tCopy.branches && tCopy.branches.length > 0) {
        const primary = tCopy.branches.find((b) => b.isPrimary) || tCopy.branches[0];
        tCopy.activeBranchId = primary.id;
        tCopy.branchName = primary.name;
        modified = true;
      }
      if (!tCopy.businessRegistrationNumber) {
        tCopy.businessRegistrationNumber = initial?.businessRegistrationNumber || `BRELA-${tCopy.uniqueCode}`;
        modified = true;
      }
      if (!tCopy.businessType) {
        tCopy.businessType = initial?.businessType || 'Registered Restaurant & Food Business';
        modified = true;
      }
      return tCopy;
    });

    if (modified) {
      saveStoredTenants(enriched);
    }
    return enriched;
  } catch {
    return INITIAL_TENANTS_LIST;
  }
}

export function saveStoredTenants(tenants: TenantRestaurant[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  } catch (e) {
    console.error('Failed to save tenants list', e);
  }
}

/**
 * Adds a new operating branch to a registered restaurant business.
 * A registered restaurant owner can have multiple branches under their business account.
 */
export function addTenantBranch(
  restaurantId: string,
  branchData: Omit<RestaurantBranch, 'id' | 'createdAt'>
): { updatedTenants: TenantRestaurant[]; newBranch: RestaurantBranch } {
  const tenants = loadStoredTenants();
  const branchId = `${restaurantId}-branch-${Date.now().toString(36)}`;
  const newBranch: RestaurantBranch = {
    ...branchData,
    id: branchId,
    restaurant_id: restaurantId,
    createdAt: Date.now(),
  };

  const updatedTenants = tenants.map((t) => {
    if (t.id === restaurantId) {
      const existingBranches = t.branches || [];
      return {
        ...t,
        branches: [...existingBranches, newBranch],
        updatedAt: Date.now(),
      };
    }
    return t;
  });

  saveStoredTenants(updatedTenants);
  return { updatedTenants, newBranch };
}

/**
 * Updates an existing branch belonging to a registered restaurant business.
 */
export function updateTenantBranch(
  restaurantId: string,
  branchId: string,
  updates: Partial<RestaurantBranch>
): TenantRestaurant[] {
  const tenants = loadStoredTenants();
  const updatedTenants = tenants.map((t) => {
    if (t.id === restaurantId) {
      const branches = (t.branches || []).map((b) => {
        if (b.id === branchId) {
          return { ...b, ...updates };
        }
        return b;
      });
      // If updating active branch name, keep branchName synced
      const activeBranch = branches.find((b) => b.id === t.activeBranchId);
      return {
        ...t,
        branches,
        branchName: activeBranch ? activeBranch.name : t.branchName,
        updatedAt: Date.now(),
      };
    }
    return t;
  });

  saveStoredTenants(updatedTenants);
  return updatedTenants;
}

/**
 * Deletes a branch from a registered restaurant business.
 * Prevents deleting the last remaining branch to guarantee store continuity.
 */
export function deleteTenantBranch(
  restaurantId: string,
  branchId: string
): { success: boolean; message?: string; updatedTenants: TenantRestaurant[] } {
  const tenants = loadStoredTenants();
  const targetTenant = tenants.find((t) => t.id === restaurantId);
  if (!targetTenant || !targetTenant.branches || targetTenant.branches.length <= 1) {
    return {
      success: false,
      message: 'A registered restaurant must retain at least one operating branch / flagship location.',
      updatedTenants: tenants,
    };
  }

  const updatedTenants = tenants.map((t) => {
    if (t.id === restaurantId) {
      const filteredBranches = (t.branches || []).filter((b) => b.id !== branchId);
      let newActiveId = t.activeBranchId;
      let newBranchName = t.branchName;
      if (t.activeBranchId === branchId) {
        const fallback = filteredBranches.find((b) => b.isPrimary) || filteredBranches[0];
        newActiveId = fallback.id;
        newBranchName = fallback.name;
      }
      return {
        ...t,
        branches: filteredBranches,
        activeBranchId: newActiveId,
        branchName: newBranchName,
        updatedAt: Date.now(),
      };
    }
    return t;
  });

  saveStoredTenants(updatedTenants);
  return { success: true, updatedTenants };
}

/**
 * Switches the active operating branch for a registered restaurant business.
 */
export function switchTenantActiveBranch(restaurantId: string, branchId: string): TenantRestaurant[] {
  const tenants = loadStoredTenants();
  const updatedTenants = tenants.map((t) => {
    if (t.id === restaurantId) {
      const targetBranch = (t.branches || []).find((b) => b.id === branchId);
      if (targetBranch) {
        return {
          ...t,
          activeBranchId: targetBranch.id,
          branchName: targetBranch.name,
          updatedAt: Date.now(),
        };
      }
    }
    return t;
  });

  saveStoredTenants(updatedTenants);
  return updatedTenants;
}

/**
 * Permanently deletes a tenant and cascades data isolation deletion across all
 * partitioned items, orders, staff, devices, and records with matching restaurant_id.
 */
export function deleteTenantCascade(tenantId: string): TenantRestaurant[] {
  try {
    const tenants = loadStoredTenants().filter((t) => t.id !== tenantId);
    saveStoredTenants(tenants);

    // Cascade isolated items
    const items = loadStoredItems().filter((item) => (item.restaurant_id || 'ollis-pizza') !== tenantId);
    saveStoredItems(items);

    // Cascade isolated orders
    const orders = loadStoredOrders().filter((ord) => (ord.restaurant_id || 'ollis-pizza') !== tenantId);
    saveStoredOrders(orders);

    // Cascade isolated staff
    const staff = loadStoredStaff().filter((s) => (s.restaurant_id || 'ollis-pizza') !== tenantId);
    saveStoredStaff(staff);

    // Cascade isolated devices
    const devices = loadStoredDevices().filter((d) => (d.restaurant_id || 'ollis-pizza') !== tenantId);
    saveStoredDevices(devices);

    // Cascade isolated purchases
    const purchases = loadStoredPurchases().filter((p) => (p.restaurant_id || 'ollis-pizza') !== tenantId);
    saveStoredPurchases(purchases);

    // Reset current tenant if active
    if (loadCurrentTenantId() === tenantId) {
      const nextTenant = tenants[0]?.id || 'ollis-pizza';
      saveCurrentTenantId(nextTenant);
    }

    return tenants;
  } catch (err) {
    console.error('Error cascading tenant deletion:', err);
    return loadStoredTenants();
  }
}

export function loadCurrentTenantId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_TENANT_ID);
    return stored || 'ollis-pizza';
  } catch {
    return 'ollis-pizza';
  }
}

export function saveCurrentTenantId(tenantId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_TENANT_ID, tenantId);
  } catch (e) {
    console.error('Failed to save current tenant id', e);
  }
}

export function loadStoredJwtToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
  } catch {
    return null;
  }
}

export function saveStoredJwtToken(token: string | null): void {
  try {
    if (!token) {
      localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
    } else {
      localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
    }
  } catch (e) {
    console.error('Failed to save JWT token', e);
  }
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_1',
    restaurant_id: 'ollis-pizza',
    name: 'Fresh Produce Ltd',
    contact: '+255 712 345 678',
    category: 'General Produce',
    email: 'sales@freshproduce.co.tz',
    address: 'Kariakoo Wholesale Market, Stand #14',
    paymentTerms: 'Weekly Net 7',
    balanceDue: 185000,
    notes: 'Delivers daily 6:00 AM organic vegetables, onions and capsicums.',
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'sup_2',
    restaurant_id: 'ollis-pizza',
    name: 'Global Beverage Suppliers',
    contact: '+255 655 987 654',
    category: 'Beverages & Soft Drinks',
    email: 'orders@globalbev.co.tz',
    address: 'Nyerere Road Industrial Park, Warehouse 9B',
    paymentTerms: 'Cash on Delivery',
    balanceDue: 0,
    notes: 'Coca-Cola, tonic, fresh juices, and mineral water crates.',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'sup_3',
    restaurant_id: 'ollis-pizza',
    name: 'Kilimanjaro Dairy & Mozzarella',
    contact: '+255 784 112 233',
    category: 'Dairy & Bakery',
    email: 'info@kilimanjarodairy.co.tz',
    address: 'Bagamoyo Road, Dar es Salaam',
    paymentTerms: 'Bi-weekly Net 14',
    balanceDue: 340000,
    notes: 'Authentic pizza shredded mozzarella blocks and parmesan.',
    createdAt: Date.now() - 40 * 86400000,
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po_1',
    orderNumber: 'PO-2026-001',
    restaurant_id: 'ollis-pizza',
    supplierId: 'sup_1',
    supplierName: 'Fresh Produce Ltd',
    date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    expectedDate: new Date(Date.now() + 1 * 86400000).toISOString().slice(0, 10),
    items: [
      { id: 'poi_1', name: 'Fresh Roma Tomatoes (Crate 25kg)', quantity: 3, unitPrice: 35000, total: 105000 },
      { id: 'poi_2', name: 'Red Onions (Sack 50kg)', quantity: 1, unitPrice: 80000, total: 80000 },
    ],
    totalAmount: 185000,
    status: 'ordered',
    notes: 'Please dispatch before 8:00 AM.',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'po_2',
    orderNumber: 'PO-2026-002',
    restaurant_id: 'ollis-pizza',
    supplierId: 'sup_2',
    supplierName: 'Global Beverage Suppliers',
    date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    items: [
      { id: 'poi_3', name: 'Coca-Cola Zero 350ml Glass (24 pack)', quantity: 4, unitPrice: 22000, total: 88000 },
      { id: 'poi_4', name: 'Mineral Water 500ml (24 pack)', quantity: 6, unitPrice: 12000, total: 72000 },
    ],
    totalAmount: 160000,
    status: 'received',
    notes: 'Received and verified at bar storeroom.',
    createdAt: Date.now() - 5 * 86400000,
  },
];

export function loadStoredSuppliers(): Supplier[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!raw) {
      saveStoredSuppliers(INITIAL_SUPPLIERS);
      return INITIAL_SUPPLIERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUPPLIERS;
  }
}

export function saveStoredSuppliers(suppliers: Supplier[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  } catch (e) {
    console.error('Failed to save suppliers', e);
  }
}

export function loadStoredPurchaseOrders(): PurchaseOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    if (!raw) {
      saveStoredPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      return INITIAL_PURCHASE_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PURCHASE_ORDERS;
  }
}

export function saveStoredPurchaseOrders(pos: PurchaseOrder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(pos));
  } catch (e) {
    console.error('Failed to save purchase orders', e);
  }
}






