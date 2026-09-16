import { TopBarComponentSetting, TopBarLayoutConfig, TopBarPlacement } from '../types';

export const DEFAULT_TOPBAR_COMPONENTS: Record<string, TopBarComponentSetting> = {
  // --- Header Elements ---
  logo: {
    id: 'logo',
    type: 'header_element',
    name: 'Business Logo Icon',
    customLabel: 'Business Logo',
    placement: 'header_left',
    order: 1,
    visible: true,
    icon: 'Image',
    color: '#10b981',
  },
  brand_title: {
    id: 'brand_title',
    type: 'header_element',
    name: 'Restaurant Name & Tagline',
    customLabel: '', // Defaults to restaurantName
    customSubtitle: '', // Defaults to tagline
    placement: 'header_left',
    order: 2,
    visible: true,
    icon: 'Heading',
    color: '#f59e0b',
  },
  branch_switcher: {
    id: 'branch_switcher',
    type: 'header_element',
    name: 'Branch / Location Badge',
    customLabel: 'Branch',
    placement: 'header_left',
    order: 3,
    visible: false, // Can be situated in header_left, header_center, header_right, or dropdown_menu
    icon: 'Store',
    color: '#8b5cf6',
  },
  role_badge: {
    id: 'role_badge',
    type: 'header_element',
    name: 'Role & Security Badge',
    customLabel: 'Role Portal',
    placement: 'dropdown_menu',
    order: 1,
    visible: true,
    icon: 'Shield',
    color: '#6366f1',
  },
  notifications: {
    id: 'notifications',
    type: 'header_element',
    name: 'Arrival & System Alerts Bell',
    customLabel: 'Alerts',
    placement: 'header_right',
    order: 2,
    visible: true,
    showBadge: true,
    icon: 'Bell',
    color: '#ef4444',
  },
  cart: {
    id: 'cart',
    type: 'header_element',
    name: 'Quick Cart & Bag Trigger',
    customLabel: 'Cart',
    placement: 'header_right',
    order: 3,
    visible: true,
    showBadge: true,
    icon: 'ShoppingBag',
    color: '#c8791f',
  },
  menu_button: {
    id: 'menu_button',
    type: 'header_element',
    name: 'Three-Dots Menu Trigger (⋮)',
    customLabel: 'Menu (⋮)',
    placement: 'header_right',
    order: 4,
    visible: true,
    icon: 'MoreVertical',
    color: '#14b8a6',
  },

  // --- Primary Navigation Bar Tabs ---
  tab_order: {
    id: 'tab_order',
    type: 'nav_tab',
    name: 'Order / Customer Menu',
    customLabel: 'Order',
    customSubtitle: 'POS ordering & dish selection',
    placement: 'nav_tabs',
    order: 1,
    visible: true,
    icon: 'UtensilsCrossed',
    color: '#10b981',
  },
  tab_order_received: {
    id: 'tab_order_received',
    type: 'nav_tab',
    name: 'Order Received / Live Kitchen',
    customLabel: 'Order Received',
    customSubtitle: 'Live preparation queue with tick boxes',
    placement: 'nav_tabs',
    order: 2,
    visible: true,
    showBadge: true,
    icon: 'CheckSquare',
    color: '#c8791f',
  },
  tab_order_completed: {
    id: 'tab_order_completed',
    type: 'nav_tab',
    name: 'Completed Orders / History',
    customLabel: 'Completed',
    customSubtitle: 'Fulfilled orders & dispatch history',
    placement: 'nav_tabs',
    order: 3,
    visible: true,
    showBadge: true,
    icon: 'CheckCircle2',
    color: '#34d399',
  },

  // --- Secondary Operations / Available in Nav Tabs, Dropdown or Hidden ---
  tab_debts: {
    id: 'tab_debts',
    type: 'nav_tab',
    name: 'Customer Debts & Credit Tabs',
    customLabel: 'Debts / Credit',
    customSubtitle: 'Customer tabs & debt ledger',
    placement: 'dropdown_menu',
    order: 4,
    visible: true,
    showBadge: true,
    icon: 'Clock',
    color: '#f43f5e',
  },
  tab_inventory: {
    id: 'tab_inventory',
    type: 'nav_tab',
    name: 'Stock & Inventory Control',
    customLabel: 'Inventory',
    customSubtitle: 'Stock levels, pricing & recipes',
    placement: 'dropdown_menu',
    order: 5,
    visible: true,
    icon: 'Boxes',
    color: '#0ea5e9',
  },
  tab_purchases: {
    id: 'tab_purchases',
    type: 'nav_tab',
    name: 'Procurement & Purchases',
    customLabel: 'Purchases',
    customSubtitle: 'Daily supplies & expense receipts',
    placement: 'dropdown_menu',
    order: 6,
    visible: true,
    icon: 'Receipt',
    color: '#eab308',
  },
  tab_shopping: {
    id: 'tab_shopping',
    type: 'nav_tab',
    name: 'Market Shopping List',
    customLabel: 'Shopping List',
    customSubtitle: 'Market checklist & restock items',
    placement: 'dropdown_menu',
    order: 7,
    visible: true,
    icon: 'ListOrdered',
    color: '#a855f7',
  },
  tab_mpesa: {
    id: 'tab_mpesa',
    type: 'nav_tab',
    name: 'M-Pesa Live Statements',
    customLabel: 'M-Pesa Live',
    customSubtitle: 'Mobile money push & receipts',
    placement: 'dropdown_menu',
    order: 8,
    visible: true,
    icon: 'Smartphone',
    color: '#10b981',
  },
  tab_finances: {
    id: 'tab_finances',
    type: 'nav_tab',
    name: 'Finances & Cash Register',
    customLabel: 'Finances',
    customSubtitle: 'Capital ledger & cash reconciliations',
    placement: 'dropdown_menu',
    order: 9,
    visible: true,
    icon: 'Wallet',
    color: '#14b8a6',
  },
  tab_customers: {
    id: 'tab_customers',
    type: 'nav_tab',
    name: 'Customer Directory',
    customLabel: 'Customers',
    customSubtitle: 'VIP directory & visit logs',
    placement: 'dropdown_menu',
    order: 10,
    visible: true,
    icon: 'Users',
    color: '#3b82f6',
  },
  tab_analytics: {
    id: 'tab_analytics',
    type: 'nav_tab',
    name: 'Audit & Analytics Reports',
    customLabel: 'Analytics',
    customSubtitle: 'Hourly sales, P&L and PDF audits',
    placement: 'dropdown_menu',
    order: 11,
    visible: true,
    icon: 'BarChart3',
    color: '#06b6d4',
  },
  tab_suppliers: {
    id: 'tab_suppliers',
    type: 'nav_tab',
    name: 'Suppliers & Vendors',
    customLabel: 'Suppliers',
    customSubtitle: 'Raw materials & purchase orders',
    placement: 'dropdown_menu',
    order: 12,
    visible: true,
    icon: 'Truck',
    color: '#10b981',
  },
  tab_settings: {
    id: 'tab_settings',
    type: 'nav_tab',
    name: 'Settings & Admin Controls',
    customLabel: 'Admin Settings',
    customSubtitle: 'Printers, taxes, receipt layout & security',
    placement: 'hidden',
    order: 13,
    visible: false,
    icon: 'Sliders',
    color: '#f59e0b',
  },
};

export const DEFAULT_TOPBAR_CONFIG: TopBarLayoutConfig = {
  components: DEFAULT_TOPBAR_COMPONENTS,
  headerAlignment: 'left_right',
  showNavRow: true,
  navTabsStyle: 'pills',
  updatedAt: Date.now(),
};

const STORAGE_KEY = 'enh_topbar_layout_config_v1';

/**
 * Merge user configuration safely with defaults so no newer components are lost
 */
export function resolveTopBarConfig(customConfig?: TopBarLayoutConfig | null): TopBarLayoutConfig {
  if (!customConfig || !customConfig.components) {
    // Try localStorage if available
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.components) {
          return mergeWithDefaults(parsed);
        }
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_TOPBAR_CONFIG };
  }

  return mergeWithDefaults(customConfig);
}

function mergeWithDefaults(userConfig: TopBarLayoutConfig): TopBarLayoutConfig {
  const mergedComponents: Record<string, TopBarComponentSetting> = { ...DEFAULT_TOPBAR_COMPONENTS };

  Object.entries(userConfig.components || {}).forEach(([key, userComp]) => {
    if (mergedComponents[key]) {
      mergedComponents[key] = {
        ...mergedComponents[key],
        ...userComp,
        // Ensure id and type match
        id: key,
        type: mergedComponents[key].type,
      };
    } else {
      // Dynamic custom component
      mergedComponents[key] = userComp;
    }
  });

  return {
    ...DEFAULT_TOPBAR_CONFIG,
    ...userConfig,
    components: mergedComponents,
  };
}

export function getComponentsByPlacement(
  config: TopBarLayoutConfig,
  placement: TopBarPlacement
): TopBarComponentSetting[] {
  const all = Object.values(config.components || {});
  return all
    .filter((comp) => comp.visible && comp.placement === placement)
    .sort((a, b) => a.order - b.order);
}

export function saveTopBarConfigToLocalStorage(config: TopBarLayoutConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save top bar configuration to localStorage', err);
  }
}

export const PRESET_TOPBAR_LAYOUTS: Record<string, { label: string; description: string; config: Partial<TopBarLayoutConfig> }> = {
  classic_pos: {
    label: 'Standard POS Layout',
    description: 'Logo & Name on left, Cart & Alerts on right, 3 primary operational tabs.',
    config: {
      headerAlignment: 'left_right',
      showNavRow: true,
      navTabsStyle: 'pills',
      components: {
        logo: { ...DEFAULT_TOPBAR_COMPONENTS.logo, placement: 'header_left', order: 1, visible: true },
        brand_title: { ...DEFAULT_TOPBAR_COMPONENTS.brand_title, placement: 'header_left', order: 2, visible: true },
        branch_switcher: { ...DEFAULT_TOPBAR_COMPONENTS.branch_switcher, placement: 'header_left', order: 3, visible: false },
        notifications: { ...DEFAULT_TOPBAR_COMPONENTS.notifications, placement: 'header_right', order: 1, visible: true },
        cart: { ...DEFAULT_TOPBAR_COMPONENTS.cart, placement: 'header_right', order: 2, visible: true },
        menu_button: { ...DEFAULT_TOPBAR_COMPONENTS.menu_button, placement: 'header_right', order: 3, visible: true },
        tab_order: { ...DEFAULT_TOPBAR_COMPONENTS.tab_order, placement: 'nav_tabs', order: 1, visible: true },
        tab_order_received: { ...DEFAULT_TOPBAR_COMPONENTS.tab_order_received, placement: 'nav_tabs', order: 2, visible: true },
        tab_order_completed: { ...DEFAULT_TOPBAR_COMPONENTS.tab_order_completed, placement: 'nav_tabs', order: 3, visible: true },
      },
    },
  },
  full_power_tabs: {
    label: 'Full Power Multi-Module Tabs',
    description: 'Includes Debts, Inventory, and Analytics directly visible in the top navigation row.',
    config: {
      headerAlignment: 'left_right',
      showNavRow: true,
      navTabsStyle: 'segmented',
      components: {
        logo: { ...DEFAULT_TOPBAR_COMPONENTS.logo, placement: 'header_left', order: 1, visible: true },
        brand_title: { ...DEFAULT_TOPBAR_COMPONENTS.brand_title, placement: 'header_left', order: 2, visible: true },
        tab_order: { ...DEFAULT_TOPBAR_COMPONENTS.tab_order, placement: 'nav_tabs', order: 1, visible: true },
        tab_order_received: { ...DEFAULT_TOPBAR_COMPONENTS.tab_order_received, placement: 'nav_tabs', order: 2, visible: true },
        tab_order_completed: { ...DEFAULT_TOPBAR_COMPONENTS.tab_order_completed, placement: 'nav_tabs', order: 3, visible: true },
        tab_debts: { ...DEFAULT_TOPBAR_COMPONENTS.tab_debts, placement: 'nav_tabs', order: 4, visible: true },
        tab_inventory: { ...DEFAULT_TOPBAR_COMPONENTS.tab_inventory, placement: 'nav_tabs', order: 5, visible: true },
        tab_analytics: { ...DEFAULT_TOPBAR_COMPONENTS.tab_analytics, placement: 'nav_tabs', order: 6, visible: true },
      },
    },
  },
  centered_brand: {
    label: 'Centered Brand & Clean Bar',
    description: 'Brand centered in the top bar with balanced left and right action controls.',
    config: {
      headerAlignment: 'center_brand',
      showNavRow: true,
      navTabsStyle: 'cards',
      components: {
        logo: { ...DEFAULT_TOPBAR_COMPONENTS.logo, placement: 'header_center', order: 1, visible: true },
        brand_title: { ...DEFAULT_TOPBAR_COMPONENTS.brand_title, placement: 'header_center', order: 2, visible: true },
        notifications: { ...DEFAULT_TOPBAR_COMPONENTS.notifications, placement: 'header_left', order: 1, visible: true },
        cart: { ...DEFAULT_TOPBAR_COMPONENTS.cart, placement: 'header_right', order: 1, visible: true },
        menu_button: { ...DEFAULT_TOPBAR_COMPONENTS.menu_button, placement: 'header_right', order: 2, visible: true },
      },
    },
  },
  minimalist_compact: {
    label: 'Compact Minimalist',
    description: 'Slim streamlined header giving maximum screen space to the cashier dishes and tickets.',
    config: {
      headerAlignment: 'compact',
      showNavRow: true,
      navTabsStyle: 'pills',
      components: {
        logo: { ...DEFAULT_TOPBAR_COMPONENTS.logo, placement: 'header_left', order: 1, visible: true },
        brand_title: { ...DEFAULT_TOPBAR_COMPONENTS.brand_title, placement: 'header_left', order: 2, visible: true },
        notifications: { ...DEFAULT_TOPBAR_COMPONENTS.notifications, placement: 'header_right', order: 1, visible: false },
        cart: { ...DEFAULT_TOPBAR_COMPONENTS.cart, placement: 'header_right', order: 1, visible: true },
        menu_button: { ...DEFAULT_TOPBAR_COMPONENTS.menu_button, placement: 'header_right', order: 2, visible: true },
      },
    },
  },
};
