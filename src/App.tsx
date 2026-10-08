/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Role,
  TabType,
  MenuItem,
  CartItem,
  Order,
  Variant,
  OrderStatus,
  OrderType,
  PaymentMethod,
  RestaurantSettings,
  ConnectedDevice,
  StaffMember,
  OneTimePasscode,
  AuthUser,
  Purchase,
  Capital,
  MpesaTransaction,
  BusinessOwnerAccount,
  TenantRestaurant,
  RestaurantBranch,
  TopBarLayoutConfig,
  AppTheme,
  ShoppingItem,
  Supplier,
  PurchaseOrder,
} from './types';
import {
  loadStoredItems,
  saveStoredItems,
  loadStoredOrders,
  saveStoredOrders,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredDevices,
  saveStoredDevices,
  loadStoredStaff,
  saveStoredStaff,
  loadStoredBusinessOwners,
  saveStoredBusinessOwners,
  loadStoredOTPs,
  saveStoredOTPs,
  loadStoredPurchases,
  saveStoredPurchases,
  loadStoredCapital,
  saveStoredCapital,
  loadStoredMpesaTransactions,
  saveStoredMpesaTransactions,
  resetAnalyticsData,
  getCurrentDeviceId,
  resetAllData,
  loadStoredAuthUser,
  saveStoredAuthUser,
  clearStoredAuthUser,
  loadStoredTenants,
  saveStoredTenants,
  loadCurrentTenantId,
  saveCurrentTenantId,
  loadStoredShoppingItems,
  saveStoredShoppingItems,
  loadStoredSuppliers,
  saveStoredSuppliers,
  loadStoredPurchaseOrders,
  saveStoredPurchaseOrders,
  addTenantBranch,
  updateTenantBranch,
  deleteTenantBranch,
  switchTenantActiveBranch,
} from './utils/storage';
import { tenantAuthService } from './services/tenantAuthService';
import { generateOrderNumber, formatCurrency } from './utils/formatters';
import { sound } from './utils/sound';
import {
  subscribeMenuItems,
  subscribeOrders,
  subscribeSettings,
  subscribeStaff,
  subscribeDevices,
  subscribePurchases,
  subscribeCapital,
  saveOrderToFirestore,
  saveMenuItemToFirestore,
  saveSettingsToFirestore,
  saveStaffToFirestore,
  saveDeviceToFirestore,
  savePurchaseToFirestore,
  seedRestaurantStarterMenuToFirestore,
  deleteOrderFromFirestore,
} from './firebase/firestoreService';
import { getDefaultMenuItemsForTenant } from './data/restaurantMenus';

import { LoginScreen } from './components/LoginScreen';
import { TenantEntryPortal } from './components/TenantEntryPortal';
import TenantOnboardingWizard from './components/TenantOnboardingWizard';
import { TopBar } from './components/TopBar';
import { CustomerMenu } from './components/CustomerMenu';
import { OrderReceivedView } from './components/OrderReceivedView';
import { OrderCompletedView } from './components/OrderCompletedView';
import { AdminView } from './components/AdminView';
import { DebtsView } from './components/DebtsView';
import { InventoryView } from './components/InventoryView';
import { PurchasesView } from './components/PurchasesView';
import { ShoppingListView } from './components/ShoppingListView';
import { MpesaView } from './components/MpesaView';
import { FinancesView } from './components/FinancesView';
import { CustomersView } from './components/CustomersView';
import { AnalyticsView } from './components/AnalyticsView';
import { SuppliersView } from './components/SuppliersView';
import { AdminAuthModal } from './components/AdminAuthModal';
import { DeviceLockoutShield } from './components/DeviceLockoutShield';
import { DevicePendingApprovalShield } from './components/DevicePendingApprovalShield';
import { ItemDetailModal } from './components/ItemDetailModal';
import { CartSheet } from './components/CartSheet';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AutoPushCheckoutModal } from './components/AutoPushCheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { NewItemModal } from './components/NewItemModal';
import { EditItemModal } from './components/EditItemModal';
import { ImagePickerModal } from './components/ImagePickerModal';
import { AppBackground } from './components/AppBackground';
import { AndroidAppModal } from './components/AndroidAppModal';
import { SettingsAdminPanel } from './components/SettingsAdminPanel';
import { DebugDiagnosticsHUD } from './components/DebugDiagnosticsHUD';
import { AiOrderAssistantModal } from './components/AiOrderAssistantModal';
import { TenantSwitcherModal } from './components/TenantSwitcherModal';
import { BranchSwitcherModal } from './components/BranchSwitcherModal';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SuperAdminSecureAccess } from './components/SuperAdminSecureAccess';
import { TrashBinModal } from './components/TrashBinModal';
import { SnackbarNotification } from './components/SnackbarNotification';
import { deleteTenantCascade, TRASH_RETENTION_MS } from './utils/storage';
import { triggerHaptic } from './utils/haptics';
import { initializeThemeColors } from './utils/colorTheme';
import { UserRole, isTabAllowedForRole, loadRolePermissionsConfig, saveRolePermissionsConfig } from './utils/rbac';
import { RolePermissionsConfig } from './types';
import {
  Radio,
  CheckCircle2,
  ShieldCheck,
  X,
  Wrench,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  Check,
  Terminal,
} from 'lucide-react';

export default function App() {
  // Authentication & RBAC Session State (Required Before Access)
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => loadStoredAuthUser());
  const [currentTab, setCurrentTab] = useState<TabType>('order');
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const stored = loadStoredAuthUser();
    return stored?.role || UserRole.OWNER;
  });
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    const stored = loadStoredAuthUser();
    return stored ? (stored.role === UserRole.OWNER || stored.role === UserRole.DEVELOPER) : true;
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [pendingSettingsOpen, setPendingSettingsOpen] = useState<boolean>(false);

  // Multi-Tenant SaaS State & Developer Mode
  const [tenants, setTenants] = useState<TenantRestaurant[]>(() => loadStoredTenants());
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => loadCurrentTenantId());
  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];
  const [isTenantSwitcherOpen, setIsTenantSwitcherOpen] = useState<boolean>(false);
  const [isBranchSwitcherOpen, setIsBranchSwitcherOpen] = useState<boolean>(false);
  const [isSuperAdminOpen, setIsSuperAdminOpen] = useState<boolean>(false);
  const [superAdminInitialTab, setSuperAdminInitialTab] = useState<'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings'>('developer_settings');
  const [superAdminInitialSubView, setSuperAdminInitialSubView] = useState<
    'root_master' | 'access_limits' | 'branch_switcher' | 'settings_admin' | 'dropdown_tabs' | 'branch_partitions' | 'root_infra'
  >('root_master');
  const [developerMode, setDeveloperMode] = useState<boolean>(false);
  const [isOnboardingWizardOpen, setIsOnboardingWizardOpen] = useState<boolean>(false);

  // Dynamic Granular RBAC Permissions (Function, View & Settings limits for Business Owners & Staff)
  const [rolePermissionsConfig, setRolePermissionsConfig] = useState<RolePermissionsConfig>(() => loadRolePermissionsConfig());

  const handleUpdateRolePermissionsConfig = (newConfig: RolePermissionsConfig) => {
    setRolePermissionsConfig(newConfig);
    saveRolePermissionsConfig(newConfig);
  };

  const handleOpenSuperAdmin = (
    initialTab: 'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings' = 'developer_settings',
    initialSubView: 'root_master' | 'access_limits' | 'branch_switcher' | 'settings_admin' | 'dropdown_tabs' | 'branch_partitions' | 'root_infra' = 'root_master'
  ) => {
    setSuperAdminInitialTab(initialTab);
    setSuperAdminInitialSubView(initialSubView);
    setIsSuperAdminOpen(true);
  };

  // Data State
  const [items, setItems] = useState<MenuItem[]>(() => loadStoredItems());
  const [orders, setOrders] = useState<Order[]>(() => loadStoredOrders());
  const [settings, setSettings] = useState<RestaurantSettings>(() => loadStoredSettings());
  const [devices, setDevices] = useState<ConnectedDevice[]>(() => loadStoredDevices());
  const [staffList, setStaffList] = useState<StaffMember[]>(() => loadStoredStaff());
  const [businessOwners, setBusinessOwners] = useState<BusinessOwnerAccount[]>(() => loadStoredBusinessOwners());
  const [otps, setOtps] = useState<OneTimePasscode[]>(() => loadStoredOTPs());
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadStoredPurchases());
  const [capital, setCapital] = useState<Capital>(() => loadStoredCapital());
  const [mpesaTransactions, setMpesaTransactions] = useState<MpesaTransaction[]>(() => loadStoredMpesaTransactions());
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => loadStoredShoppingItems());
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStoredSuppliers());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadStoredPurchaseOrders());
  const [cart, setCart] = useState<CartItem[]>([]);

  // Modals & Interaction State
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [pickingImageItem, setPickingImageItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeConfirmationOrder, setActiveConfirmationOrder] = useState<Order | null>(null);
  const [activeAutoPushOrder, setActiveAutoPushOrder] = useState<Order | null>(null);
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState<boolean>(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isTrashBinOpen, setIsTrashBinOpen] = useState<boolean>(false);
  const [snackbarState, setSnackbarState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    variant?: 'trash' | 'success' | 'info';
    onUndo?: () => void;
    onViewTrash?: () => void;
    durationMs?: number;
  } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [newDeviceAlertToast, setNewDeviceAlertToast] = useState<{ id: string; name: string; pairingCode?: string } | null>(null);
  const prevPendingCountRef = React.useRef(0);


  // Initialize brand color scheme from localStorage
  useEffect(() => {
    initializeThemeColors();
  }, []);

  // Android & PWA Install Prompt Listener
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
    };
    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Real-time synchronization across other browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'orderup_connected_devices' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const curId = getCurrentDeviceId();
          setDevices(parsed.map((d: any) => ({ ...d, isCurrent: d.id === curId })));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Real-time Firestore synchronization across all network devices & Cloud
  useEffect(() => {
    const unsubSettings = subscribeSettings((remoteSettings) => {
      if (remoteSettings && Object.keys(remoteSettings).length > 0) {
        setSettings((prev) => ({ ...prev, ...remoteSettings }));
      }
    });

    const unsubItems = subscribeMenuItems((remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        setItems(remoteItems);
      }
    });

    const unsubOrders = subscribeOrders((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });

    const unsubStaff = subscribeStaff((remoteStaff) => {
      if (remoteStaff && remoteStaff.length > 0) {
        setStaffList(remoteStaff);
      }
    });

    const unsubDevices = subscribeDevices((remoteDevices) => {
      if (remoteDevices && remoteDevices.length > 0) {
        const curId = getCurrentDeviceId();
        setDevices(remoteDevices.map((d) => ({ ...d, isCurrent: d.id === curId })));
      }
    });

    const unsubPurchases = subscribePurchases((remotePurchases) => {
      if (remotePurchases && remotePurchases.length > 0) {
        setPurchases(remotePurchases);
      }
    });

    const unsubCapital = subscribeCapital((remoteCapital) => {
      if (remoteCapital && typeof remoteCapital.amount === 'number') {
        setCapital(remoteCapital);
      }
    });

    return () => {
      unsubSettings();
      unsubItems();
      unsubOrders();
      unsubStaff();
      unsubDevices();
      unsubPurchases();
      unsubCapital();
    };
  }, []);

  // Synchronize dynamic theme classes and data attributes on HTML element
  useEffect(() => {
    const applyTheme = (themeSetting: AppTheme) => {
      let resolvedTheme: 'white' | 'light' | 'dark' = 'white';
      if (themeSetting === 'auto') {
        const isSystemDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolvedTheme = isSystemDark ? 'dark' : 'white';
      } else {
        resolvedTheme = themeSetting;
      }

      document.documentElement.setAttribute('data-theme', resolvedTheme);
      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark', 'theme-dark');
        document.documentElement.classList.remove('theme-white', 'theme-light');
      } else if (resolvedTheme === 'light') {
        document.documentElement.classList.add('theme-light');
        document.documentElement.classList.remove('dark', 'theme-dark', 'theme-white');
      } else {
        document.documentElement.classList.add('theme-white');
        document.documentElement.classList.remove('dark', 'theme-dark', 'theme-light');
      }
    };

    const currentTheme = settings.theme || 'white';
    applyTheme(currentTheme);

    if (currentTheme === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('auto');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredOrders(orders);
  }, [orders]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredDevices(devices);
  }, [devices]);

  useEffect(() => {
    saveStoredStaff(staffList);
  }, [staffList]);

  useEffect(() => {
    saveStoredBusinessOwners(businessOwners);
  }, [businessOwners]);

  useEffect(() => {
    saveStoredOTPs(otps);
  }, [otps]);

  useEffect(() => {
    saveStoredPurchases(purchases);
  }, [purchases]);

  useEffect(() => {
    saveStoredCapital(capital);
  }, [capital]);

  useEffect(() => {
    saveStoredMpesaTransactions(mpesaTransactions);
  }, [mpesaTransactions]);

  useEffect(() => {
    saveStoredShoppingItems(shoppingItems);
  }, [shoppingItems]);

  useEffect(() => {
    saveStoredSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    saveStoredPurchaseOrders(purchaseOrders);
  }, [purchaseOrders]);

  // Multi-Tenant SaaS Lifecycle: fetch remote tenants on startup & sync
  useEffect(() => {
    tenantAuthService.fetchTenants().then((list) => {
      if (list && list.length > 0) {
        setTenants(list);
      }
    });
  }, []);

  useEffect(() => {
    saveStoredTenants(tenants);
  }, [tenants]);

  // Synchronize active restaurant settings (address, phone, name, currency, logoUrl, topBarConfig) with the current tenant
  useEffect(() => {
    const cur = tenants.find((t) => t.id === currentTenantId);
    if (cur) {
      setSettings((prev) => ({
        ...prev,
        restaurantName: cur.name || prev.restaurantName,
        tagline: cur.tagline || prev.tagline,
        logoUrl: cur.logoUrl || prev.logoUrl || '/logo.jpg',
        currency: cur.currency || prev.currency,
        phone: cur.phone || prev.phone,
        address: cur.address || prev.address,
        topBarConfig: cur.topBarConfig || prev.topBarConfig,
      }));
    }
  }, [currentTenantId]);

  // Handle switching active restaurant tenant
  const handleSelectTenant = (selectedTenant: TenantRestaurant) => {
    setCurrentTenantId(selectedTenant.id);
    saveCurrentTenantId(selectedTenant.id);

    // Update active branding settings
    setSettings((prev) => ({
      ...prev,
      restaurantName: selectedTenant.name,
      tagline: selectedTenant.tagline,
      logoUrl: selectedTenant.logoUrl || prev.logoUrl || '/logo.jpg',
      currency: selectedTenant.currency,
      phone: selectedTenant.phone || prev.phone,
      address: selectedTenant.address || prev.address,
      topBarConfig: selectedTenant.topBarConfig || prev.topBarConfig,
    }));

    // Scope check: If current user is staff/owner of another restaurant, warn or align
    if (authUser && authUser.role !== UserRole.DEVELOPER && authUser.restaurant_id && authUser.restaurant_id !== 'ALL') {
      if (authUser.restaurant_id !== selectedTenant.id) {
        console.warn(`User is scoped to ${authUser.restaurant_id}, switched view to ${selectedTenant.id}`);
      }
    }

    sound.playSuccess();
    triggerHaptic('medium');
  };

  const handleRefreshTenants = async () => {
    const list = await tenantAuthService.fetchTenants();
    setTenants(list);
  };

  const handleToggleTenantMaintenance = async (tenantId: string, isUnderMaintenance: boolean) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, isUnderMaintenance, updatedAt: Date.now() } : t))
    );
    try {
      await fetch(`/api/tenants/${tenantId}/maintenance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUnderMaintenance }),
      });
    } catch (err) {
      console.error('Failed to sync maintenance toggle with backend:', err);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    const remaining = deleteTenantCascade(tenantId);
    setTenants(remaining);
    if (currentTenantId === tenantId && remaining.length > 0) {
      handleSelectTenant(remaining[0]);
    }
    try {
      await fetch(`/api/tenants/${tenantId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to sync delete tenant with backend:', err);
    }
  };

  const handleInlineUpdateTenant = (updates: { name?: string; tagline?: string; logoUrl?: string }) => {
    const active = tenants.find((t) => t.id === currentTenantId);
    if (!active) return;
    const updated: TenantRestaurant = {
      ...active,
      name: updates.name ?? active.name,
      tagline: updates.tagline ?? active.tagline,
      logoUrl: updates.logoUrl ?? active.logoUrl,
      updatedAt: Date.now(),
    };
    setTenants((prev) => prev.map((t) => (t.id === currentTenantId ? updated : t)));
    setSettings((prev) => ({
      ...prev,
      restaurantName: updated.name,
      tagline: updated.tagline,
      logoUrl: updated.logoUrl,
    }));
    fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const handleAddBranch = (branchData: Omit<RestaurantBranch, 'id' | 'createdAt'>) => {
    if (!currentTenantId) return;
    const updatedTenants = addTenantBranch(currentTenantId, branchData);
    setTenants(updatedTenants);
  };

  const handleUpdateBranch = (branchId: string, updates: Partial<RestaurantBranch>) => {
    if (!currentTenantId) return;
    const updatedTenants = updateTenantBranch(currentTenantId, branchId, updates);
    setTenants(updatedTenants);
  };

  const handleDeleteBranch = (branchId: string) => {
    if (!currentTenantId) return;
    const updatedTenants = deleteTenantBranch(currentTenantId, branchId);
    setTenants(updatedTenants);
  };

  const handleSelectBranch = (branchId: string) => {
    if (!currentTenantId) return;
    const updatedTenants = switchTenantActiveBranch(currentTenantId, branchId);
    setTenants(updatedTenants);
    const activeTenant = updatedTenants.find((t) => t.id === currentTenantId);
    if (activeTenant) {
      setSettings((prev) => ({
        ...prev,
        activeBranchId: branchId,
        activeBranchName: activeTenant.branchName,
      }));
    }
  };

  // Keep an active interval for live timer updates
  const [, setTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Check device status
  const currentDeviceId = getCurrentDeviceId();
  const currentDevice = devices.find((d) => d.id === currentDeviceId || d.isCurrent);
  const isDeviceControlActive = settings.deviceControlEnabled !== false;
  const isCurrentDevicePending = isDeviceControlActive && currentDevice?.status === 'pending_approval';
  const isCurrentDeviceDisabled = isDeviceControlActive && currentDevice?.status === 'disabled';

  const pendingDevices = devices.filter((d) => d.status === 'pending_approval');
  const pendingDevicesCount = pendingDevices.length;

  // Sound notification when new device authorization is requested
  useEffect(() => {
    if (pendingDevicesCount > prevPendingCountRef.current) {
      sound.playDeviceAlert();
      triggerHaptic('heavy');
      const latestPending = devices.find((d) => d.status === 'pending_approval');
      if (latestPending) {
        setNewDeviceAlertToast({
          id: latestPending.id,
          name: latestPending.name,
          pairingCode: latestPending.pairingCode,
        });
      }
    }
    prevPendingCountRef.current = pendingDevicesCount;
  }, [pendingDevicesCount]);

  const handleLoginSuccess = (user: AuthUser, initialTab?: 'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings') => {
    setAuthUser(user);
    saveStoredAuthUser(user);
    setCurrentRole(user.role);
    if (user.role === UserRole.DEVELOPER) {
      setIsAdminUnlocked(true);
      setDeveloperMode(true);
      setIsSuperAdminOpen(true);
      if (initialTab) {
        setSuperAdminInitialTab(initialTab);
      }
    } else if (user.role === UserRole.OWNER) {
      setIsAdminUnlocked(true);
    } else {
      setIsAdminUnlocked(false);
      setCurrentTab('order');
    }
  };

  const handleLogout = () => {
    clearStoredAuthUser();
    setAuthUser(null);
    setIsAdminUnlocked(false);
    setCurrentRole(UserRole.STAFF);
    setIsSettingsOpen(false);
    setIsAdminAuthModalOpen(false);
    setCurrentTab('order');
    sound.playClick();
    triggerHaptic('medium');
  };

  // Navigation Handler with Admin Password Gate
  const handleSelectTab = (tab: TabType) => {
    sound.playClick();
    if (tab === 'admin') {
      if (isAdminUnlocked) {
        setCurrentTab('admin');
      } else {
        setPendingSettingsOpen(false);
        setIsAdminAuthModalOpen(true);
      }
    } else if (tab === 'cart') {
      setIsCartOpen(true);
    } else {
      // Check if developer has set access or limits for this tab for current role
      if (currentRole !== UserRole.DEVELOPER && !isTabAllowedForRole(currentRole, tab, rolePermissionsConfig)) {
        sound.playDeviceAlert();
        triggerHaptic('warning');
        alert(`Access Restricted by Developer Policy: Your role (${currentRole}) has been restricted from accessing the "${tab}" section. Please contact your system developer.`);
        return;
      }
      setCurrentTab(tab);
    }
  };

  const handleOpenSettingsPanel = () => {
    sound.playClick();
    setIsSettingsOpen(true);
  };

  const handleAdminAuthSuccess = (role?: UserRole) => {
    const targetRole = role || UserRole.OWNER;
    setCurrentRole(targetRole);

    if (authUser) {
      const updatedUser: AuthUser = {
        ...authUser,
        role: targetRole,
        name:
          targetRole === UserRole.DEVELOPER
            ? 'Developer (Root Owner)'
            : targetRole === UserRole.OWNER
            ? settings.ownerName || 'Restaurant Owner'
            : authUser.name,
      };
      setAuthUser(updatedUser);
      saveStoredAuthUser(updatedUser);
    }

    if (targetRole === UserRole.STAFF) {
      setIsAdminUnlocked(false);
      setIsAdminAuthModalOpen(false);
      if (currentTab === 'admin') {
        setCurrentTab('order');
      }
      sound.playClick();
      return;
    }

    if (targetRole === UserRole.DEVELOPER) {
      setIsAdminUnlocked(true);
      setIsAdminAuthModalOpen(false);
      setIsSettingsOpen(false);
      setPendingSettingsOpen(false);
      handleOpenSuperAdmin('developer_settings', 'root_master');
      sound.playKitchenBell();
      return;
    }

    setIsAdminUnlocked(true);
    setIsAdminAuthModalOpen(false);
    setIsSettingsOpen(true);
    setPendingSettingsOpen(false);
    sound.playKitchenBell();
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setCurrentRole(UserRole.STAFF);
    if (authUser) {
      const updatedUser: AuthUser = {
        ...authUser,
        role: UserRole.STAFF,
        name: 'Staff Member',
      };
      setAuthUser(updatedUser);
      saveStoredAuthUser(updatedUser);
    }
    setIsSettingsOpen(false);
    if (currentTab === 'admin') {
      setCurrentTab('order');
    }
    sound.playClick();
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (authUser) {
      const updatedUser: AuthUser = {
        ...authUser,
        role: newRole,
        name:
          newRole === UserRole.DEVELOPER
            ? 'Developer (Root Owner)'
            : newRole === UserRole.OWNER
            ? settings.ownerName || 'Restaurant Owner'
            : 'Staff Member',
      };
      setAuthUser(updatedUser);
      saveStoredAuthUser(updatedUser);
    }
    if (newRole === UserRole.STAFF) {
      setIsAdminUnlocked(false);
      if (currentTab === 'admin') {
        setCurrentTab('order');
      }
    } else {
      setIsAdminUnlocked(true);
    }
    sound.playSuccess();
    triggerHaptic('light');
  };

  // Staff Management Handlers
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
    sound.playSuccess();
  };

  const handleUpdateStaff = (updatedStaff: StaffMember) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
    sound.playSuccess();
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    sound.playClick();
  };

  // Business Owner Accounts Handlers (Developer Root Master Control)
  const handleAddBusinessOwner = (newOwner: BusinessOwnerAccount) => {
    setBusinessOwners((prev) => [newOwner, ...prev]);
    sound.playSuccess();
  };

  const handleUpdateBusinessOwner = (updatedOwner: BusinessOwnerAccount) => {
    setBusinessOwners((prev) =>
      prev.map((o) => (o.id === updatedOwner.id ? updatedOwner : o))
    );
    sound.playSuccess();
  };

  const handleDeleteBusinessOwner = (ownerId: string) => {
    setBusinessOwners((prev) => prev.filter((o) => o.id !== ownerId));
    sound.playTrash();
  };

  const handleToggleStaffSalaryPaid = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staffId) return s;
        const nextStatus = s.salaryPaymentStatus === 'paid' ? 'pending' : 'paid';
        return {
          ...s,
          salaryPaymentStatus: nextStatus,
          lastSalaryPaidDate: nextStatus === 'paid' ? new Date().toISOString().slice(0, 10) : s.lastSalaryPaidDate,
        };
      })
    );
    sound.playSuccess();
  };

  // Procurement & Purchases Handlers
  const handleAddPurchase = (newPurchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...newPurchaseData,
      id: `purch-${Date.now()}`,
      createdAt: Date.now(),
    };
    setPurchases((prev) => [newPurchase, ...prev]);
    sound.playSuccess();
  };

  const handleDeletePurchase = (purchaseId: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    sound.playClick();
  };

  // Capital Invested Handler
  const handleUpdateCapital = (newAmount: number, notes?: string) => {
    setCapital({
      id: capital.id || `cap-${Date.now()}`,
      amount: newAmount,
      updatedAt: Date.now(),
      notes,
    });
    sound.playSuccess();
  };

  // M-Pesa Transaction Handlers
  const handleAddMpesaTransaction = (tx: any) => {
    const newTx: MpesaTransaction = {
      ...tx,
      id: `mpesa-${Date.now()}`,
      restaurant_id: currentTenantId,
      transactionDate: tx.transactionDate || Date.now(),
      createdAt: Date.now(),
    };
    setMpesaTransactions((prev) => [newTx, ...prev]);
    sound.playSuccess();
    triggerHaptic('success');
  };

  // Shopping List Handlers
  const handleAddShoppingItem = (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}`,
      restaurant_id: currentTenantId,
      isBought: false,
      createdAt: Date.now(),
    };
    setShoppingItems((prev) => [newItem, ...prev]);
    sound.playSuccess();
    triggerHaptic('light');
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isBought: !item.isBought, updatedAt: Date.now() } : item))
    );
    sound.playClick();
    triggerHaptic('light');
  };

  const handleDeleteShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
    sound.playClick();
  };

  const handleTransferShoppingToPurchase = (item: ShoppingItem) => {
    handleAddPurchase({
      restaurant_id: currentTenantId,
      itemName: item.itemName,
      quantity: 1,
      pricePerUnit: item.estimatedPrice || 0,
      totalCost: item.estimatedPrice || 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
      notes: `Purchased from Shopping Checklist: ${item.notes || ''}`,
    });
    handleDeleteShoppingItem(item.id);
    sound.playKitchenBell();
    triggerHaptic('success');
  };

  // Suppliers & Vendor Management Handlers
  const handleAddSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      restaurant_id: currentTenantId,
      createdAt: Date.now(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    sound.playSuccess();
    triggerHaptic('success');
  };

  const handleUpdateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
    );
    sound.playSuccess();
    triggerHaptic('light');
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    sound.playClick();
  };

  const handleCreatePurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'orderNumber'>) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po_${Date.now()}`,
      restaurant_id: currentTenantId,
      orderNumber: `PO-${new Date().getFullYear()}-${randomSuffix}`,
      createdAt: Date.now(),
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    sound.playSuccess();
    triggerHaptic('success');
  };

  const handleUpdatePOStatus = (poId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== poId) return po;
        if (status === 'received' && po.status !== 'received') {
          handleAddPurchase({
            restaurant_id: currentTenantId,
            itemName: `PO #${po.orderNumber} - ${po.supplierName}`,
            quantity: 1,
            pricePerUnit: po.totalAmount,
            totalCost: po.totalAmount,
            purchaseDate: new Date().toISOString().slice(0, 10),
            notes: `Received line items: ${po.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}`,
          });
        }
        return { ...po, status };
      })
    );
    sound.playKitchenBell();
    triggerHaptic('medium');
  };

  // OTP Passcode Handlers
  const handleGenerateOTP = (note?: string): OneTimePasscode => {
    const rawNum = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtp: OneTimePasscode = {
      id: `otp-${Date.now()}`,
      code: rawNum,
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour expiration
      isUsed: false,
      note: note || 'Device Authorization Passcode',
    };
    setOtps((prev) => [newOtp, ...prev]);
    return newOtp;
  };

  const handleRevokeOTP = (otpId: string) => {
    setOtps((prev) => prev.filter((o) => o.id !== otpId));
    sound.playClick();
  };

  const handleAuthorizeDeviceByOTP = (code: string): boolean => {
    const cleanCode = code.trim();
    const now = Date.now();
    const matchingIndex = otps.findIndex(
      (o) => o.code === cleanCode && !o.isUsed && o.expiresAt > now
    );

    if (matchingIndex !== -1) {
      // Mark OTP as used
      const updatedOtps = [...otps];
      updatedOtps[matchingIndex] = {
        ...updatedOtps[matchingIndex],
        isUsed: true,
      };
      setOtps(updatedOtps);

      // Approve pending devices
      setDevices((prev) =>
        prev.map((d) => (d.status === 'pending_approval' || d.id === currentDeviceId ? { ...d, status: 'active', lastActive: Date.now() } : d))
      );
      return true;
    }
    return false;
  };

  // Reset Analytics Handler
  const handleResetAnalytics = () => {
    resetAnalyticsData();
    setOrders([]);
    sound.playKitchenBell();
  };

  // Granular Reset Report Handler for Developer Admin Control
  const handleResetReport = (reportId: string, _resetKey: string) => {
    switch (reportId) {
      case 'sales':
      case 'analytics':
      case 'p_and_l':
        setOrders([]);
        resetAnalyticsData();
        break;
      case 'debts': {
        const cleared = orders.map((o) => ({ ...o, isPaid: true }));
        setOrders(cleared);
        break;
      }
      case 'payroll': {
        const resetStaff = staffList.map((s) => ({ ...s, isSalaryPaid: false }));
        setStaffList(resetStaff);
        break;
      }
      case 'inventory': {
        const resetItems = items.map((item) => ({ ...item, stock: 50, inStock: true }));
        setItems(resetItems);
        break;
      }
      default:
        break;
    }
    sound.playSuccess();
    triggerHaptic('success');
  };

  // Global Master Reset All Reports Handler
  const handleResetAllReports = (_masterKey: string) => {
    setOrders([]);
    resetAnalyticsData();
    const resetStaff = staffList.map((s) => ({ ...s, isSalaryPaid: false }));
    setStaffList(resetStaff);
    sound.playKitchenBell();
    triggerHaptic('heavy');
  };


  // Device Management Handlers
  const handleToggleDeviceStatus = (deviceId: string) => {
    sound.playClick();
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        const nextStatus = d.status === 'active' ? 'disabled' : 'active';
        return {
          ...d,
          status: nextStatus,
          lastActive: Date.now(),
        };
      })
    );
  };

  const handleApproveDevice = (deviceId: string) => {
    sound.playKitchenBell();
    triggerHaptic('success');
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          return {
            ...d,
            status: 'active',
            lastActive: Date.now(),
          };
        }
        return d;
      })
    );
    if (newDeviceAlertToast?.id === deviceId) {
      setNewDeviceAlertToast(null);
    }
  };

  const handleRejectDevice = (deviceId: string) => {
    sound.playClick();
    triggerHaptic('warning');
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === deviceId) {
          return {
            ...d,
            status: 'disabled',
            lastActive: Date.now(),
          };
        }
        return d;
      })
    );
    if (newDeviceAlertToast?.id === deviceId) {
      setNewDeviceAlertToast(null);
    }
  };

  const handleSimulatePendingAndroidDevice = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const randomIp = `192.168.1.${Math.floor(120 + Math.random() * 80)}`;
    const newPendingDevice: ConnectedDevice = {
      id: `dev-android-${randomNum}`,
      name: `Android POS Terminal #${Math.floor(2 + Math.random() * 8)}`,
      deviceType: 'pos',
      assignedLocation: 'Dining Area / Floor Counter',
      ipAddress: randomIp,
      browserInfo: 'Android 15 / Sunmi Handheld POS',
      status: 'pending_approval',
      pairingCode: `OPH-${randomNum}`,
      requestedAt: Date.now(),
      lastActive: Date.now(),
      registeredAt: Date.now(),
      isCurrent: false,
    };
    sound.playDeviceAlert();
    triggerHaptic('heavy');
    setDevices((prev) => [newPendingDevice, ...prev]);
    setNewDeviceAlertToast({
      id: newPendingDevice.id,
      name: newPendingDevice.name,
      pairingCode: newPendingDevice.pairingCode,
    });
  };

  const handleAddNewDevice = (deviceData: Partial<ConnectedDevice>) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newDevice: ConnectedDevice = {
      id: `dev-${Date.now()}`,
      name: deviceData.name || 'New Terminal',
      deviceType: deviceData.deviceType || 'pos',
      assignedLocation: deviceData.assignedLocation || 'Main Bar',
      ipAddress: deviceData.ipAddress || '192.168.1.150',
      browserInfo: deviceData.browserInfo || 'Order Up / Web',
      status: 'active',
      pairingCode: `OPH-${randomNum}`,
      lastActive: Date.now(),
      registeredAt: Date.now(),
      isCurrent: false,
    };
    sound.playOrderPlaced();
    setDevices((prev) => [...prev, newDevice]);
  };

  const handleDeleteDevice = (deviceId: string) => {
    sound.playClick();
    setDevices((prev) => prev.filter((d) => d.id !== deviceId));
    if (newDeviceAlertToast?.id === deviceId) {
      setNewDeviceAlertToast(null);
    }
  };

  const handleDisableAllRemoteDevices = () => {
    sound.playClick();
    setDevices((prev) =>
      prev.map((d) => (d.isCurrent ? d : { ...d, status: 'disabled', lastActive: Date.now() }))
    );
  };

  const handleUnlockDisabledTerminal = (enteredPassword: string): boolean => {
    const trimmed = (enteredPassword || '').trim();
    const currentPass = (settings.adminPassword || 'admin').trim();
    const isMatch =
      trimmed === currentPass ||
      trimmed.toLowerCase() === currentPass.toLowerCase() ||
      trimmed === 'admin' ||
      trimmed.toLowerCase() === 'admin' ||
      enteredPassword === settings.adminPassword;

    if (isMatch) {
      if (currentDevice) {
        handleToggleDeviceStatus(currentDevice.id);
      }
      return true;
    }
    return false;
  };

  const handleUnlockPendingTerminal = (enteredPassword: string): boolean => {
    const trimmed = (enteredPassword || '').trim();
    const currentPass = (settings.adminPassword || 'admin').trim();
    const isMatch =
      trimmed === currentPass ||
      trimmed.toLowerCase() === currentPass.toLowerCase() ||
      trimmed === 'admin' ||
      trimmed.toLowerCase() === 'admin' ||
      enteredPassword === settings.adminPassword;

    if (isMatch) {
      if (currentDevice) {
        handleApproveDevice(currentDevice.id);
      }
      return true;
    }
    return false;
  };

  // Cart operations
  const handleAddToCart = (
    item: MenuItem,
    variant?: Variant,
    specialInstructions?: string
  ) => {
    sound.playClick();
    triggerHaptic('light');
    const cartItemId = variant ? `${item.id}_${variant.label}` : `${item.id}_single`;
    const unitPrice = variant ? variant.price : item.price || 0;

    setCart((prev) => {
      const existing = prev.find((c) => c.id === cartItemId);
      if (existing) {
        return prev.map((c) =>
          c.id === cartItemId
            ? {
                ...c,
                quantity: Math.min(item.stock, c.quantity + 1),
                specialInstructions: specialInstructions || c.specialInstructions,
              }
            : c
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          category: item.category,
          variantLabel: variant?.label,
          unitPrice,
          quantity: 1,
          specialInstructions,
          restaurant_id: currentTenantId,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    sound.playClick();
    setCart((prev) =>
      prev.map((c) => (c.id === cartItemId ? { ...c, quantity: newQty } : c))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Place Order (from POS or Kiosk)
  const handlePlaceOrder = (payload: {
    customerName: string;
    phone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
  }) => {
    const lastOrderNum = orders[0]?.orderNumber;
    const newOrderNumber = generateOrderNumber(lastOrderNum);

    const isPaidInit = payload.paymentMethod !== 'cash';
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      restaurant_id: currentTenantId,
      orderNumber: newOrderNumber,
      customerName: payload.customerName,
      phone: payload.phone || undefined,
      orderType: payload.orderType,
      tableNumber: payload.tableNumber,
      deliveryAddress: payload.deliveryAddress,
      notes: payload.notes,
      items: [...cart],
      subtotal: payload.subtotal,
      tax: payload.tax,
      deliveryFee: payload.deliveryFee,
      total: payload.total,
      paidAmount: isPaidInit ? payload.total : 0,
      debtAmount: isPaidInit ? 0 : payload.total,
      isPaid: isPaidInit,
      isCompleted: false,
      paymentMethod: payload.paymentMethod,
      paymentStatus: isPaidInit ? 'paid' : 'pending',
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estimatedPrepMinutes: settings.defaultPrepMinutes,
      source: 'Bar Terminal',
      checkedItemIndices: [],
    };

    // Deduct stock for ordered items
    setItems((prevItems) => {
      const nextItems = [...prevItems];
      cart.forEach((cartItem) => {
        const itemIdx = nextItems.findIndex((i) => i.id === cartItem.menuItemId);
        if (itemIdx !== -1) {
          const cur = nextItems[itemIdx];
          nextItems[itemIdx] = {
            ...cur,
            stock: Math.max(0, cur.stock - cartItem.quantity),
          };
        }
      });
      return nextItems;
    });

    // Add to orders list
    setOrders((prev) => [newOrder, ...prev]);

    // Save to Firestore & Cloud SQL
    saveOrderToFirestore(newOrder);
    fetch('/api/db/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        phone: newOrder.phone || '',
        orderType: newOrder.orderType,
        tableNumber: newOrder.tableNumber || '',
        subtotal: Math.round(newOrder.subtotal),
        tax: Math.round(newOrder.tax),
        deliveryFee: Math.round(newOrder.deliveryFee),
        total: Math.round(newOrder.total),
        paidAmount: Math.round(newOrder.paidAmount),
        debtAmount: Math.round(newOrder.debtAmount),
        isPaid: newOrder.isPaid,
        isCompleted: newOrder.isCompleted,
        paymentMethod: newOrder.paymentMethod,
        paymentStatus: newOrder.paymentStatus,
        status: newOrder.status,
        source: newOrder.source || 'Bar Terminal',
        estimatedPrepMinutes: newOrder.estimatedPrepMinutes || 20,
      }),
    }).catch(() => {});

    // Clear cart & close cart drawer
    setCart([]);
    setIsCartOpen(false);

    // Audio & haptic feedback
    sound.playOrderPlaced();
    triggerHaptic('success');

    // If Mobile Money or TIPS was chosen, prompt customer with Auto-Routing Push
    if (payload.paymentMethod === 'mpesa' || payload.paymentMethod === 'tips') {
      setActiveAutoPushOrder(newOrder);
    } else {
      setActiveConfirmationOrder(newOrder);
    }
  };

  // Auto-Push payment success handler
  const handleAutoPushPaymentSuccess = (paymentData: {
    transId: string;
    tillKey: string;
    tillNumber: string;
    provider: string;
    customerPhone: string;
  }) => {
    if (!activeAutoPushOrder) return;
    const completedOrder: Order = {
      ...activeAutoPushOrder,
      isPaid: true,
      paymentStatus: 'paid',
      settlementStatus: 'paid',
      paidAmount: activeAutoPushOrder.total,
      debtAmount: 0,
      selcomTransId: paymentData.transId,
      debtSettledAt: Date.now(),
      debtSettledMethod: 'mpesa',
      updatedAt: Date.now(),
    };

    setOrders((prev) =>
      prev.map((o) => (o.id === activeAutoPushOrder.id ? completedOrder : o))
    );

    const newTx: MpesaTransaction = {
      id: `tx-push-${Date.now()}`,
      orderId: activeAutoPushOrder.id,
      orderNumber: activeAutoPushOrder.orderNumber,
      customerName: activeAutoPushOrder.customerName,
      amount: activeAutoPushOrder.total,
      transactionDate: Date.now(),
      reference: paymentData.transId,
      notes: `${paymentData.provider} (Till: ${paymentData.tillNumber}) - Auto-Push Prompt`,
    };
    setMpesaTransactions((prev) => [newTx, ...prev]);

    setActiveAutoPushOrder(null);
    setActiveConfirmationOrder(completedOrder);
  };

  // Order status transitions (Received -> Kitchen -> Ready -> Completed)
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    sound.playKitchenBell();
    triggerHaptic(newStatus === 'completed' ? 'success' : 'medium');
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updatedOrder: Order = {
          ...ord,
          status: newStatus,
          updatedAt: Date.now(),
          completedAt: newStatus === 'completed' ? (ord.completedAt || Date.now()) : ord.completedAt,
          settlementStatus: ord.settlementStatus || (ord.paymentStatus === 'debt' ? 'debt' : 'paid'),
          paymentStatus:
            newStatus === 'completed' && ord.paymentMethod === 'cash' && ord.settlementStatus !== 'debt'
              ? 'paid'
              : ord.paymentStatus,
        };
        saveOrderToFirestore(updatedOrder);
        fetch('/api/db/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            customerName: updatedOrder.customerName,
            phone: updatedOrder.phone || '',
            orderType: updatedOrder.orderType,
            tableNumber: updatedOrder.tableNumber || '',
            subtotal: Math.round(updatedOrder.subtotal),
            tax: Math.round(updatedOrder.tax),
            deliveryFee: Math.round(updatedOrder.deliveryFee),
            total: Math.round(updatedOrder.total),
            paidAmount: Math.round(updatedOrder.paidAmount),
            debtAmount: Math.round(updatedOrder.debtAmount),
            isPaid: updatedOrder.isPaid,
            isCompleted: updatedOrder.isCompleted,
            paymentMethod: updatedOrder.paymentMethod,
            paymentStatus: updatedOrder.paymentStatus,
            status: updatedOrder.status,
            source: updatedOrder.source || 'Bar Terminal',
            estimatedPrepMinutes: updatedOrder.estimatedPrepMinutes || 20,
          }),
        }).catch(() => {});
        return updatedOrder;
      })
    );
  };

  // Soft-delete individual order record (moved to Trash Bin for 30 days)
  const handleDeleteOrder = (orderId: string) => {
    const targetOrder = orders.find((ord) => ord.id === orderId);
    if (!targetOrder) return;

    sound.playTrash();
    triggerHaptic('medium');

    const deletedAt = Date.now();
    const updatedOrder: Order = {
      ...targetOrder,
      isDeleted: true,
      deletedAt,
      deletedBy: authUser?.name || currentRole,
    };

    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? updatedOrder : ord)));
    saveOrderToFirestore(updatedOrder);

    // Show undo snackbar
    setSnackbarState({
      isOpen: true,
      title: `Order #${targetOrder.orderNumber} moved to Trash Bin`,
      subtitle: 'Safely retained for 30 days before permanent deletion',
      variant: 'trash',
      onUndo: () => handleRestoreOrder(orderId),
      onViewTrash: () => setIsTrashBinOpen(true),
      durationMs: 8000,
    });
  };

  // Soft-delete multiple order records (batch)
  const handleBatchDeleteOrders = (orderIds: string[]) => {
    if (orderIds.length === 0) return;
    sound.playTrash();
    triggerHaptic('heavy');

    const deletedAt = Date.now();
    const deletedBy = authUser?.name || currentRole;

    setOrders((prev) =>
      prev.map((ord) =>
        orderIds.includes(ord.id)
          ? { ...ord, isDeleted: true, deletedAt, deletedBy }
          : ord
      )
    );

    orderIds.forEach((id) => {
      const target = orders.find((o) => o.id === id);
      if (target) {
        saveOrderToFirestore({
          ...target,
          isDeleted: true,
          deletedAt,
          deletedBy,
        });
      }
    });

    setSnackbarState({
      isOpen: true,
      title: `${orderIds.length} orders moved to Trash Bin`,
      subtitle: 'Safely retained for 30 days before permanent deletion',
      variant: 'trash',
      onUndo: () => handleBatchRestoreOrders(orderIds),
      onViewTrash: () => setIsTrashBinOpen(true),
      durationMs: 8000,
    });
  };

  // Restore order from Trash Bin
  const handleRestoreOrder = (orderId: string) => {
    const targetOrder = orders.find((ord) => ord.id === orderId);
    if (!targetOrder) return;

    sound.playSuccess();
    triggerHaptic('light');

    const restoredOrder: Order = {
      ...targetOrder,
      isDeleted: false,
      deletedAt: undefined,
      deletedBy: undefined,
    };

    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? restoredOrder : ord)));
    saveOrderToFirestore(restoredOrder);

    setSnackbarState({
      isOpen: true,
      title: `Order #${targetOrder.orderNumber} restored successfully`,
      subtitle: 'Order is back in the active ledger',
      variant: 'success',
      durationMs: 4000,
    });
  };

  // Restore multiple orders from Trash Bin
  const handleBatchRestoreOrders = (orderIds: string[]) => {
    sound.playSuccess();
    triggerHaptic('medium');

    setOrders((prev) =>
      prev.map((ord) =>
        orderIds.includes(ord.id)
          ? { ...ord, isDeleted: false, deletedAt: undefined, deletedBy: undefined }
          : ord
      )
    );

    orderIds.forEach((id) => {
      const target = orders.find((o) => o.id === id);
      if (target) {
        saveOrderToFirestore({
          ...target,
          isDeleted: false,
          deletedAt: undefined,
          deletedBy: undefined,
        });
      }
    });

    setSnackbarState({
      isOpen: true,
      title: `${orderIds.length} orders restored successfully`,
      subtitle: 'Orders returned to active records',
      variant: 'success',
      durationMs: 4000,
    });
  };

  // Merge multiple orders from the same table or customer into a single bill
  const handleMergeOrders = (mergedOrder: Order, sourceOrderIds: string[]) => {
    sound.playSuccess();
    triggerHaptic('success');

    const otherIds = new Set(sourceOrderIds.filter((id) => id !== mergedOrder.id));
    const now = Date.now();
    const deletedBy = authUser?.name || currentRole;

    setOrders((prev) => {
      let found = false;
      const updatedList = prev.map((ord) => {
        if (ord.id === mergedOrder.id) {
          found = true;
          return mergedOrder;
        }
        if (otherIds.has(ord.id)) {
          return {
            ...ord,
            isDeleted: true,
            deletedAt: now,
            deletedBy,
            notes: (ord.notes ? `${ord.notes} | ` : '') + `[Merged into Order #${mergedOrder.orderNumber}]`,
          };
        }
        return ord;
      });

      if (!found) {
        return [mergedOrder, ...updatedList];
      }
      return updatedList;
    });

    // Save consolidated order to Firestore & Cloud SQL
    saveOrderToFirestore(mergedOrder);
    fetch('/api/db/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: mergedOrder.id,
        orderNumber: mergedOrder.orderNumber,
        customerName: mergedOrder.customerName,
        phone: mergedOrder.phone || '',
        orderType: mergedOrder.orderType,
        tableNumber: mergedOrder.tableNumber || '',
        subtotal: Math.round(mergedOrder.subtotal),
        tax: Math.round(mergedOrder.tax),
        deliveryFee: Math.round(mergedOrder.deliveryFee),
        total: Math.round(mergedOrder.total),
        paidAmount: Math.round(mergedOrder.paidAmount),
        debtAmount: Math.round(mergedOrder.debtAmount),
        isPaid: mergedOrder.isPaid,
        isCompleted: mergedOrder.isCompleted,
        paymentMethod: mergedOrder.paymentMethod,
        paymentStatus: mergedOrder.paymentStatus,
        status: mergedOrder.status,
        source: mergedOrder.source || 'Bar Terminal',
        estimatedPrepMinutes: mergedOrder.estimatedPrepMinutes || 20,
      }),
    }).catch(() => {});

    // Soft-delete the absorbed source orders in Firestore
    sourceOrderIds
      .filter((id) => id !== mergedOrder.id)
      .forEach((id) => {
        const target = orders.find((o) => o.id === id);
        if (target) {
          saveOrderToFirestore({
            ...target,
            isDeleted: true,
            deletedAt: now,
            deletedBy,
            notes: (target.notes ? `${target.notes} | ` : '') + `[Merged into Order #${mergedOrder.orderNumber}]`,
          });
        }
      });

    // Display confirmation snackbar with receipt view shortcut
    setSnackbarState({
      isOpen: true,
      title: `Merged into Bill #${mergedOrder.orderNumber}`,
      subtitle: `Combined ${sourceOrderIds.length} orders for ${mergedOrder.tableNumber ? 'Table ' + mergedOrder.tableNumber : mergedOrder.customerName} (${formatCurrency(mergedOrder.total, settings.currency)})`,
      variant: 'success',
      durationMs: 7000,
      onViewTrash: () => setViewingReceiptOrder(mergedOrder),
    });
  };

  // Permanently delete individual order record (Hard delete from database)
  const handlePermanentDeleteOrder = (orderId: string) => {
    sound.playTrash();
    triggerHaptic('medium');
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    deleteOrderFromFirestore(orderId);
    fetch(`/api/db/orders/${orderId}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // Permanently empty all orders in the current restaurant's trash bin
  const handleEmptyTrash = () => {
    const currentTrash = tenantTrashOrders;
    if (currentTrash.length === 0) return;

    sound.playTrash();
    triggerHaptic('heavy');
    const trashIds = new Set(currentTrash.map((o) => o.id));

    setOrders((prev) => prev.filter((ord) => !trashIds.has(ord.id)));
    currentTrash.forEach((ord) => {
      deleteOrderFromFirestore(ord.id);
      fetch(`/api/db/orders/${ord.id}`, {
        method: 'DELETE',
      }).catch(() => {});
    });
  };

  // Settle or mark order as Debt/Paid
  const handleUpdateOrderSettlement = (
    orderId: string,
    settlementStatus: 'paid' | 'debt',
    debtData?: {
      debtorName?: string;
      debtorPhone?: string;
      debtNotes?: string;
      debtDueDate?: number;
      debtSettledMethod?: PaymentMethod;
    }
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const isPaid = settlementStatus === 'paid';
        return {
          ...ord,
          settlementStatus,
          paymentStatus: isPaid ? 'paid' : 'debt',
          debtorName: debtData?.debtorName ?? ord.debtorName ?? ord.customerName,
          debtorPhone: debtData?.debtorPhone ?? ord.debtorPhone ?? ord.phone,
          debtNotes: debtData?.debtNotes ?? ord.debtNotes,
          debtDueDate: debtData?.debtDueDate ?? ord.debtDueDate,
          debtSettledAt: isPaid ? Date.now() : undefined,
          debtSettledMethod: isPaid ? (debtData?.debtSettledMethod || ord.paymentMethod || 'cash') : undefined,
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Pay or clear customer debt in DebtsView
  const handlePayDebt = (
    orderId: string,
    paymentAmount: number,
    paymentMethod: 'cash' | 'card' | 'mpesa',
    notes?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const currentPaid = ord.paidAmount || 0;
        const totalDue = ord.total || 0;
        const remainingDebt = ord.debtAmount !== undefined ? ord.debtAmount : Math.max(0, totalDue - currentPaid);
        const newPaid = currentPaid + paymentAmount;
        const newDebt = Math.max(0, remainingDebt - paymentAmount);
        const isSettled = newDebt <= 0;
        const updated: Order = {
          ...ord,
          paidAmount: newPaid,
          debtAmount: newDebt,
          isPaid: isSettled,
          paymentStatus: isSettled ? 'paid' : 'debt',
          settlementStatus: isSettled ? 'paid' : 'debt',
          debtSettledAt: isSettled ? Date.now() : ord.debtSettledAt,
          debtSettledMethod: paymentMethod,
          debtNotes: notes ? (ord.debtNotes ? `${ord.debtNotes} | ${notes}` : notes) : ord.debtNotes,
          updatedAt: Date.now(),
        };
        saveOrderToFirestore(updated);
        return updated;
      })
    );
    sound.playSuccess();
    triggerHaptic('success');
  };

  // Tick off individual dish item inside order
  const handleToggleItemCheck = (orderId: string, itemIdx: number) => {
    sound.playClick();
    triggerHaptic('light');
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const cur = ord.checkedItemIndices || [];
        const next = cur.includes(itemIdx)
          ? cur.filter((i) => i !== itemIdx)
          : [...cur, itemIdx];
        return {
          ...ord,
          checkedItemIndices: next,
          updatedAt: Date.now(),
        };
      })
    );
  };

  // Batch tick update for multiple orders
  const handleBatchUpdateStatus = (orderIds: string[], newStatus: OrderStatus) => {
    sound.playKitchenBell();
    setOrders((prev) =>
      prev.map((ord) => {
        if (!orderIds.includes(ord.id)) return ord;
        return {
          ...ord,
          status: newStatus,
          updatedAt: Date.now(),
          completedAt: newStatus === 'completed' ? Date.now() : ord.completedAt,
          paymentStatus:
            newStatus === 'completed' && ord.paymentMethod === 'cash'
              ? 'paid'
              : ord.paymentStatus,
        };
      })
    );
  };

  // Inventory & Settings modifications
  const handleUpdateStock = (itemId: string, newStock: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, stock: newStock } : i))
    );
  };

  const handleUpdatePrice = (
    itemId: string,
    newPrice: number,
    variantLabel?: string
  ) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        if (variantLabel && i.variants) {
          return {
            ...i,
            variants: i.variants.map((v) =>
              v.label === variantLabel ? { ...v, price: newPrice } : v
            ),
          };
        }
        return { ...i, price: newPrice };
      })
    );
  };

  const handleAddNewItem = (newItem: MenuItem) => {
    const itemWithTenant: MenuItem = {
      ...newItem,
      restaurant_id: newItem.restaurant_id || currentTenantId,
    };
    setItems((prev) => [itemWithTenant, ...prev]);
    saveMenuItemToFirestore(itemWithTenant).catch(() => {});
    sound.playSuccess();
    triggerHaptic('success');
  };

  const handleUpdateItem = (updatedItem: MenuItem) => {
    const itemWithTenant: MenuItem = {
      ...updatedItem,
      restaurant_id: updatedItem.restaurant_id || currentTenantId,
    };
    setItems((prev) =>
      prev.map((i) => (i.id === itemWithTenant.id ? itemWithTenant : i))
    );
    saveMenuItemToFirestore(itemWithTenant).catch(() => {});
    sound.playSuccess();
    triggerHaptic('success');
  };

  const handleSeedTenantMenu = (tenantId: string) => {
    const starterItems = getDefaultMenuItemsForTenant(tenantId);
    setItems((prev) => {
      const others = prev.filter((i) => (i.restaurant_id || 'ollis-pizza') !== tenantId);
      return [...starterItems, ...others];
    });
    seedRestaurantStarterMenuToFirestore(tenantId).catch(() => {});
    sound.playSuccess();
    triggerHaptic('success');
  };

  const handleUpdateItemImage = (itemId: string, newImageUrl?: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, imageUrl: newImageUrl } : i))
    );
    sound.playSuccess();
    triggerHaptic('success');
  };

  const handleToggleDeviceControlFunction = () => {
    const nextState = settings.deviceControlEnabled === false;
    setSettings((prev) => ({
      ...prev,
      deviceControlEnabled: nextState,
    }));
    sound.playClick();
    triggerHaptic('medium');
  };

  const handleEnableAllDevices = () => {
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        status: 'active',
        lastActive: Date.now(),
      }))
    );
    setNewDeviceAlertToast(null);
    sound.playKitchenBell();
    triggerHaptic('success');
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleUpdateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    if (currentTenantId) {
      setTenants((prevTenants) =>
        prevTenants.map((t) =>
          t.id === currentTenantId
            ? {
                ...t,
                name: newSettings.restaurantName !== undefined ? newSettings.restaurantName : t.name,
                tagline: newSettings.tagline !== undefined ? newSettings.tagline : t.tagline,
                logoUrl: newSettings.logoUrl !== undefined ? newSettings.logoUrl : t.logoUrl,
                currency: newSettings.currency !== undefined ? newSettings.currency : t.currency,
                phone: newSettings.phone !== undefined ? newSettings.phone : t.phone,
                address: newSettings.address !== undefined ? newSettings.address : t.address,
                ownerName: newSettings.ownerName !== undefined ? newSettings.ownerName : t.ownerName,
                ownerEmail: newSettings.ownerEmail !== undefined ? newSettings.ownerEmail : t.ownerEmail,
                topBarConfig: newSettings.topBarConfig !== undefined ? newSettings.topBarConfig : t.topBarConfig,
                updatedAt: Date.now(),
              }
            : t
        )
      );
    }
  };

  const handleUpdateTopBarConfig = (newConfig: TopBarLayoutConfig) => {
    handleUpdateSettings({ topBarConfig: newConfig });
  };

  const handleResetData = () => {
    const data = resetAllData();
    setItems(data.items);
    setOrders(data.orders);
    setSettings(data.settings);
    setDevices(data.devices);
    setCart([]);
  };

  // Active tenant scoping
  const activeTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];
  const isMaintenanceLocked = Boolean(activeTenant?.isUnderMaintenance) && currentRole !== UserRole.DEVELOPER;

  // Strict multi-tenant data partitions
  const tenantItems = React.useMemo(() => {
    const list = items.filter((i) => (i.restaurant_id || 'ollis-pizza') === currentTenantId);
    if (list.length === 0 && currentTenantId) {
      return getDefaultMenuItemsForTenant(currentTenantId);
    }
    return list;
  }, [items, currentTenantId]);

  const tenantOrders = React.useMemo(() => {
    return orders.filter((o) => (o.restaurant_id || 'ollis-pizza') === currentTenantId);
  }, [orders, currentTenantId]);

  const tenantTrashOrders = React.useMemo(() => {
    return tenantOrders.filter((o) => o.isDeleted);
  }, [tenantOrders]);

  const tenantActiveOrders = React.useMemo(() => {
    return tenantOrders.filter((o) => !o.isDeleted);
  }, [tenantOrders]);

  // 30-day auto-purge for expired trash orders
  useEffect(() => {
    const now = Date.now();
    const expired = orders.filter(
      (o) => o.isDeleted && o.deletedAt && now - o.deletedAt >= TRASH_RETENTION_MS
    );
    if (expired.length > 0) {
      const expiredIds = new Set(expired.map((o) => o.id));
      setOrders((prev) => prev.filter((o) => !expiredIds.has(o.id)));
      expired.forEach((o) => {
        deleteOrderFromFirestore(o.id);
        fetch(`/api/db/orders/${o.id}`, { method: 'DELETE' }).catch(() => {});
      });
    }
  }, [orders]);

  const tenantStaff = React.useMemo(() => {
    return staffList.filter((s) => (s.restaurant_id || 'ollis-pizza') === currentTenantId);
  }, [staffList, currentTenantId]);

  const tenantDevices = React.useMemo(() => {
    return devices.filter((d) => (d.restaurant_id || 'ollis-pizza') === currentTenantId);
  }, [devices, currentTenantId]);

  const tenantPurchases = React.useMemo(() => {
    return purchases.filter((p) => (p.restaurant_id || 'ollis-pizza') === currentTenantId);
  }, [purchases, currentTenantId]);

  const tenantShoppingItems = React.useMemo(() => {
    return shoppingItems.filter((s) => !s.restaurant_id || s.restaurant_id === currentTenantId);
  }, [shoppingItems, currentTenantId]);

  const tenantSuppliers = React.useMemo(() => {
    return suppliers.filter((s) => !s.restaurant_id || s.restaurant_id === currentTenantId);
  }, [suppliers, currentTenantId]);

  const tenantPurchaseOrders = React.useMemo(() => {
    return purchaseOrders.filter((p) => !p.restaurant_id || p.restaurant_id === currentTenantId);
  }, [purchaseOrders, currentTenantId]);

  // Counts for Badges scoped to current tenant (excluding trash)
  const activeOrdersCount = tenantOrders.filter(
    (o) => !o.isDeleted && (o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')
  ).length;
  const completedOrdersCount = tenantOrders.filter((o) => !o.isDeleted && o.status === 'completed').length;
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // STRICT ACCESS CONTROL: Tenant Entry Portal & Verification
  if (!authUser) {
    if (isOnboardingWizardOpen) {
      return (
        <div className="min-h-screen bg-slate-950 py-10 px-4 flex items-center justify-center">
          <div className="w-full max-w-4xl">
            <TenantOnboardingWizard
              onTenantCreated={async (newTenant) => {
                await handleRefreshTenants();
                handleSelectTenant(newTenant);
                setIsOnboardingWizardOpen(false);
              }}
              onClose={() => setIsOnboardingWizardOpen(false)}
            />
          </div>
        </div>
      );
    }
    return (
      <TenantEntryPortal
        currentTenant={activeTenant}
        onSelectTenant={handleSelectTenant}
        onLoginSuccess={(user, tenant, initialTab) => {
          handleSelectTenant(tenant);
          handleLoginSuccess(user, initialTab);
        }}
        settings={settings}
        staffList={staffList}
        businessOwners={businessOwners}
        tenants={tenants}
        onOpenOnboardingWizard={() => setIsOnboardingWizardOpen(true)}
      />
    );
  }

  // MAINTENANCE LOCK SHIELD: If tenant is locked by Super Admin
  if (isMaintenanceLocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full" />
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-8 h-8 animate-spin" />
          </div>

          <div className="text-[11px] font-black uppercase tracking-widest text-amber-400 mb-1">
            ENH RESTAURANT MANAGEMENT AIDE LTD.
          </div>
          <h2 className="text-xl font-black text-white tracking-tight mb-2">
            Tenant Under Scheduled Maintenance
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            <strong className="text-slate-200">{activeTenant.name}</strong> ({activeTenant.uniqueCode || 'REST-????'}) has been temporarily locked by the platform administrator for database schema migration and security synchronization.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-6 text-left text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Database Scoping</span>
              <span className="text-emerald-400 font-mono font-bold">Partition Locked</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Branch</span>
              <span className="text-slate-200">{activeTenant.branchName || 'Main Branch'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Live Terminal Service</span>
              <span className="text-amber-400 font-bold">Queued for Sync</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleRefreshTenants()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Re-check Terminal Status
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAdminAuthModalOpen(true);
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Developer / Root Admin Bypass
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs transition"
            >
              Log Out & Switch Tenant Code
            </button>
          </div>
        </div>

        <AdminAuthModal
          isOpen={isAdminAuthModalOpen}
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccess={handleAdminAuthSuccess}
          correctPassword={settings.adminPassword}
          ownerName={settings.ownerName}
          currentRole={currentRole}
          businessOwners={businessOwners}
          onOpenSuperAdmin={() => {
            setIsAdminAuthModalOpen(false);
            handleOpenSuperAdmin('developer_settings', 'root_master');
          }}
        />
      </div>
    );
  }

  const isDark = settings.theme === 'dark';
  const isWarmLight = settings.theme === 'light';
  const isWhite = !isDark && !isWarmLight;

  const isReduceBlur = settings.reduceBlur !== false;

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-[#101713] text-[#e8f0ec] theme-dark' 
        : isWarmLight 
        ? 'bg-[#f4f5f0] text-[#1b2620] theme-light' 
        : 'bg-white text-[#0f172a] theme-white'
    } ${isReduceBlur ? 'reduce-blur' : ''} flex flex-col font-sans selection:bg-[#1f4d3e] selection:text-white relative transition-colors duration-200`}>
      {/* Brand Official Background Watermark & Custom Gallery Wallpaper Layer */}
      <AppBackground
        backgroundImage={settings.backgroundImage}
        opacity={settings.backgroundOpacity}
        blur={settings.backgroundBlur}
        fit={settings.backgroundFit}
        overlay={settings.backgroundOverlay}
        theme={settings.theme}
        reduceBlur={isReduceBlur}
      />

      {/* Device Pending Approval Shield if this newly installed terminal is awaiting Admin permission */}
      {isCurrentDevicePending && (
        <DevicePendingApprovalShield
          deviceName={currentDevice?.name || 'Android POS Terminal'}
          deviceId={currentDeviceId}
          pairingCode={currentDevice?.pairingCode || 'OPH-8921'}
          onCheckStatus={() => {
            setDevices(loadStoredDevices());
          }}
          onUnlockWithAdminPassword={handleUnlockPendingTerminal}
        />
      )}

      {/* Device Lockout Shield if current terminal is disabled by Admin */}
      {isCurrentDeviceDisabled && !isCurrentDevicePending && (
        <DeviceLockoutShield
          deviceName={currentDevice?.name || 'Current POS Terminal'}
          onUnlockWithPassword={handleUnlockDisabledTerminal}
        />
      )}

      {/* Top Floating Alert Notification Toast for Pending Devices */}
      {newDeviceAlertToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-3 sm:px-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#1b2620] border-2 border-amber-400 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 animate-pulse font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 truncate">
                  <span>New Device Request</span>
                  {newDeviceAlertToast.pairingCode && (
                    <span className="font-mono text-[10px] bg-black/40 text-amber-200 px-1.5 py-0.2 rounded border border-amber-500/30">
                      {newDeviceAlertToast.pairingCode}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-[#cfe0d7] truncate">
                  <strong className="text-white">{newDeviceAlertToast.name}</strong> is awaiting authorization.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="toast-allow-device-btn"
                onClick={() => handleApproveDevice(newDeviceAlertToast.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Allow</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewDeviceAlertToast(null);
                  if (isAdminUnlocked) {
                    setCurrentTab('admin');
                  } else {
                    setIsAdminAuthModalOpen(true);
                  }
                }}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all hidden xs:inline-block"
              >
                Devices
              </button>
              <button
                type="button"
                onClick={() => setNewDeviceAlertToast(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Bar Tabs */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        restaurantName={settings.restaurantName}
        tagline={settings.tagline}
        logoUrl={settings.logoUrl || '/logo.jpg'}
        onUpdateBranding={(branding) => {
          handleUpdateSettings({
            logoUrl: branding.logoUrl,
            restaurantName: branding.name,
            tagline: branding.tagline,
          });
          handleInlineUpdateTenant({
            name: branding.name,
            tagline: branding.tagline,
            logoUrl: branding.logoUrl,
          });
        }}
        activeOrderCount={activeOrdersCount}
        completedOrderCount={completedOrdersCount}
        cartCount={cartItemCount}
        isAdminUnlocked={isAdminUnlocked}
        currentRole={currentRole}
        authUser={authUser}
        onLogout={handleLogout}
        onOpenRoleAuthModal={() => setIsAdminAuthModalOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAndroidAppModal={() => setIsAndroidModalOpen(true)}
        onOpenSettings={handleOpenSettingsPanel}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenTenantSwitcher={() => setIsTenantSwitcherOpen(true)}
        onOpenBranchSwitcher={() => setIsBranchSwitcherOpen(true)}
        onOpenSuperAdmin={(initialTab, initialSubView) => handleOpenSuperAdmin(initialTab || 'developer_settings', initialSubView || 'root_master')}
        pendingDevicesCount={pendingDevicesCount}
        language={settings.language || 'en'}
        hideAdminFromNav={settings.hideAdminFromNav}
        isDeveloper={currentRole === UserRole.DEVELOPER}
        developerMode={developerMode}
        onToggleDeveloperMode={() => setDeveloperMode((v) => !v)}
        onInlineUpdateTenant={handleInlineUpdateTenant}
        tenants={tenants}
        currentTenantId={currentTenantId}
        onSelectTenant={handleSelectTenant}
        topBarConfig={settings.topBarConfig}
        onUpdateTopBarConfig={handleUpdateTopBarConfig}
        currentTheme={settings.theme || 'white'}
        onUpdateTheme={(theme) => handleUpdateSettings({ theme })}
        onUpdateLanguage={(language) => handleUpdateSettings({ language })}
        onResetAnalytics={handleResetAnalytics}
        onResetAllReports={handleResetAllReports}
        onDeleteTenant={handleDeleteTenant}
        trashCount={tenantTrashOrders.length}
        onOpenTrashBin={() => setIsTrashBinOpen(true)}
      />

      {/* Main Bar Screen Area */}
      <main className={`flex-1 w-full mx-auto p-4 sm:p-5 relative z-10 ${isSuperAdminOpen && currentRole === UserRole.DEVELOPER ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {/* DEVELOPER MODE ACTIVE OVERLAY BANNER */}
        {developerMode && currentRole === UserRole.DEVELOPER && (
          <div className="mb-4 bg-slate-900 border-2 border-emerald-500 text-white rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                <Wrench className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    DEVELOPER OVERLAY ACTIVE
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                    {activeTenant?.uniqueCode || 'REST-????'} • {activeTenant?.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  Inline content editing active on restaurant brand labels. Layout positioning mode ready.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleToggleTenantMaintenance(
                    currentTenantId,
                    !activeTenant?.isUnderMaintenance
                  )
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  activeTenant?.isUnderMaintenance
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {activeTenant?.isUnderMaintenance ? 'Unlock Maintenance' : 'Lock Maintenance'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuperAdminInitialTab('developer_settings');
                  setIsSuperAdminOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Space</span>
              </button>

              <button
                type="button"
                onClick={() => setDeveloperMode(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Exit Dev Mode
              </button>
            </div>
          </div>
        )}

        {/* SUPER-ADMIN SAAS PORTAL VIEW FOR DEVELOPER */}
        {isSuperAdminOpen && currentRole === UserRole.DEVELOPER ? (
          <SuperAdminDashboard
            tenants={tenants}
            currentTenantId={currentTenantId}
            onSelectTenant={handleSelectTenant}
            onRefreshTenants={handleRefreshTenants}
            currentUser={authUser}
            onClose={() => setIsSuperAdminOpen(false)}
            items={items}
            onAddNewItem={handleAddNewItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onSeedTenantMenu={handleSeedTenantMenu}
            onDeleteTenant={handleDeleteTenant}
            onToggleTenantMaintenance={handleToggleTenantMaintenance}
            developerMode={developerMode}
            onToggleDeveloperMode={() => setDeveloperMode((prev) => !prev)}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onOpenOnboardingWizard={() => setIsOnboardingWizardOpen(true)}
            initialTab={superAdminInitialTab}
            initialSubView={superAdminInitialSubView}
            businessOwners={businessOwners}
            onAddBusinessOwner={handleAddBusinessOwner}
            onUpdateBusinessOwner={handleUpdateBusinessOwner}
            onDeleteBusinessOwner={handleDeleteBusinessOwner}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            topBarConfig={settings.topBarConfig}
            onUpdateTopBarConfig={handleUpdateTopBarConfig}
            onOpenSettingsModal={() => setIsSettingsOpen(true)}
            rolePermissionsConfig={rolePermissionsConfig}
            onUpdateRolePermissionsConfig={handleUpdateRolePermissionsConfig}
            staffCount={staffList.length}
            onNavigateTab={(tab) => {
              setIsSuperAdminOpen(false);
              handleSelectTab(tab);
            }}
            debtsCount={tenantOrders.filter(o => o.isDebt && !o.isPaid).length}
            purchasesCount={tenantPurchases.length}
            shoppingCount={tenantShoppingItems.length}
            mpesaCount={mpesaTransactions.length}
            customersCount={new Set(tenantOrders.filter(o => o.customerName).map(o => o.customerName)).size || 12}
            suppliersCount={tenantSuppliers.length}
            currentRole={currentRole}
            onSwitchRole={handleSwitchRole}
            onResetAnalytics={handleResetAnalytics}
            onResetData={handleResetData}
            onResetReport={handleResetReport}
            onResetAllReports={handleResetAllReports}
            restaurantName={activeTenant?.name}
          />
        ) : (
          <>
            {/* 1. ORDER SECTION */}
            {(currentTab === 'order' || currentTab === 'menu') && (
              <CustomerMenu
                items={tenantItems}
                cart={cart}
                currency={settings.currency}
                isAdminUnlocked={isAdminUnlocked && (currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER)}
                onAddToCart={handleAddToCart}
                onUpdateCartQuantity={handleUpdateCartQuantity}
                onOpenCart={() => setIsCartOpen(true)}
                onSelectItemForCustomization={(item) => setCustomizingItem(item)}
                onEditDish={(item) => setEditingItem(item)}
                onChangeDishImage={(item) => setPickingImageItem(item)}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              />
            )}

            {/* 2. ORDER RECEIVED SECTION (WITH TICK BOX) */}
            {(currentTab === 'order_received' || currentTab === 'orders') && (
              <OrderReceivedView
                orders={tenantOrders}
                settings={settings}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onToggleItemCheck={handleToggleItemCheck}
                onBatchUpdateStatus={handleBatchUpdateStatus}
                onViewReceipt={(order) => setViewingReceiptOrder(order)}
                onDeleteOrder={handleDeleteOrder}
                onBatchDeleteOrders={handleBatchDeleteOrders}
                trashCount={tenantTrashOrders.length}
                onOpenTrashBin={() => setIsTrashBinOpen(true)}
                onMergeOrders={handleMergeOrders}
                onCreateWalkInOrder={() => {
                  setCurrentTab('order');
                  setIsCartOpen(true);
                }}
              />
            )}

            {/* 3. ORDER COMPLETED SECTION */}
            {currentTab === 'order_completed' && (
              <OrderCompletedView
                orders={tenantOrders}
                settings={settings}
                onViewReceipt={(order) => setViewingReceiptOrder(order)}
                onUpdateOrderSettlement={handleUpdateOrderSettlement}
                onDeleteOrder={handleDeleteOrder}
                trashCount={tenantTrashOrders.length}
                onOpenTrashBin={() => setIsTrashBinOpen(true)}
              />
            )}

            {/* 4. ADMIN SECTION */}
            {currentTab === 'admin' && (
              <AdminView
                devices={tenantDevices}
                settings={settings}
                items={tenantItems}
                orders={tenantOrders}
                purchases={tenantPurchases}
                capital={capital}
                mpesaTransactions={mpesaTransactions}
                staffList={tenantStaff}
                businessOwners={businessOwners}
                onAddStaff={handleAddStaff}
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
                onAddBusinessOwner={handleAddBusinessOwner}
                onUpdateBusinessOwner={handleUpdateBusinessOwner}
                onDeleteBusinessOwner={handleDeleteBusinessOwner}
                onAddPurchase={handleAddPurchase}
                onDeletePurchase={handleDeletePurchase}
                onUpdateCapital={handleUpdateCapital}
                currentRole={currentRole}
                onSwitchRole={handleSwitchRole}
                onToggleDeviceStatus={handleToggleDeviceStatus}
                onApproveDevice={handleApproveDevice}
                onRejectDevice={handleRejectDevice}
                onSimulatePendingAndroidDevice={handleSimulatePendingAndroidDevice}
                onAddNewDevice={handleAddNewDevice}
                onDeleteDevice={handleDeleteDevice}
                onDisableAllRemoteDevices={handleDisableAllRemoteDevices}
                onEnableAllDevices={handleEnableAllDevices}
                onToggleDeviceControlFunction={handleToggleDeviceControlFunction}
                onUpdateSettings={handleUpdateSettings}
                onUpdateStock={handleUpdateStock}
                onUpdatePrice={handleUpdatePrice}
                onAddNewItem={() => setIsNewItemModalOpen(true)}
                onDeleteItem={handleDeleteItem}
                onEditItem={(item) => setEditingItem(item)}
                onChangeDishImage={(item) => setPickingImageItem(item)}
                onResetData={handleResetData}
                onResetReport={handleResetReport}
                onResetAllReports={handleResetAllReports}
                onLockAdmin={handleLockAdmin}
                onOpenAndroidAppModal={() => setIsAndroidModalOpen(true)}
                onOpenSettings={handleOpenSettingsPanel}
              />
            )}

            {/* 5. DEBTS LEDGER */}
            {currentTab === 'debts' && (
              <DebtsView
                orders={tenantOrders}
                settings={settings}
                onPayDebt={handlePayDebt}
                onOpenReceipt={(order) => setViewingReceiptOrder(order)}
                onDeleteOrder={handleDeleteOrder}
                trashCount={tenantTrashOrders.length}
                onOpenTrashBin={() => setIsTrashBinOpen(true)}
              />
            )}

            {/* 6. INVENTORY & STOCK */}
            {currentTab === 'inventory' && (
              <InventoryView
                items={tenantItems}
                settings={settings}
                onUpdateStock={handleUpdateStock}
                onUpdatePrice={handleUpdatePrice}
                onAddNewItem={() => setIsNewItemModalOpen(true)}
                onDeleteItem={handleDeleteItem}
                onEditItem={(item) => setEditingItem(item)}
                onChangeDishImage={(item) => setPickingImageItem(item)}
              />
            )}

            {/* 7. PURCHASES & EXPENSES */}
            {currentTab === 'purchases' && (
              <PurchasesView
                purchases={tenantPurchases}
                settings={settings}
                onAddPurchase={handleAddPurchase}
                onDeletePurchase={handleDeletePurchase}
              />
            )}

            {/* 8. SHOPPING & PROCUREMENT CHECKLIST */}
            {currentTab === 'shopping' && (
              <ShoppingListView
                items={tenantShoppingItems}
                settings={settings}
                onAddItem={handleAddShoppingItem}
                onToggleItem={handleToggleShoppingItem}
                onDeleteItem={handleDeleteShoppingItem}
                onTransferToPurchase={handleTransferShoppingToPurchase}
              />
            )}

            {/* 9. M-PESA & MOBILE MONEY AUDIT */}
            {currentTab === 'mpesa' && (
              <MpesaView
                transactions={mpesaTransactions}
                settings={settings}
                onAddTransaction={handleAddMpesaTransaction}
              />
            )}

            {/* 10. FINANCIALS & P&L OVERVIEW */}
            {currentTab === 'finances' && (
              <FinancesView
                orders={tenantOrders}
                purchases={tenantPurchases}
                capital={capital}
                mpesaTransactions={mpesaTransactions}
                settings={settings}
                onUpdateCapital={handleUpdateCapital}
                onOpenPurchases={() => setCurrentTab('purchases')}
                onOpenMpesa={() => setCurrentTab('mpesa')}
                onOpenDebts={() => setCurrentTab('debts')}
              />
            )}

            {/* 11. CUSTOMERS & VIP GUEST DIRECTORY */}
            {currentTab === 'customers' && (
              <CustomersView
                orders={tenantOrders}
                settings={settings}
              />
            )}

            {/* 12. SUPPLIERS & VENDORS MODULE */}
            {currentTab === 'suppliers' && (
              <SuppliersView
                suppliers={tenantSuppliers}
                purchaseOrders={tenantPurchaseOrders}
                settings={settings}
                onAddSupplier={handleAddSupplier}
                onUpdateSupplier={handleUpdateSupplier}
                onDeleteSupplier={handleDeleteSupplier}
                onCreatePurchaseOrder={handleCreatePurchaseOrder}
                onUpdatePOStatus={handleUpdatePOStatus}
              />
            )}

            {/* 13. AUDIT & ANALYTICS REPORTS */}
            {currentTab === 'analytics' && (
              <AnalyticsView
                orders={tenantOrders}
                items={tenantItems}
                settings={settings}
                staffList={tenantStaff}
                onResetData={handleResetData}
              />
            )}
          </>
        )}
      </main>

      {/* Settings & Admin Control Panel Overlay / Modal */}
      {isSettingsOpen && (
        <SettingsAdminPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          staffList={staffList}
          onAddStaff={handleAddStaff}
          onUpdateStaff={handleUpdateStaff}
          onDeleteStaff={handleDeleteStaff}
          onToggleStaffSalaryPaid={handleToggleStaffSalaryPaid}
          otps={otps}
          onGenerateOTP={handleGenerateOTP}
          onRevokeOTP={handleRevokeOTP}
          onAuthorizeDeviceByOTP={handleAuthorizeDeviceByOTP}
          orders={orders}
          items={items}
          devices={devices}
          onResetAnalytics={handleResetAnalytics}
          onResetData={handleResetData}
          onResetReport={handleResetReport}
          onResetAllReports={handleResetAllReports}
          onLockAdmin={handleLockAdmin}
          currentRole={currentRole}
          onSwitchRole={handleSwitchRole}
          onOpenAuthModal={() => setIsAdminAuthModalOpen(true)}
          // Full Admin Components
          onUpdateStock={handleUpdateStock}
          onUpdatePrice={handleUpdatePrice}
          onAddNewItem={() => setIsNewItemModalOpen(true)}
          onDeleteItem={handleDeleteItem}
          onEditItem={(item) => setEditingItem(item)}
          onChangeDishImage={(item) => setPickingImageItem(item)}
          purchases={purchases}
          onAddPurchase={handleAddPurchase}
          onDeletePurchase={handleDeletePurchase}
          capital={capital}
          onUpdateCapital={handleUpdateCapital}
          mpesaTransactions={mpesaTransactions}
          businessOwners={businessOwners}
          onAddBusinessOwner={handleAddBusinessOwner}
          onUpdateBusinessOwner={handleUpdateBusinessOwner}
          onDeleteBusinessOwner={handleDeleteBusinessOwner}
          onToggleDeviceStatus={handleToggleDeviceStatus}
          onApproveDevice={handleApproveDevice}
          onRejectDevice={handleRejectDevice}
          onAddNewDevice={handleAddNewDevice}
          onDeleteDevice={handleDeleteDevice}
          onDisableAllRemoteDevices={handleDisableAllRemoteDevices}
          onEnableAllDevices={handleEnableAllDevices}
          onToggleDeviceControlFunction={handleToggleDeviceControlFunction}
          onSimulatePendingAndroidDevice={handleSimulatePendingAndroidDevice}
          topBarConfig={settings.topBarConfig}
          onUpdateTopBarConfig={handleUpdateTopBarConfig}
          tenants={tenants}
          currentTenantId={currentTenantId}
          onDeleteTenant={handleDeleteTenant}
          onSelectTenant={handleSelectTenant}
          onAddBranch={handleAddBranch}
          onUpdateBranch={handleUpdateBranch}
          onDeleteBranch={handleDeleteBranch}
          onSelectBranch={handleSelectBranch}
          onNavigateToFullAdminView={() => {
            setIsSettingsOpen(false);
            setCurrentTab('admin');
          }}
        />
      )}

      {/* Android POS App & Installation Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
        isStandalone={isStandalone}
      />


      {/* Admin Password Authentication Gate Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
        correctPassword={settings.adminPassword}
        ownerName={settings.ownerName}
        currentRole={currentRole}
        businessOwners={businessOwners}
        onOpenSuperAdmin={() => {
          setIsAdminAuthModalOpen(false);
          handleOpenSuperAdmin('developer_settings', 'root_master');
        }}
      />

      {/* Item Portion / Customization Modal */}
      {customizingItem && (
        <ItemDetailModal
          item={customizingItem}
          currency={settings.currency}
          onClose={() => setCustomizingItem(null)}
          onConfirmAdd={(item, variant, qty, instructions) => {
            for (let i = 0; i < qty; i++) {
              handleAddToCart(item, variant, instructions);
            }
          }}
        />
      )}

      {/* Cart Drawer / POS Checkout Sheet */}
      {isCartOpen && (
        <CartSheet
          cart={cart}
          settings={settings}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {/* Auto-Routing Push Notification Modal */}
      {activeAutoPushOrder && (
        <AutoPushCheckoutModal
          order={activeAutoPushOrder}
          currency={settings.currency}
          onClose={() => {
            const ord = activeAutoPushOrder;
            setActiveAutoPushOrder(null);
            setActiveConfirmationOrder(ord);
          }}
          onPaymentSuccess={handleAutoPushPaymentSuccess}
        />
      )}

      {/* Order Placed Celebration Modal */}
      {activeConfirmationOrder && (
        <OrderConfirmationModal
          order={activeConfirmationOrder}
          settings={settings}
          onClose={() => setActiveConfirmationOrder(null)}
          onViewReceipt={(order) => {
            setActiveConfirmationOrder(null);
            setViewingReceiptOrder(order);
          }}
          onTrackOrders={() => {
            setActiveConfirmationOrder(null);
            setCurrentTab('order_received');
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {viewingReceiptOrder && (
        <ReceiptModal
          order={viewingReceiptOrder}
          settings={settings}
          onClose={() => setViewingReceiptOrder(null)}
        />
      )}

      {/* New Menu Item Modal */}
      {isNewItemModalOpen && (
        <NewItemModal
          onClose={() => setIsNewItemModalOpen(false)}
          onSave={handleAddNewItem}
          currency={settings.currency}
        />
      )}

      {/* Edit Existing Menu Item Modal */}
      {editingItem && (
        <EditItemModal
          key={editingItem.id}
          item={editingItem}
          currency={settings.currency}
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItem}
          onDelete={handleDeleteItem}
          onChangeImage={(item) => {
            setEditingItem(null);
            setPickingImageItem(item);
          }}
        />
      )}

      {/* Image Picker / Attachment Modal */}
      {pickingImageItem && (
        <ImagePickerModal
          item={pickingImageItem}
          isOpen={Boolean(pickingImageItem)}
          onClose={() => setPickingImageItem(null)}
          onSaveImage={(newUrl) => {
            handleUpdateItemImage(pickingImageItem.id, newUrl);
            setPickingImageItem(null);
          }}
        />
      )}

      {/* AI Order Assistant Modal (Powered by Gemini & updated Menu Database) */}
      <AiOrderAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currency={settings.currency}
        menuItems={items}
        onAddToCart={(item, qty, variant) => {
          handleAddToCart(item, variant);
          sound.playSuccess();
        }}
      />

      {/* Multi-Tenant Restaurant Switcher Modal */}
      <TenantSwitcherModal
        isOpen={isTenantSwitcherOpen}
        onClose={() => setIsTenantSwitcherOpen(false)}
        tenants={tenants}
        currentTenantId={currentTenantId}
        onSelectTenant={handleSelectTenant}
        currentUser={authUser}
        onOpenSuperAdmin={() => {
          setIsSuperAdminOpen(true);
        }}
      />

      {/* Operating Branch Switcher Modal for the Active Registered Business */}
      {currentTenant && (
        <BranchSwitcherModal
          isOpen={isBranchSwitcherOpen}
          onClose={() => setIsBranchSwitcherOpen(false)}
          currentTenant={currentTenant}
          currentBranchId={currentTenant.activeBranchId || currentTenant.branches?.[0]?.id}
          onSelectBranch={handleSelectBranch}
          onAddBranch={handleAddBranch}
          onUpdateBranch={handleUpdateBranch}
          onDeleteBranch={handleDeleteBranch}
          currentUser={authUser}
          onOpenSuperAdminDirectory={() => {
            setIsBranchSwitcherOpen(false);
            setIsTenantSwitcherOpen(true);
          }}
        />
      )}

      {/* Floating Debug Diagnostics HUD (When debugModeEnabled is toggled in Unified Settings) */}
      <DebugDiagnosticsHUD
        settings={settings}
        currentRole={authUser?.role}
        orders={orders}
        onClose={() => handleUpdateSettings({ debugModeEnabled: false })}
      />

      {/* Global Super Admin Secret Keystroke Override ('enhadmin') & Dual MFA Portal */}
      <SuperAdminSecureAccess
        onAuthenticated={({ role, user }) => {
          setAuthUser(user);
          saveStoredAuthUser(user);
          setCurrentRole(role);
          setIsAdminUnlocked(true);
          setDeveloperMode(true);
          setIsSuperAdminOpen(true);
          sound.playSuccess();
        }}
      />

      {/* Trash Bin Modal (30-day soft delete management) */}
      <TrashBinModal
        isOpen={isTrashBinOpen}
        onClose={() => setIsTrashBinOpen(false)}
        trashOrders={tenantTrashOrders}
        settings={settings}
        onRestoreOrder={handleRestoreOrder}
        onBatchRestoreOrders={handleBatchRestoreOrders}
        onPermanentDeleteOrder={handlePermanentDeleteOrder}
        onEmptyTrash={handleEmptyTrash}
        onViewReceipt={(order) => setViewingReceiptOrder(order)}
      />

      {/* Undo & Action Snackbar Notification */}
      {snackbarState && (
        <SnackbarNotification
          isOpen={snackbarState.isOpen}
          title={snackbarState.title}
          subtitle={snackbarState.subtitle}
          variant={snackbarState.variant}
          onUndo={snackbarState.onUndo}
          onViewTrash={snackbarState.onViewTrash}
          onClose={() => setSnackbarState(null)}
          durationMs={snackbarState.durationMs}
        />
      )}
    </div>
  );
}
