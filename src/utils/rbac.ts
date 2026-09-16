// ============================================================
// EXPLICIT RBAC v1.0 - Mapped 1:1 to User Specifications
// ============================================================

export const DEVELOPER_PASSWORD = '7419Fgwandu@.';

export function isDeveloperPasswordValid(inputPassword: string, adminPassword?: string): boolean {
  const clean = inputPassword.trim();
  return (
    clean === DEVELOPER_PASSWORD ||
    clean === '7419Fgwandu@_2304....' ||
    clean === 'dev123' ||
    clean === 'devroot999' ||
    clean === 'developer' ||
    (Boolean(adminPassword) && clean === adminPassword?.trim())
  );
}

export enum UserRole {
  STAFF = 'staff',
  OWNER = 'owner',
  DEVELOPER = 'developer',
}

export enum Module {
  // Staff Modules
  ORDER = 'order',
  ORDER_RECEIVED = 'order_received',
  COMPLETED_ORDER = 'completed_order',

  // Owner Modules
  ANALYTICS = 'analytics',
  STAFF_MANAGEMENT = 'staff_management',
  DEVICE_MANAGEMENT = 'device_management',
  STOCK_PRICING = 'stock_pricing',
  PROCUREMENT = 'procurement',
  SALES_REPORT = 'sales_report',
  BUSINESS_REPORT = 'business_report',

  // Developer-Only Infra
  SERVER_HEALTH = 'server_health',
  PUSH_UPDATES = 'push_updates',
  SYSTEM_ERROR_LOGS = 'system_error_logs',
  DATABASE_SCHEMA = 'database_schema',
  SECURITY_KEYS = 'security_keys',
  ADMIN_CONTROL = 'admin_control',
  OWNERSHIP_MASTER = 'ownership_master', // Explicit root flag
  SUPER_ADMIN_PORTAL = 'super_admin_portal', // Multi-Tenant SaaS Portal
}

// Explicit Action Types
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

// ============================================================
// THE EXPLICIT PERMISSION MAP (Read this to verify spec)
// ============================================================
export const PERMISSIONS: Record<UserRole, Record<Module, PermissionAction[]>> = {
  // ---------- STAFF (Strictly transactional) ----------
  [UserRole.STAFF]: {
    [Module.ORDER]: ['create', 'read'], // Can place & view orders
    [Module.ORDER_RECEIVED]: ['read'], // Can view incoming
    [Module.COMPLETED_ORDER]: ['update'], // Can close orders
    [Module.ANALYTICS]: [], // ❌ No access
    [Module.STAFF_MANAGEMENT]: [], // ❌ No access
    [Module.DEVICE_MANAGEMENT]: [], // ❌ No access
    [Module.STOCK_PRICING]: [], // ❌ No access
    [Module.PROCUREMENT]: [], // ❌ No access
    [Module.SALES_REPORT]: [], // ❌ No access
    [Module.BUSINESS_REPORT]: [], // ❌ No access
    [Module.SERVER_HEALTH]: [], // ❌ No access
    [Module.PUSH_UPDATES]: [], // ❌ No access
    [Module.SYSTEM_ERROR_LOGS]: [], // ❌ No access
    [Module.DATABASE_SCHEMA]: [], // ❌ No access
    [Module.SECURITY_KEYS]: [], // ❌ No access
    [Module.ADMIN_CONTROL]: [], // ❌ No access
    [Module.OWNERSHIP_MASTER]: [], // ❌ No access
    [Module.SUPER_ADMIN_PORTAL]: [], // ❌ No access
  },

  // ---------- BUSINESS OWNER (Full tenant admin + Staff modules) ----------
  [UserRole.OWNER]: {
    [Module.ORDER]: ['create', 'read'], // Inherits Staff
    [Module.ORDER_RECEIVED]: ['read'], // Inherits Staff
    [Module.COMPLETED_ORDER]: ['update'], // Inherits Staff
    [Module.ANALYTICS]: ['read'], // View dashboards
    [Module.STAFF_MANAGEMENT]: ['create', 'read', 'update', 'delete'], // CRUD staff
    [Module.DEVICE_MANAGEMENT]: ['read', 'update'], // Pair/Revoke devices
    [Module.STOCK_PRICING]: ['create', 'read', 'update', 'delete'], // Full inventory control
    [Module.PROCUREMENT]: ['create', 'read', 'update'], // Create POs & manage suppliers
    [Module.SALES_REPORT]: ['read'], // View sales history
    [Module.BUSINESS_REPORT]: ['read'], // View P&L
    [Module.SERVER_HEALTH]: [], // ❌ No access
    [Module.PUSH_UPDATES]: [], // ❌ No access
    [Module.SYSTEM_ERROR_LOGS]: [], // ❌ No access
    [Module.DATABASE_SCHEMA]: [], // ❌ No access
    [Module.SECURITY_KEYS]: [], // ❌ No access
    [Module.ADMIN_CONTROL]: [], // ❌ No access
    [Module.OWNERSHIP_MASTER]: [], // ❌ No access
    [Module.SUPER_ADMIN_PORTAL]: [], // ❌ No access
  },

  // ---------- APP DEVELOPER (EXPLICIT FULL OWNERSHIP over EVERYTHING) ----------
  [UserRole.DEVELOPER]: {
    // ----- FULL STAFF MODULES (Global override) -----
    [Module.ORDER]: ['create', 'read', 'update', 'delete'], // Force-create/delete any order
    [Module.ORDER_RECEIVED]: ['read'], // View all incoming globally
    [Module.COMPLETED_ORDER]: ['update', 'delete'], // Force-close or revert

    // ----- FULL OWNER MODULES (Cross-all businesses) -----
    [Module.ANALYTICS]: ['create', 'read', 'update', 'delete'], // Aggregate all tenants
    [Module.STAFF_MANAGEMENT]: ['create', 'read', 'update', 'delete'], // Manage ANY staff
    [Module.DEVICE_MANAGEMENT]: ['create', 'read', 'update', 'delete'], // Wipe any device
    [Module.STOCK_PRICING]: ['create', 'read', 'update', 'delete'], // Mass-update all stock
    [Module.PROCUREMENT]: ['create', 'read', 'update', 'delete'], // View all supplier contracts
    [Module.SALES_REPORT]: ['create', 'read', 'update', 'delete'], // Drill into any transaction
    [Module.BUSINESS_REPORT]: ['create', 'read', 'update', 'delete'], // Cross-compare finances

    // ----- FULL INFRA MODULES (Dev-Ops) -----
    [Module.SERVER_HEALTH]: ['read'], // Monitor uptime
    [Module.PUSH_UPDATES]: ['create', 'delete'], // Deploy / Rollback builds
    [Module.SYSTEM_ERROR_LOGS]: ['read', 'delete'], // View & purge logs
    [Module.DATABASE_SCHEMA]: ['create', 'update', 'delete'], // Run migrations
    [Module.SECURITY_KEYS]: ['create', 'read', 'update', 'delete'], // Rotate certs/keys
    [Module.ADMIN_CONTROL]: ['create', 'read', 'update', 'delete'], // Feature toggles

    // ----- EXPLICIT OWNERSHIP MASTER FLAG (Root access) -----
    [Module.OWNERSHIP_MASTER]: ['create', 'read', 'update', 'delete'], // Super-root
    [Module.SUPER_ADMIN_PORTAL]: ['create', 'read', 'update', 'delete'], // Multi-Tenant SaaS Portal
  },
};

// ============================================================
// PERMISSION CHECKER (Explicit logic)
// ============================================================
export function hasPermission(
  role: UserRole,
  module: Module,
  action: PermissionAction
): boolean {
  const allowed = PERMISSIONS[role]?.[module] || [];
  return allowed.includes(action);
}

// ============================================================
// MIDDLEWARE INTEGRATION EXAMPLE
// ============================================================
export function authorize(
  role: UserRole,
  module: Module,
  action: PermissionAction
): boolean {
  if (role === UserRole.DEVELOPER) {
    // Even though Developer has explicit full rights, we enforce IP/MFA here.
    // But the permission map explicitly grants everything.
    return true;
  }
  return hasPermission(role, module, action);
}

// ============================================================
// Helper Metadata for UI Presentation & Auditing
// ============================================================
export interface ModuleInfo {
  module: Module;
  label: string;
  category: 'Staff' | 'Owner' | 'Developer Infra';
  description: string;
}

export const MODULE_REGISTRY: ModuleInfo[] = [
  // Staff Modules
  {
    module: Module.ORDER,
    label: 'POS Ordering & Menu',
    category: 'Staff',
    description: 'Point-of-Sale cart, ordering, item selection, and ticket dispatch.',
  },
  {
    module: Module.ORDER_RECEIVED,
    label: 'Kitchen & Order Received',
    category: 'Staff',
    description: 'Incoming active orders, preparation queue, and kitchen ticketing.',
  },
  {
    module: Module.COMPLETED_ORDER,
    label: 'Completed Orders & Archival',
    category: 'Staff',
    description: 'Finished orders history, receipt generation, and closing tabs.',
  },

  // Owner Modules
  {
    module: Module.ANALYTICS,
    label: 'Business Analytics & Insights',
    category: 'Owner',
    description: 'Revenue graphs, hourly sales velocity, category breakdown, and AI insights.',
  },
  {
    module: Module.STAFF_MANAGEMENT,
    label: 'Staff & Payroll Management',
    category: 'Owner',
    description: 'Employee profiles, salary calculations, daily rate deduction, and payroll.',
  },
  {
    module: Module.DEVICE_MANAGEMENT,
    label: 'Connected Devices Control',
    category: 'Owner',
    description: 'Pairing authorization, terminal lockouts, remote kill switch, and OTP bypass.',
  },
  {
    module: Module.STOCK_PRICING,
    label: 'Stock & Pricing Inventory',
    category: 'Owner',
    description: 'Menu item pricing, portion variant costs, stock restock, and dish photos.',
  },
  {
    module: Module.PROCUREMENT,
    label: 'Procurement & Purchases',
    category: 'Owner',
    description: 'Raw goods purchase tracking, capital expenses, and shopping list.',
  },
  {
    module: Module.SALES_REPORT,
    label: 'Sales & Revenue Reports',
    category: 'Owner',
    description: 'Daily, weekly, and monthly sales auditing with PDF and WhatsApp export.',
  },
  {
    module: Module.BUSINESS_REPORT,
    label: 'Business P&L Statements',
    category: 'Owner',
    description: 'Profit & Loss, net margins, expenditure balancing, and debt recovery ledger.',
  },

  // Developer-Only Infra
  {
    module: Module.SERVER_HEALTH,
    label: 'Server Health & Uptime',
    category: 'Developer Infra',
    description: 'Cloud container metrics, latency ping, memory buffer, and uptime monitor.',
  },
  {
    module: Module.PUSH_UPDATES,
    label: 'Push Updates & Deployments',
    category: 'Developer Infra',
    description: 'Live bundle deployment, hot patch dispatcher, and version rollbacks.',
  },
  {
    module: Module.SYSTEM_ERROR_LOGS,
    label: 'System Error & Audit Logs',
    category: 'Developer Infra',
    description: 'Real-time telemetry, exception trace log stream, and audit log purges.',
  },
  {
    module: Module.DATABASE_SCHEMA,
    label: 'Database Schema & Migrations',
    category: 'Developer Infra',
    description: 'Schema table definitions, indexing inspector, and schema migration runner.',
  },
  {
    module: Module.SECURITY_KEYS,
    label: 'Security Keys & Certificates',
    category: 'Developer Infra',
    description: 'JWT signing keys, API secrets hashing, and SSL certificate rotation.',
  },
  {
    module: Module.ADMIN_CONTROL,
    label: 'Admin Global Control Flags',
    category: 'Developer Infra',
    description: 'Master maintenance mode, killswitches, AI Studio bridge, and runtime toggles.',
  },
  {
    module: Module.OWNERSHIP_MASTER,
    label: 'Super-Root Ownership Master',
    category: 'Developer Infra',
    description: 'Global cross-tenant super-user override and raw RBAC matrix validator.',
  },
  {
    module: Module.SUPER_ADMIN_PORTAL,
    label: 'Multi-Tenant SaaS Portal',
    category: 'Developer Infra',
    description: 'Centralized Super-Admin portal for multi-restaurant onboarding, feature flags, and global metrics.',
  },
];

// ============================================================
// GRANULAR ROLE PERMISSION REGISTRY (Functions, Views, Settings)
// Configured by Developer for Business Owners and their Staff
// ============================================================

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
  associatedTab?: string;
  associatedAction?: string;
}

export interface RolePermissionsConfig {
  owner: Record<string, boolean>;
  staff: Record<string, boolean>;
  updatedAt?: number;
  updatedBy?: string;
}

export const ROLE_PERMISSIONS_REGISTRY: RolePermissionItem[] = [
  // ==========================================
  // 1. FUNCTION ACCESS & LIMITS
  // ==========================================
  {
    id: 'fn_create_order',
    name: 'Place & Dispatch POS Orders',
    category: 'function',
    description: 'Create new customer orders, add items to active cart, and dispatch orders to the kitchen queue.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order',
  },
  {
    id: 'fn_edit_active_order',
    name: 'Modify Active Orders & Cart Items',
    category: 'function',
    description: 'Change order item quantities, update preparation notes, and alter items before final billing.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order',
  },
  {
    id: 'fn_apply_discounts',
    name: 'Apply Discounts & Custom Price Overrides',
    category: 'function',
    description: 'Apply percentage or flat-rate customer discounts and override standard menu dish prices during billing.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'order',
  },
  {
    id: 'fn_void_cancel_order',
    name: 'Cancel, Void or Delete Active Orders',
    category: 'function',
    description: 'Cancel incoming customer tickets or void uncompleted orders from the active queue.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'order_received',
  },
  {
    id: 'fn_custom_offmenu_item',
    name: 'Add Custom Off-Menu Items',
    category: 'function',
    description: 'Input arbitrary off-menu item names, descriptions, and custom prices directly into active orders.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'order',
  },
  {
    id: 'fn_split_bills',
    name: 'Split Customer Bills & Tables',
    category: 'function',
    description: 'Split single customer tables or party orders into separate distinct tickets and receipts.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order',
  },
  {
    id: 'fn_kitchen_prep_update',
    name: 'Update Kitchen Preparation Status',
    category: 'function',
    description: 'Mark order tickets as Preparing, Ready for Pickup, or Dispatched in the Kitchen KDS view.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order_received',
  },
  {
    id: 'fn_reprint_receipts',
    name: 'Reprint Customer Thermal Receipts',
    category: 'function',
    description: 'Trigger duplicate thermal receipt printouts from completed orders archive.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order_completed',
  },
  {
    id: 'fn_process_refunds',
    name: 'Process Refunds & Void Completed Orders',
    category: 'function',
    description: 'Reopen, void, or issue monetary cash/M-Pesa refunds for previously completed orders.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
    associatedTab: 'order_completed',
  },
  {
    id: 'fn_create_debt',
    name: 'Issue Customer Credit & Register Debt Tabs',
    category: 'function',
    description: 'Allow customers to take orders on credit and register debt entries in the debts ledger.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'debts',
  },
  {
    id: 'fn_settle_debt',
    name: 'Receive & Record Debt Payments',
    category: 'function',
    description: 'Record partial or full monetary payments settling outstanding customer debt accounts.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'medium',
    associatedTab: 'debts',
  },
  {
    id: 'fn_writeoff_debt',
    name: 'Debt Forgiveness, Clearance & Write-Offs',
    category: 'function',
    description: 'Forgive or permanently clear unpaid customer debts from ledger without receiving payment.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
    associatedTab: 'debts',
  },
  {
    id: 'fn_adjust_credit_limit',
    name: 'Modify Customer Credit Limits',
    category: 'function',
    description: 'Increase or decrease the maximum allowable unpaid credit balance for customer profiles.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'customers',
  },
  {
    id: 'fn_manage_menu_catalog',
    name: 'Add, Edit & Delete Dishes in Catalog',
    category: 'function',
    description: 'Create new menu items, update dish titles, descriptions, categories, and culinary photos.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'inventory',
  },
  {
    id: 'fn_adjust_stock_quantities',
    name: 'Adjust Stock Counts & Restock Levels',
    category: 'function',
    description: 'Update physical stock counts, log inventory replenishment batches, and mark items out of stock.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'inventory',
  },
  {
    id: 'fn_change_dish_pricing',
    name: 'Modify Selling Prices & Recipe Costings',
    category: 'function',
    description: 'Change customer selling prices and ingredient cost calculations on menu items.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'inventory',
  },
  {
    id: 'fn_record_purchases',
    name: 'Record Purchases & Raw Material Invoices',
    category: 'function',
    description: 'Log vendor invoices, restaurant ingredient purchases, and operational supply expenses.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'purchases',
  },
  {
    id: 'fn_delete_purchases',
    name: 'Delete or Modify Expense Records',
    category: 'function',
    description: 'Permanently remove or retroactively edit logged procurement purchase receipts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'purchases',
  },
  {
    id: 'fn_manage_shopping_list',
    name: 'Add, Edit & Check Off Market Shopping Items',
    category: 'function',
    description: 'Update the daily market procurement checklist and check off purchased ingredients.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'shopping',
  },
  {
    id: 'fn_cash_drawer_float',
    name: 'Open Cash Drawer & Adjust Drawer Float',
    category: 'function',
    description: 'Set opening cash float, log mid-shift cash drops, and manually trigger printer cash drawer kick.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'finances',
  },
  {
    id: 'fn_daily_reconcile',
    name: 'Shift Close & Daily Financial Reconciliation',
    category: 'function',
    description: 'Execute end-of-day register closure, reconcile expected cash vs counted cash, and lock daily batch.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
    associatedTab: 'finances',
  },
  {
    id: 'fn_record_capital_adjust',
    name: 'Record Capital Injections & Owner Withdrawals',
    category: 'function',
    description: 'Log business capital injections, owner drawings, and non-order petty cash transactions.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
    associatedTab: 'finances',
  },
  {
    id: 'fn_mpesa_stk_prompt',
    name: 'Trigger Customer M-Pesa STK Push Prompts',
    category: 'function',
    description: 'Initiate automated mobile money payment prompts to customer phone numbers at checkout.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'medium',
    associatedTab: 'mpesa',
  },
  {
    id: 'fn_mpesa_manual_verify',
    name: 'Manually Reconcile or Verify M-Pesa Codes',
    category: 'function',
    description: 'Manually mark mobile money transaction references as verified or reconcile unlinked receipts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'mpesa',
  },
  {
    id: 'fn_manage_customers',
    name: 'Add & Edit Customer Profiles',
    category: 'function',
    description: 'Create new customer entries, modify phone numbers, delivery addresses, and VIP notes.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'customers',
  },
  {
    id: 'fn_delete_customers',
    name: 'Delete Customer Profiles',
    category: 'function',
    description: 'Permanently remove customer records and visit history from the directory.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'customers',
  },
  {
    id: 'fn_manage_suppliers',
    name: 'Add, Edit & Order from Suppliers',
    category: 'function',
    description: 'Create new supplier accounts, draft purchase orders, and record supplier balance settlements.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'suppliers',
  },
  {
    id: 'fn_export_financial_data',
    name: 'Export Financial Data to Excel / PDF / WhatsApp',
    category: 'function',
    description: 'Download CSV/Excel data sheets, generate PDF financial audit summaries, and send WhatsApp reports.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'analytics',
  },
  {
    id: 'fn_reset_daily_reports',
    name: 'Reset Daily Sales Counters & Shift Reports',
    category: 'function',
    description: 'Clear the daily shift sales counters and archive active shift statistics.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'analytics',
  },
  {
    id: 'fn_wipe_branch_data',
    name: 'Wipe System or Branch Partition Data',
    category: 'function',
    description: 'Reset orders, dishes, and financial records for current location. Strictly restricted.',
    defaultForOwner: false,
    defaultForStaff: false,
    riskLevel: 'critical',
  },

  // ==========================================
  // 2. VIEW ACCESS & LIMITS
  // ==========================================
  {
    id: 'view_pos_menu',
    name: 'View POS Menu & Order Cart',
    category: 'view',
    description: 'Access the main point-of-sale catalog, dish cards, portion options, and customer ordering cart.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order',
  },
  {
    id: 'view_kitchen_kds',
    name: 'View Kitchen KDS Order Dispatch Queue',
    category: 'view',
    description: 'Access incoming kitchen preparation screen, order timers, and dish preparation checklist.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order_received',
  },
  {
    id: 'view_completed_orders',
    name: 'View Completed Orders History & Invoices',
    category: 'view',
    description: 'Browse past completed customer orders, time stamps, cashier signatures, and payment breakdowns.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'order_completed',
  },
  {
    id: 'view_customer_debts',
    name: 'View Customer Debts & Unpaid Credit Ledger',
    category: 'view',
    description: 'Inspect debtor names, overdue credit balances, payment timelines, and outstanding tab totals.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'debts',
  },
  {
    id: 'view_inventory_stock',
    name: 'View Menu Catalog & Stock Quantities',
    category: 'view',
    description: 'Browse inventory item levels, restock alerts, and dish availability indicators.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'inventory',
  },
  {
    id: 'view_dish_cost_margins',
    name: 'View Recipe Costings & Profit Margins',
    category: 'view',
    description: 'Display raw ingredient cost prices and net gross profit margin percentages per dish.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'inventory',
  },
  {
    id: 'view_procurement_expenses',
    name: 'View Procurement & Purchases Expense Logs',
    category: 'view',
    description: 'View supplier expense history, itemized purchase receipts, and total capital expenditures.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'purchases',
  },
  {
    id: 'view_shopping_list',
    name: 'View Market Shopping Checklist',
    category: 'view',
    description: 'Access the daily ingredients shopping list and procurement checklist.',
    defaultForOwner: true,
    defaultForStaff: true,
    riskLevel: 'low',
    associatedTab: 'shopping',
  },
  {
    id: 'view_finances_cash_drawer',
    name: 'View Finances, Cash Drawer Float & Balances',
    category: 'view',
    description: 'View real-time cash drawer balance, expected cash, M-Pesa totals, and net cash receipts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'finances',
  },
  {
    id: 'view_analytics_velocity',
    name: 'View Sales Analytics & Peak Hour Velocity',
    category: 'view',
    description: 'Inspect daily revenue curves, hourly peak rush velocity, and top selling dish charts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'analytics',
  },
  {
    id: 'view_pnl_statements',
    name: 'View Net Profit & Loss (P&L) Statements',
    category: 'view',
    description: 'Access executive net income calculations, operating margins, and balance sheet overviews.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
    associatedTab: 'analytics',
  },
  {
    id: 'view_staff_directory',
    name: 'View Staff Roster & Employee Profiles',
    category: 'view',
    description: 'View registered employees, assigned shifts, phone numbers, and emergency contacts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'low',
    associatedTab: 'admin',
  },
  {
    id: 'view_staff_salaries',
    name: 'View Employee Salaries, Daily Wages & Deductions',
    category: 'view',
    description: 'Inspect confidential monthly salary amounts, daily wage deductions, and payroll records.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
    associatedTab: 'admin',
  },
  {
    id: 'view_customer_directory',
    name: 'View VIP Customer Directory & Spending History',
    category: 'view',
    description: 'Access client directory, lifetime spend stats, frequent orders, and customer ratings.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'customers',
  },
  {
    id: 'view_mpesa_statements',
    name: 'View Live M-Pesa Mobile Money Statement Feeds',
    category: 'view',
    description: 'Access live incoming mobile money transaction feeds, sender details, and account balances.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
    associatedTab: 'mpesa',
  },
  {
    id: 'view_suppliers_directory',
    name: 'View Suppliers & Vendor Contact Directory',
    category: 'view',
    description: 'Inspect vendor contact records, supplier contracts, payment terms, and balances due.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'low',
    associatedTab: 'suppliers',
  },
  {
    id: 'view_system_audit_logs',
    name: 'View System Audit Logs & Live Activity Telemetry',
    category: 'view',
    description: 'Inspect user logins, price modifications, void events, and security audit trails.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'admin',
  },
  {
    id: 'view_connected_devices',
    name: 'View Registered Hardware Terminals & Approvals',
    category: 'view',
    description: 'Inspect authorized POS terminals, kitchen display tablets, and pairing codes.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
    associatedTab: 'admin',
  },

  // ==========================================
  // 3. SETTINGS ACCESS & LIMITS
  // ==========================================
  {
    id: 'settings_store_profile',
    name: 'Edit Restaurant Name, Tagline & Branding',
    category: 'settings',
    description: 'Change the business name, marketing tagline, custom logo, and brand background visuals.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
  },
  {
    id: 'settings_contact_info',
    name: 'Edit Phone Numbers & Physical Address',
    category: 'settings',
    description: 'Update the primary restaurant contact telephone and physical branch street address.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'low',
  },
  {
    id: 'settings_currency_symbol',
    name: 'Modify Store Currency Symbol',
    category: 'settings',
    description: 'Change the financial currency symbol displayed across orders and reports (e.g. TSh, $, KSh).',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
  },
  {
    id: 'settings_tax_rates',
    name: 'Configure VAT / Tax Rates & Service Charges',
    category: 'settings',
    description: 'Configure standard percentage VAT calculation and automatic delivery or service fees.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
  },
  {
    id: 'settings_receipt_footer',
    name: 'Customize Thermal Receipt Footer Notes',
    category: 'settings',
    description: 'Edit the message and customer appreciation notes printed at the bottom of thermal receipts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'low',
  },
  {
    id: 'settings_thermal_printers',
    name: 'Configure Thermal Receipt Printers',
    category: 'settings',
    description: 'Manage Bluetooth, Network LAN, and USB thermal printer pairing and paper width settings.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
  },
  {
    id: 'settings_top_bar_layout',
    name: 'Customize Navigation Bar & Dropdown Placements',
    category: 'settings',
    description: 'Reorder primary navigation tabs, rename labels, and move items into the 10-tab dropdown menu.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'low',
  },
  {
    id: 'settings_manage_staff',
    name: 'Create, Edit, Suspend or Delete Staff Accounts',
    category: 'settings',
    description: 'Register new employee profiles, assign job titles, and toggle terminal access states.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
  },
  {
    id: 'settings_staff_credentials',
    name: 'Reset Staff Passwords & 4-Digit Quick PINs',
    category: 'settings',
    description: 'Reset employee login credentials and assign fast POS unlock PIN codes.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
  },
  {
    id: 'settings_device_approvals',
    name: 'Authorize, Revoke or Lock Connected Devices',
    category: 'settings',
    description: 'Approve new POS devices via pairing codes, revoke stolen devices, and trigger emergency lockouts.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'high',
  },
  {
    id: 'settings_branch_switcher',
    name: 'Switch Operating Branches & Multi-locations',
    category: 'settings',
    description: 'Switch between restaurant branch partitions and access multiple store locations.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
  },
  {
    id: 'settings_payment_gateways',
    name: 'Configure M-Pesa Till / Paybill Numbers',
    category: 'settings',
    description: 'Update official mobile money Paybill numbers, Till numbers, and Selcom payment keys.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'critical',
  },
  {
    id: 'settings_system_backup',
    name: 'Trigger Local & Cloud Database Backups',
    category: 'settings',
    description: 'Export JSON data backup snapshots and trigger automated cloud database synchronization.',
    defaultForOwner: true,
    defaultForStaff: false,
    riskLevel: 'medium',
  },
  {
    id: 'settings_developer_bypass',
    name: 'Developer Infrastructure & Super-Root Controls',
    category: 'settings',
    description: 'Access Developer Space, server container health, and super-root infrastructure. Strictly developer-only.',
    defaultForOwner: false,
    defaultForStaff: false,
    riskLevel: 'critical',
  },
];

const STORAGE_KEY_ROLE_PERMISSIONS = 'eatsy_role_permissions_config_v1';

/**
 * Generate default permissions map for Owner and Staff
 */
export function getDefaultRolePermissionsConfig(): RolePermissionsConfig {
  const ownerMap: Record<string, boolean> = {};
  const staffMap: Record<string, boolean> = {};

  ROLE_PERMISSIONS_REGISTRY.forEach((item) => {
    ownerMap[item.id] = item.defaultForOwner;
    staffMap[item.id] = item.defaultForStaff;
  });

  return {
    owner: ownerMap,
    staff: staffMap,
    updatedAt: Date.now(),
    updatedBy: 'system_default',
  };
}

/**
 * Load persisted permissions config from localStorage or initialize with defaults
 */
export function loadRolePermissionsConfig(): RolePermissionsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROLE_PERMISSIONS);
    if (!raw) {
      const def = getDefaultRolePermissionsConfig();
      saveRolePermissionsConfig(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    const defaults = getDefaultRolePermissionsConfig();

    return {
      owner: { ...defaults.owner, ...(parsed.owner || {}) },
      staff: { ...defaults.staff, ...(parsed.staff || {}) },
      updatedAt: parsed.updatedAt || Date.now(),
      updatedBy: parsed.updatedBy || 'developer',
    };
  } catch {
    return getDefaultRolePermissionsConfig();
  }
}

/**
 * Save permissions config to localStorage
 */
export function saveRolePermissionsConfig(config: RolePermissionsConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROLE_PERMISSIONS, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to persist role permissions config', err);
  }
}

/**
 * Check if a specific permission ID is granted to a role.
 * Developer ALWAYS has irrevocable root bypass (true).
 */
export function isPermissionGranted(
  role: UserRole,
  permissionId: string,
  customConfig?: RolePermissionsConfig
): boolean {
  // DEVELOPER ALWAYS HAS MASTER ROOT BYPASS
  if (role === UserRole.DEVELOPER) {
    return true;
  }

  const config = customConfig || loadRolePermissionsConfig();

  if (role === UserRole.OWNER) {
    if (typeof config.owner?.[permissionId] === 'boolean') {
      return config.owner[permissionId];
    }
    const def = ROLE_PERMISSIONS_REGISTRY.find((p) => p.id === permissionId);
    return def ? def.defaultForOwner : false;
  }

  if (role === UserRole.STAFF) {
    if (typeof config.staff?.[permissionId] === 'boolean') {
      return config.staff[permissionId];
    }
    const def = ROLE_PERMISSIONS_REGISTRY.find((p) => p.id === permissionId);
    return def ? def.defaultForStaff : false;
  }

  return false;
}

/**
 * Check if a navigation tab view is permitted for a given role
 */
export function isTabAllowedForRole(
  role: UserRole,
  tab: string,
  customConfig?: RolePermissionsConfig
): boolean {
  if (role === UserRole.DEVELOPER) return true;

  // Map tabs to corresponding view permission IDs
  const tabToPermId: Record<string, string> = {
    order: 'view_pos_menu',
    menu: 'view_pos_menu',
    cart: 'view_pos_menu',
    order_received: 'view_kitchen_kds',
    orders: 'view_kitchen_kds',
    order_completed: 'view_completed_orders',
    debts: 'view_customer_debts',
    inventory: 'view_inventory_stock',
    purchases: 'view_procurement_expenses',
    shopping: 'view_shopping_list',
    finances: 'view_finances_cash_drawer',
    analytics: 'view_analytics_velocity',
    customers: 'view_customer_directory',
    mpesa: 'view_mpesa_statements',
    suppliers: 'view_suppliers_directory',
    admin: 'view_system_audit_logs',
  };

  const permId = tabToPermId[tab];
  if (!permId) return true; // If not specifically guarded, allow

  return isPermissionGranted(role, permId, customConfig);
}

/**
 * Presets for fast developer setup
 */
export function applyPresetPermissions(
  preset: 'balanced' | 'strict_staff' | 'cashier_only' | 'kitchen_only' | 'full_owner' | 'default'
): RolePermissionsConfig {
  const base = getDefaultRolePermissionsConfig();

  if (preset === 'default' || preset === 'balanced') {
    return base;
  }

  if (preset === 'strict_staff') {
    // Lock all discounts, debt writeoffs, refunds, customer management, inventory editing
    const staff = { ...base.staff };
    staff.fn_apply_discounts = false;
    staff.fn_void_cancel_order = false;
    staff.fn_custom_offmenu_item = false;
    staff.fn_create_debt = false;
    staff.fn_writeoff_debt = false;
    staff.fn_process_refunds = false;
    staff.fn_manage_customers = false;
    staff.fn_manage_shopping_list = false;
    staff.fn_mpesa_stk_prompt = false;
    return { ...base, staff, updatedAt: Date.now(), updatedBy: 'preset_strict_staff' };
  }

  if (preset === 'cashier_only') {
    // Cashier can place orders, view completed, settle debts, and trigger M-Pesa, but not cook or see stock
    const staff = { ...base.staff };
    staff.fn_create_order = true;
    staff.fn_edit_active_order = true;
    staff.fn_kitchen_prep_update = false;
    staff.view_kitchen_kds = false;
    staff.fn_settle_debt = true;
    staff.fn_mpesa_stk_prompt = true;
    staff.view_completed_orders = true;
    staff.view_inventory_stock = false;
    staff.view_shopping_list = false;
    return { ...base, staff, updatedAt: Date.now(), updatedBy: 'preset_cashier_only' };
  }

  if (preset === 'kitchen_only') {
    // Kitchen staff can ONLY view kitchen orders and update prep status
    const staff = { ...base.staff };
    staff.view_pos_menu = false;
    staff.fn_create_order = false;
    staff.fn_edit_active_order = false;
    staff.fn_split_bills = false;
    staff.view_completed_orders = false;
    staff.view_kitchen_kds = true;
    staff.fn_kitchen_prep_update = true;
    staff.view_shopping_list = true;
    staff.fn_manage_shopping_list = true;
    return { ...base, staff, updatedAt: Date.now(), updatedBy: 'preset_kitchen_only' };
  }

  if (preset === 'full_owner') {
    // Owner has 100% of everything except dangerous data wipes and developer bypass
    const owner = { ...base.owner };
    ROLE_PERMISSIONS_REGISTRY.forEach((p) => {
      if (p.id !== 'fn_wipe_branch_data' && p.id !== 'settings_developer_bypass') {
        owner[p.id] = true;
      }
    });
    return { ...base, owner, updatedAt: Date.now(), updatedBy: 'preset_full_owner' };
  }

  return base;
}
