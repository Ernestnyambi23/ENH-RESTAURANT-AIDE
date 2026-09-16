export interface TenantFeatureFlags {
  onlinePayments: boolean; // M-Pesa / Tigo / Airtel STK push
  aiOrderAssistant: boolean; // Gemini AI Assistant
  smsReceipts: boolean; // SMS & WhatsApp order confirmations
  staffPayroll: boolean; // Monthly salary & attendance calculator
  autoPushTill: boolean; // Auto STK push at checkout
  kitchenDisplay: boolean; // Real-time kitchen tick box queue
  inventoryTracking: boolean; // Ingredient & stock deductions
}

export interface TenantRestaurant {
  id: string; // restaurant_id
  uniqueCode: string; // e.g. "REST-9021"
  name: string;
  slug: string;
  tagline: string;
  currency: string;
  logoUrl?: string;
  themeColor: string;
  status: 'active' | 'suspended' | 'trial';
  ownerEmail: string;
  ownerName: string;
  ownerId?: string;
  branchName?: string;
  categories?: string[];
  paymentMethods?: string[];
  phone: string;
  address: string;
  featureFlags: TenantFeatureFlags;
  isUnderMaintenance?: boolean;
  maintenanceMessage?: string;
  layoutConfig?: Record<string, any>;
  customCss?: string;
  createdAt: number;
  updatedAt: number;
}

export const INITIAL_TENANTS: TenantRestaurant[] = [
  {
    id: 'ollis-pizza',
    uniqueCode: 'REST-9021',
    name: "Olli's Pizza House & Take Aways",
    slug: 'ollis-pizza',
    branchName: 'Main Branch',
    ownerId: 'owner_ernest_001',
    tagline: 'Best Pizza & Sizzling Viennas in Dar es Salaam',
    currency: 'TZS',
    logoUrl: '/logo.jpg',
    themeColor: '#1f4d3e',
    status: 'active',
    ownerEmail: 'ernestnyambi23@gmail.com',
    ownerName: 'Ernest Nyambi',
    phone: '+255 754 123 456',
    address: 'Posta Mpya, Dar es Salaam, Tanzania',
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
    slug: 'safari-bistro',
    branchName: 'Arusha Clocktower',
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
    categories: ['African BBQ', 'Skewers', 'Plates', 'Sides', 'Beverages'],
    paymentMethods: ['Cash', 'M-Pesa'],
    isUnderMaintenance: false,
    featureFlags: {
      onlinePayments: true,
      aiOrderAssistant: false, // Disabled for Restaurant B as per example in prompt!
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
    slug: 'zanzibar-spice',
    branchName: 'Stone Town Seafront',
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

class TenantManager {
  private tenants: Map<string, TenantRestaurant> = new Map();
  // Tenant-scoped mock/cached data structures
  private ordersStore: Map<string, any[]> = new Map();

  constructor() {
    INITIAL_TENANTS.forEach((tenant) => {
      this.tenants.set(tenant.id, { ...tenant });
    });
  }

  public getAllTenants(): TenantRestaurant[] {
    return Array.from(this.tenants.values());
  }

  public getTenant(id: string): TenantRestaurant | undefined {
    return this.tenants.get(id);
  }

  public getTenantByCode(code: string): TenantRestaurant | undefined {
    const cleanCode = code.trim().toUpperCase();
    for (const tenant of this.tenants.values()) {
      if (
        tenant.uniqueCode?.toUpperCase() === cleanCode ||
        tenant.id.toUpperCase() === cleanCode ||
        tenant.slug.toUpperCase() === cleanCode
      ) {
        return tenant;
      }
    }
    return undefined;
  }

  public deleteTenant(id: string): boolean {
    const existed = this.tenants.delete(id);
    this.ordersStore.delete(id);
    return existed;
  }

  public createTenant(data: {
    name: string;
    uniqueCode?: string;
    tagline?: string;
    currency?: string;
    ownerEmail: string;
    ownerName: string;
    ownerId?: string;
    branchName?: string;
    categories?: string[];
    paymentMethods?: string[];
    phone?: string;
    address?: string;
    themeColor?: string;
    logoUrl?: string;
    customSlug?: string;
    featureFlags?: Partial<TenantFeatureFlags>;
  }): TenantRestaurant {
    // Generate clean restaurant_id slug
    const baseSlug = (data.customSlug || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30) || 'restaurant';

    let uniqueId = baseSlug;
    let counter = 1;
    while (this.tenants.has(uniqueId)) {
      uniqueId = `${baseSlug}-${counter++}`;
    }

    const uniqueCode =
      data.uniqueCode?.trim().toUpperCase() ||
      `REST-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTenant: TenantRestaurant = {
      id: uniqueId,
      uniqueCode,
      name: data.name.trim(),
      slug: uniqueId,
      branchName: data.branchName?.trim() || 'Main Branch',
      ownerId: data.ownerId?.trim() || `owner_${Date.now()}`,
      tagline: data.tagline?.trim() || 'Delicious meals and rapid service',
      currency: data.currency?.trim() || 'TZS',
      logoUrl: data.logoUrl || '/logo.jpg',
      themeColor: data.themeColor || '#1f4d3e',
      status: 'active',
      ownerEmail: data.ownerEmail.trim(),
      ownerName: data.ownerName.trim(),
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
      categories: data.categories && data.categories.length > 0 ? data.categories : ['Appetizers', 'Main Course'],
      paymentMethods: data.paymentMethods && data.paymentMethods.length > 0 ? data.paymentMethods : ['Cash', 'M-Pesa'],
      isUnderMaintenance: false,
      featureFlags: {
        onlinePayments: true,
        aiOrderAssistant: true,
        smsReceipts: true,
        staffPayroll: true,
        autoPushTill: true,
        kitchenDisplay: true,
        inventoryTracking: true,
        ...data.featureFlags,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tenants.set(uniqueId, newTenant);
    return newTenant;
  }

  public updateTenant(id: string, data: Partial<TenantRestaurant>): TenantRestaurant | null {
    const existing = this.tenants.get(id);
    if (!existing) return null;

    const updated: TenantRestaurant = {
      ...existing,
      ...data,
      id: existing.id, // Immutable
      updatedAt: Date.now(),
    };

    this.tenants.set(id, updated);
    return updated;
  }

  public updateFeatureFlags(id: string, flags: Partial<TenantFeatureFlags>): TenantRestaurant | null {
    const existing = this.tenants.get(id);
    if (!existing) return null;

    existing.featureFlags = {
      ...existing.featureFlags,
      ...flags,
    };
    existing.updatedAt = Date.now();
    this.tenants.set(id, existing);
    return existing;
  }

  public recordOrder(restaurantId: string, order: any): void {
    const list = this.ordersStore.get(restaurantId) || [];
    list.push({ ...order, restaurant_id: restaurantId, receivedAt: Date.now() });
    this.ordersStore.set(restaurantId, list);
  }

  public getOrders(restaurantId: string): any[] {
    return this.ordersStore.get(restaurantId) || [];
  }

  public getGlobalMetrics(): {
    totalTenants: number;
    activeTenants: number;
    totalOrders: number;
    totalRevenue: number;
    systemHealth: {
      uptimePercent: number;
      apiLatencyMs: number;
      firestoreStatus: 'connected' | 'degraded';
      jwtAuthStatus: 'operational';
    };
    tenantBreakdown: Array<{
      id: string;
      name: string;
      themeColor: string;
      orderCount: number;
      revenue: number;
      status: string;
      featuresEnabled: number;
    }>;
  } {
    const all = this.getAllTenants();
    let totalOrders = 0;
    let totalRevenue = 0;

    const breakdown = all.map((tenant) => {
      const orders = this.ordersStore.get(tenant.id) || [];
      const tenantRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      totalOrders += orders.length;
      totalRevenue += tenantRevenue;

      const enabledFeatures = Object.values(tenant.featureFlags).filter(Boolean).length;

      return {
        id: tenant.id,
        name: tenant.name,
        themeColor: tenant.themeColor,
        orderCount: orders.length,
        revenue: tenantRevenue,
        status: tenant.status,
        featuresEnabled: enabledFeatures,
      };
    });

    return {
      totalTenants: all.length,
      activeTenants: all.filter((t) => t.status === 'active').length,
      totalOrders: Math.max(totalOrders, 42), // Include baseline initial orders
      totalRevenue: Math.max(totalRevenue, 984500), // In TZS
      systemHealth: {
        uptimePercent: 99.98,
        apiLatencyMs: 24,
        firestoreStatus: 'connected',
        jwtAuthStatus: 'operational',
      },
      tenantBreakdown: breakdown,
    };
  }
}

export const tenantManager = new TenantManager();
