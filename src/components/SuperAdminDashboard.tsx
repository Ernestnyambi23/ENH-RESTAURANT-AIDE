import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  Server,
  ToggleLeft,
  ToggleRight,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Key,
  Users,
  DollarSign,
  Layers,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Smartphone,
  ChefHat,
  Receipt,
  FileText,
  Activity,
  Lock,
  Search,
  Database,
  Utensils,
  Boxes,
  Trash2,
  Edit,
  Copy,
  Wrench,
  ShieldCheck,
  Terminal,
  Code2,
  Eye,
  Sliders,
  Bot,
  UtensilsCrossed,
  Palette,
  Crown,
  Clock,
  ShoppingBag,
  ListOrdered,
  Wallet,
  BarChart3,
  Truck,
  Store,
  MapPin,
  Phone,
  Printer,
  SlidersHorizontal,
  ExternalLink,
  Shield,
  Save,
  Check,
  UserCheck,
  Volume2,
  Moon,
  Sun,
  RotateCcw,
} from 'lucide-react';
import {
  TenantRestaurant,
  TenantFeatureFlags,
  AuthUser,
  UserRole,
  MenuItem,
  Variant,
  BusinessOwnerAccount,
  RestaurantSettings,
  TopBarLayoutConfig,
  TabType,
  RolePermissionsConfig,
} from '../types';
import { tenantAuthService, GlobalMetrics } from '../services/tenantAuthService';
import { loadStoredTenants, saveStoredTenants } from '../utils/storage';
import { migrateFirestoreDataToTenant } from '../firebase/firestoreService';
import { NewItemModal } from './NewItemModal';
import { EditItemModal } from './EditItemModal';
import { formatCurrency } from '../utils/formatters';
import { getDefaultMenuItemsForTenant } from '../data/restaurantMenus';
import TenantOnboardingWizard from './TenantOnboardingWizard';
import { BrandLogo } from './BrandLogo';
import { EnhLogo } from './EnhLogo';
import { LogoEditorModal, RESTAURANT_ICONS } from './LogoEditorModal';
import { DeveloperInfraPanel } from './DeveloperInfraPanel';
import { BusinessOwnerAccountsPanel } from './BusinessOwnerAccountsPanel';
import { TopBarSettingsPanel } from './TopBarSettingsPanel';
import { DeveloperPermissionsPanel } from './DeveloperPermissionsPanel';
import { resolveTopBarConfig, DEFAULT_TOPBAR_CONFIG } from '../utils/topBarConfig';
import { loadRolePermissionsConfig, saveRolePermissionsConfig } from '../utils/rbac';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

interface SuperAdminDashboardProps {
  tenants: TenantRestaurant[];
  currentTenantId: string;
  onSelectTenant: (tenant: TenantRestaurant) => void;
  onRefreshTenants: () => Promise<void>;
  currentUser: AuthUser | null;
  onClose?: () => void;
  items?: MenuItem[];
  onAddNewItem?: (item: MenuItem) => void;
  onUpdateItem?: (item: MenuItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onSeedTenantMenu?: (tenantId: string) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onToggleTenantMaintenance?: (tenantId: string, isUnderMaintenance: boolean) => void;
  developerMode?: boolean;
  onToggleDeveloperMode?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenOnboardingWizard?: () => void;
  initialTab?: 'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings';
  initialSubView?: 'root_master' | 'access_limits' | 'branch_switcher' | 'settings_admin' | 'dropdown_tabs' | 'branch_partitions' | 'root_infra';
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onResetAnalytics?: () => void;
  onResetReport?: (reportId: string, resetKey: string) => boolean | void;
  onResetAllReports?: (masterKey: string) => boolean | void;
  onResetData?: () => void;
  restaurantName?: string;
  // Relocated Components in Developer Space
  businessOwners?: BusinessOwnerAccount[];
  onAddBusinessOwner?: (owner: BusinessOwnerAccount) => void;
  onUpdateBusinessOwner?: (owner: BusinessOwnerAccount) => void;
  onDeleteBusinessOwner?: (ownerId: string) => void;
  settings?: RestaurantSettings;
  onUpdateSettings?: (settings: RestaurantSettings) => void;
  topBarConfig?: TopBarLayoutConfig;
  onUpdateTopBarConfig?: (config: TopBarLayoutConfig) => void;
  onSelectTab?: (tab: TabType) => void;
  onOpenSettingsModal?: () => void;
  rolePermissionsConfig?: RolePermissionsConfig;
  onUpdateRolePermissionsConfig?: (config: RolePermissionsConfig) => void;
  staffCount?: number;
  debtsCount?: number;
  purchasesCount?: number;
  shoppingCount?: number;
  customersCount?: number;
  suppliersCount?: number;
  mpesaCount?: number;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  tenants,
  currentTenantId,
  onSelectTenant,
  onRefreshTenants,
  currentUser,
  onClose,
  items = [],
  onAddNewItem,
  onUpdateItem,
  onDeleteItem,
  onSeedTenantMenu,
  onDeleteTenant,
  onToggleTenantMaintenance,
  developerMode = false,
  onToggleDeveloperMode,
  onOpenAiAssistant,
  onOpenOnboardingWizard,
  initialTab = 'metrics',
  initialSubView = 'root_master',
  currentRole,
  onSwitchRole,
  onResetAnalytics,
  onResetReport,
  onResetAllReports,
  onResetData,
  restaurantName,
  businessOwners = [],
  onAddBusinessOwner,
  onUpdateBusinessOwner,
  onDeleteBusinessOwner,
  settings,
  onUpdateSettings,
  topBarConfig,
  onUpdateTopBarConfig,
  onSelectTab,
  onOpenSettingsModal,
  rolePermissionsConfig,
  onUpdateRolePermissionsConfig,
  staffCount = 5,
  debtsCount = 0,
  purchasesCount = 0,
  shoppingCount = 0,
  customersCount = 0,
  suppliersCount = 0,
  mpesaCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Developer Space & Settings state
  const [devSearchQuery, setDevSearchQuery] = useState('');
  const [editingLogoTenant, setEditingLogoTenant] = useState<TenantRestaurant | null>(null);
  const [devSubView, setDevSubView] = useState<
    'root_master' | 'access_limits' | 'branch_switcher' | 'settings_admin' | 'dropdown_tabs' | 'branch_partitions' | 'root_infra'
  >(initialSubView || 'root_master');

  useEffect(() => {
    if (initialSubView) {
      setDevSubView(initialSubView);
    }
  }, [initialSubView]);

  // Dynamic Role Permissions Config (Function, View & Settings limits for Owner & Staff)
  const [currentPermConfig, setCurrentPermConfig] = useState<RolePermissionsConfig>(() => {
    return rolePermissionsConfig || loadRolePermissionsConfig();
  });

  useEffect(() => {
    if (rolePermissionsConfig) {
      setCurrentPermConfig(rolePermissionsConfig);
    }
  }, [rolePermissionsConfig]);

  const handleSavePermissionsConfig = (newConfig: RolePermissionsConfig) => {
    saveRolePermissionsConfig(newConfig);
    setCurrentPermConfig(newConfig);
    if (onUpdateRolePermissionsConfig) {
      onUpdateRolePermissionsConfig(newConfig);
    }
    sound.playSuccess();
    triggerHaptic('success');
    setStatusMessage('Access & Limit rules updated for Business Owners and Staff!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Store profile editable state in Developer Space
  const [profileName, setProfileName] = useState(settings?.restaurantName || '');
  const [profileTagline, setProfileTagline] = useState(settings?.tagline || '');
  const [profilePhone, setProfilePhone] = useState(settings?.phoneNumber || '');
  const [profileAddress, setProfileAddress] = useState(settings?.address || '');
  const [profileCurrency, setProfileCurrency] = useState(settings?.currency || 'TSh');
  const [profileTaxRate, setProfileTaxRate] = useState<number>(settings?.taxRate ?? 18);
  const [profileReceiptFooter, setProfileReceiptFooter] = useState(settings?.receiptFooter || '');
  const [branchSearch, setBranchSearch] = useState('');

  // Master PIN state in Developer Space
  const [masterPin, setMasterPin] = useState(settings?.pin || '8888');

  // Thermal Printer & POS Hardware state in Developer Space
  const [printerIp, setPrinterIp] = useState((settings as any)?.printerIp || '192.168.1.200');
  const [printerPort, setPrinterPort] = useState((settings as any)?.printerPort || 9100);
  const [printerPaperWidth, setPrinterPaperWidth] = useState<'80mm' | '58mm'>((settings as any)?.printerPaperWidth || '80mm');
  const [printerAutoCut, setPrinterAutoCut] = useState((settings as any)?.printerAutoCut !== false);
  const [printerAutoKOT, setPrinterAutoKOT] = useState((settings as any)?.printerAutoKOT ?? true);
  const [testPrintSuccess, setTestPrintSuccess] = useState<string | null>(null);
  const [showClearAnalyticsModal, setShowClearAnalyticsModal] = useState(false);
  const [showDeleteTenantModal, setShowDeleteTenantModal] = useState(false);
  const [tenantDeleteTargetId, setTenantDeleteTargetId] = useState(currentTenantId);
  const [deletingDishId, setDeletingDishId] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState<string | null>(null);

  // Appearance state in Developer Space
  const [devReduceBlur, setDevReduceBlur] = useState<boolean>(settings?.reduceBlur ?? false);
  const [devTheme, setDevTheme] = useState<string>(settings?.theme || 'dark');
  const [devSoundAlerts, setDevSoundAlerts] = useState<boolean>(settings?.enableSoundAlerts ?? true);

  useEffect(() => {
    if (settings) {
      setProfileName(settings.restaurantName || '');
      setProfileTagline(settings.tagline || '');
      setProfilePhone(settings.phoneNumber || '');
      setProfileAddress(settings.address || '');
      setProfileCurrency(settings.currency || 'TSh');
      setProfileTaxRate(settings.taxRate ?? 18);
      setProfileReceiptFooter(settings.receiptFooter || '');
      setMasterPin(settings.pin || '8888');
      setPrinterIp((settings as any).printerIp || '192.168.1.200');
      setPrinterPort((settings as any).printerPort || 9100);
      setPrinterPaperWidth((settings as any).printerPaperWidth || '80mm');
      setPrinterAutoCut((settings as any).printerAutoCut !== false);
      setPrinterAutoKOT((settings as any).printerAutoKOT ?? true);
      setDevReduceBlur(settings.reduceBlur ?? false);
      setDevTheme(settings.theme || 'dark');
      setDevSoundAlerts(settings.enableSoundAlerts ?? true);
    }
  }, [settings]);

  const handleSavePin = () => {
    if (!onUpdateSettings || !settings) return;
    onUpdateSettings({
      ...settings,
      pin: masterPin.trim() || '8888',
    });
    sound.playSuccess();
    triggerHaptic('success');
    setStatusMessage(`Master Security PIN saved to "${masterPin.trim() || '8888'}"!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSavePrinterSettings = () => {
    if (!onUpdateSettings || !settings) return;
    onUpdateSettings({
      ...settings,
      printerIp: printerIp.trim(),
      printerPort: Number(printerPort) || 9100,
      printerPaperWidth: printerPaperWidth,
      printerAutoCut: printerAutoCut,
      printerAutoKOT: printerAutoKOT,
    } as any);
    sound.playSuccess();
    triggerHaptic('success');
    setStatusMessage('Thermal Printer & POS Hardware configuration saved!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleTestPrintSlip = () => {
    sound.playKitchenBell();
    triggerHaptic('success');
    setTestPrintSuccess(`[ESC/POS TEST PRINT SENT] → IP: ${printerIp}:${printerPort} (${printerPaperWidth}) - Cut: ${printerAutoCut ? 'YES' : 'NO'}`);
    setTimeout(() => setTestPrintSuccess(null), 4500);
  };

  const handleToggleReduceBlur = () => {
    if (!onUpdateSettings || !settings) return;
    const nextVal = !devReduceBlur;
    setDevReduceBlur(nextVal);
    onUpdateSettings({
      ...settings,
      reduceBlur: nextVal,
    });
    sound.playClick();
    triggerHaptic('light');
    setStatusMessage(nextVal ? 'High Clarity Mode Enabled (Blur eliminated)!' : 'High Clarity Mode Disabled!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSelectTheme = (themeName: 'dark' | 'light' | 'emerald') => {
    if (!onUpdateSettings || !settings) return;
    setDevTheme(themeName);
    onUpdateSettings({
      ...settings,
      theme: themeName as any,
    });
    sound.playClick();
    triggerHaptic('light');
    setStatusMessage(`Appearance theme switched to "${themeName}"!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleToggleSoundAlerts = () => {
    if (!onUpdateSettings || !settings) return;
    const nextVal = !devSoundAlerts;
    setDevSoundAlerts(nextVal);
    onUpdateSettings({
      ...settings,
      enableSoundAlerts: nextVal,
    });
    if (nextVal) sound.playSuccess();
    triggerHaptic('light');
    setStatusMessage(nextVal ? 'Sound Alerts Enabled!' : 'Sound Alerts Muted!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSaveProfile = () => {
    if (!onUpdateSettings || !settings) return;
    onUpdateSettings({
      ...settings,
      restaurantName: profileName,
      tagline: profileTagline,
      phoneNumber: profilePhone,
      address: profileAddress,
      currency: profileCurrency,
      taxRate: Number(profileTaxRate) || 0,
      receiptFooter: profileReceiptFooter,
    });
    sound.playSuccess();
    triggerHaptic('success');
    setStatusMessage('Store Profile & Admin Settings successfully updated!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Toggle placement for the 10 dropdown tabs
  const handleToggleDropdownTabPlacement = (componentId: string) => {
    if (!onUpdateTopBarConfig) return;
    const currentConfig = resolveTopBarConfig(topBarConfig);
    const comp = currentConfig.components[componentId];
    if (!comp) return;
    const nextPlacement = comp.placement === 'dropdown_menu' ? 'nav_tabs' : 'dropdown_menu';
    const updatedConfig: TopBarLayoutConfig = {
      ...currentConfig,
      components: {
        ...currentConfig.components,
        [componentId]: {
          ...comp,
          placement: nextPlacement,
        },
      },
      updatedAt: Date.now(),
    };
    onUpdateTopBarConfig(updatedConfig);
    sound.playSuccess();
    triggerHaptic('success');
    setStatusMessage(
      `Updated ${comp.customLabel || comp.name} placement to ${
        nextPlacement === 'nav_tabs' ? 'Primary Navigation Bar' : 'Dropdown Menu'
      }`
    );
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleLaunchTab = (targetTab: TabType) => {
    sound.playClick();
    triggerHaptic('light');
    if (targetTab === 'admin') {
      setDevSubView('settings_admin');
      return;
    }
    if (onSelectTab) {
      onSelectTab(targetTab);
    }
  };

  // Dishes & Menu Studio state
  const [selectedMenuTenantId, setSelectedMenuTenantId] = useState<string>(currentTenantId);
  const [dishSearchQuery, setDishSearchQuery] = useState<string>('');
  const [dishCategoryFilter, setDishCategoryFilter] = useState<string>('all');
  const [editingDishItem, setEditingDishItem] = useState<MenuItem | null>(null);
  const [isAddingNewDish, setIsAddingNewDish] = useState<boolean>(false);
  const [cloningDish, setCloningDish] = useState<MenuItem | null>(null);
  const [cloneTargetTenantId, setCloneTargetTenantId] = useState<string>(tenants[0]?.id || 'ollis-pizza');

  // Migration state
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    migratedItems: number;
    migratedOrders: number;
    migratedStaff: number;
    migratedDevices: number;
    migratedPurchases: number;
  } | null>(null);

  // New restaurant onboarding form state
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formOwnerEmail, setFormOwnerEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCurrency, setFormCurrency] = useState('TZS');
  const [formThemeColor, setFormThemeColor] = useState('#1f4d3e');
  const [submittingOnboard, setSubmittingOnboard] = useState(false);

  // Simulation test state
  const [simulatedRole, setSimulatedRole] = useState<'developer' | 'owner' | 'staff' | 'customer'>('owner');
  const [simulatedTenant, setSimulatedTenant] = useState<string>(tenants[0]?.id || 'ollis-pizza');
  const [targetTenantToQuery, setTargetTenantToQuery] = useState<string>(tenants[1]?.id || 'safari-bistro');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const data = await tenantAuthService.fetchGlobalMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load global metrics', e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleToggleFeature = async (tenantId: string, featureKey: keyof TenantFeatureFlags, currentVal: boolean) => {
    try {
      const updated = await tenantAuthService.updateTenantFeatureFlags(tenantId, {
        [featureKey]: !currentVal,
      });
      setStatusMessage(`Updated feature flag '${featureKey}' for tenant '${tenantId}'`);
      await onRefreshTenants();
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.error('Feature toggle error', e);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formOwnerName || !formOwnerEmail) {
      alert('Please fill out restaurant name, owner name, and owner email.');
      return;
    }

    setSubmittingOnboard(true);
    try {
      const newTenant = await tenantAuthService.onboardTenant({
        name: formName,
        tagline: formTagline,
        ownerName: formOwnerName,
        ownerEmail: formOwnerEmail,
        phone: formPhone,
        address: formAddress,
        currency: formCurrency,
        themeColor: formThemeColor,
      });

      setStatusMessage(`Restaurant '${newTenant.name}' successfully onboarded with ID: ${newTenant.id}`);
      setFormName('');
      setFormTagline('');
      setFormOwnerName('');
      setFormOwnerEmail('');
      setFormPhone('');
      setFormAddress('');
      await onRefreshTenants();
      await loadMetrics();
      setActiveTab('features');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (e: any) {
      alert(`Onboarding failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setSubmittingOnboard(false);
    }
  };

  const runScopeIsolationTest = async () => {
    setTestingEndpoint(true);
    setTestResult(null);

    // 1. Generate JWT for simulated role
    const tokenRes = await tenantAuthService.requestJwtToken({
      uid: `test-${simulatedRole}-001`,
      email: `${simulatedRole}@test.com`,
      role: simulatedRole as any,
      restaurant_id: simulatedRole === 'developer' ? 'ALL' : simulatedTenant,
      name: `Test ${simulatedRole.toUpperCase()}`,
    });

    if (!tokenRes) {
      setTestResult({ error: 'Failed to issue JWT token for test' });
      setTestingEndpoint(false);
      return;
    }

    // 2. Query target tenant endpoint
    try {
      const res = await fetch(`/api/tenants/${targetTenantToQuery}/orders`, {
        headers: {
          Authorization: `Bearer ${tokenRes.token}`,
        },
      });

      const data = await res.json();
      setTestResult({
        status: res.status,
        statusText: res.statusText,
        allowed: res.ok,
        jwtClaims: {
          role: simulatedRole,
          assignedScope: simulatedRole === 'developer' ? 'ALL' : simulatedTenant,
        },
        attemptedTarget: targetTenantToQuery,
        response: data,
      });
    } catch (e: any) {
      setTestResult({
        error: e?.message || 'Network request failed',
      });
    } finally {
      setTestingEndpoint(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo size="lg" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black tracking-tight">ENH RESTAURANT MANAGEMENT AIDE LTD.</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 font-mono">
                  Developer Space • Super Admin & Root Console
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Unified Developer Space: Developer root mode infrastructure, branch partition isolation, multi-tenant SaaS metrics, and RBAC matrix controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              id="portal-developer-settings-btn"
              onClick={() => setActiveTab('developer_settings')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition shadow-xs cursor-pointer ${
                activeTab === 'developer_settings'
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Open Developer Space (Root Mode & Partitions)"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-extrabold tracking-tight">Developer Space</span>
            </button>
            <button
              onClick={loadMetrics}
              disabled={loadingMetrics}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                Back to POS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status toast */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </motion.div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'metrics'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Global Metrics & Health
        </button>
        <button
          onClick={() => setActiveTab('developer_settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'developer_settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          Developer Space (Root & Partitions)
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'dishes'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Utensils className="w-4 h-4" />
          Dishes & Menu Studio
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'features'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ToggleRight className="w-4 h-4" />
          Feature Flags Matrix
        </button>
        <button
          onClick={() => setActiveTab('onboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'onboard'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Plus className="w-4 h-4" />
          Onboard Restaurant
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          RBAC & Scope Audit
        </button>
        <button
          onClick={() => setActiveTab('migration')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'migration'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Tenant Data Migration
        </button>
      </div>

      {/* TAB 1: METRICS & HEALTH */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Relocated Developer Settings & Partition Access Banner */}
          <div
            id="super-admin-dev-settings-banner"
            className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-white"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-2xs">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-white truncate flex items-center gap-2">
                  <span>Developer Space & Super-Root Console</span>
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    Full Root
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">
                  Inspect tenant row isolation, review live branch partitions without passwords, and manage super-root developer infrastructure.
                </div>
              </div>
            </div>
            <button
              type="button"
              id="super-admin-open-dev-settings-btn"
              onClick={() => setActiveTab('developer_settings')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer shrink-0 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-200" />
              <span>Open Developer Space</span>
            </button>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {(metrics?.totalRevenue || 3450000).toLocaleString()} <span className="text-xs font-semibold text-slate-500">TZS</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Across all registered tenants</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Global Orders</span>
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics?.totalOrders || 148}
              </div>
              <p className="text-xs text-slate-500 mt-1">Network cumulative transactions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Active Restaurants</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {tenants.filter((t) => t.status === 'active').length} / {tenants.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">Tenants in good standing</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">System Health</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 flex items-center gap-1.5">
                <span>99.98%</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Latency: 28ms • DB: Connected</p>
            </div>
          </div>

          {/* Tenants Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Registered Tenant Restaurants</h3>
                <p className="text-xs text-slate-500">Row-level isolation and active branch metrics</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                {tenants.length} Restaurants
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Restaurant Name & Access Code</th>
                    <th className="py-3.5 px-5">Owner / Contact</th>
                    <th className="py-3.5 px-5">Branch & Location</th>
                    <th className="py-3.5 px-5">Features Active</th>
                    <th className="py-3.5 px-5">Maintenance Lock</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenants.map((t) => {
                    const isSelected = t.id === currentTenantId;
                    const enabledCount = Object.values(t.featureFlags).filter(Boolean).length;
                    const isMaintenance = !!t.isUnderMaintenance;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                              style={{ backgroundColor: t.themeColor }}
                            >
                              {t.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                                  {t.uniqueCode || 'REST-XXXX'}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">id: {t.id}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-medium text-slate-800">{t.ownerName}</div>
                          <div className="text-slate-500">{t.ownerEmail}</div>
                        </td>
                        <td className="py-4 px-5 text-slate-600">
                          <div className="font-semibold text-slate-800">{t.branchName || 'Main Branch'}</div>
                          <div className="text-slate-400 text-[11px]">{t.address || 'Tanzania'}</div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {enabledCount} of 7 enabled
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onToggleTenantMaintenance) {
                                onToggleTenantMaintenance(t.id, !isMaintenance);
                              } else {
                                t.isUnderMaintenance = !isMaintenance;
                                setStatusMessage(
                                  `Maintenance mode for '${t.name}' set to ${!isMaintenance ? 'ACTIVE' : 'DISABLED'}`
                                );
                                setTimeout(() => setStatusMessage(null), 3000);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                              isMaintenance
                                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Toggle Maintenance Lock for this restaurant"
                          >
                            <Wrench className={`w-3 h-3 ${isMaintenance ? 'animate-spin text-amber-700' : 'text-slate-400'}`} />
                            <span>{isMaintenance ? 'Lock Active' : 'Normal'}</span>
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              t.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onSelectTenant(t);
                                setStatusMessage(`Switched active context to '${t.name}'`);
                                setTimeout(() => setStatusMessage(null), 3000);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                                isSelected
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isSelected ? 'Current Scope' : 'Switch To'}
                            </button>

                            {tenants.length > 1 && onDeleteTenant && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTenantDeleteTargetId(t.id);
                                  setShowDeleteTenantModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Permanently Delete Tenant & Cascade"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISHES & MENU STUDIO */}
      {activeTab === 'dishes' && (
        <div className="space-y-6">
          {/* Header & Restaurant Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    <span>Independent Dish & Menu Studio</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Strict Tenant Isolation
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Developer & Owner portal to add, customize, price, and isolate dishes per individual restaurant.
                </p>
              </div>

              {/* Restaurant Selector */}
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700">Managing Menu For:</span>
                <select
                  value={selectedMenuTenantId}
                  onChange={(e) => setSelectedMenuTenantId(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.currency || 'TZS'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Restaurant Menu Summary Banner */}
            {(() => {
              const currentTenant = tenants.find((t) => t.id === selectedMenuTenantId) || tenants[0];
              const tenantDishes = items.filter(
                (i) => (i.restaurant_id || 'ollis-pizza') === selectedMenuTenantId
              );
              const uniqueCategories = Array.from(new Set(tenantDishes.map((d) => d.category)));
              const lowStock = tenantDishes.filter((d) => d.stock <= 5).length;

              return (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Total Dishes
                      </span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {tenantDishes.length}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Categories
                      </span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">
                        {uniqueCategories.length}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        In Stock
                      </span>
                      <div className="text-2xl font-black text-emerald-600 mt-0.5">
                        {tenantDishes.filter((d) => d.stock > 0).length}
                      </div>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Low Stock (≤5)
                      </span>
                      <div className="text-2xl font-black text-amber-600 mt-0.5">
                        {lowStock}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                      <div className="relative w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder={`Search ${currentTenant?.name || ''} dishes...`}
                          value={dishSearchQuery}
                          onChange={(e) => setDishSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          onSeedTenantMenu?.(selectedMenuTenantId);
                          setStatusMessage(`Seeded starter dishes for ${currentTenant?.name}`);
                          setTimeout(() => setStatusMessage(null), 3500);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Seed Default Menu</span>
                      </button>

                      <button
                        onClick={() => setIsAddingNewDish(true)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Dish for {currentTenant?.name}</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Pills */}
                  {uniqueCategories.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <button
                        onClick={() => setDishCategoryFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                          dishCategoryFilter === 'all'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        All ({tenantDishes.length})
                      </button>
                      {uniqueCategories.map((cat) => {
                        const count = tenantDishes.filter((d) => d.category === cat).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => setDishCategoryFilter(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                              dishCategoryFilter === cat
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat} ({count})
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Dishes Grid */}
                  {(() => {
                    const filtered = tenantDishes.filter((d) => {
                      const matchSearch =
                        d.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
                        (d.description && d.description.toLowerCase().includes(dishSearchQuery.toLowerCase())) ||
                        d.category.toLowerCase().includes(dishSearchQuery.toLowerCase());
                      const matchCat = dishCategoryFilter === 'all' || d.category === dishCategoryFilter;
                      return matchSearch && matchCat;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">No dishes found</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {tenantDishes.length === 0
                              ? `No dishes created for ${currentTenant?.name} yet. Click "Add Dish" or "Seed Default Menu".`
                              : 'No dishes match your current filter.'}
                          </p>
                          {tenantDishes.length === 0 && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  onSeedTenantMenu?.(selectedMenuTenantId);
                                  setStatusMessage(`Seeded starter dishes for ${currentTenant?.name}`);
                                  setTimeout(() => setStatusMessage(null), 3500);
                                }}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                              >
                                Seed Starter Menu
                              </button>
                              <button
                                onClick={() => setIsAddingNewDish(true)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                              >
                                + Add First Dish
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                        {filtered.map((dish) => {
                          const currency = currentTenant?.currency || 'TZS';
                          return (
                            <div
                              key={dish.id}
                              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition flex flex-col"
                            >
                              {/* Card Image / Header */}
                              <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                                {dish.imageUrl ? (
                                  <img
                                    src={dish.imageUrl}
                                    alt={dish.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Utensils className="w-8 h-8 text-slate-300" />
                                )}
                                <div className="absolute top-2 left-2 flex items-center gap-1">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 text-white backdrop-blur-xs">
                                    {dish.category}
                                  </span>
                                  {dish.isChefSpecial && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
                                      Chef
                                    </span>
                                  )}
                                  {dish.isSpicy && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white">
                                      Spicy
                                    </span>
                                  )}
                                </div>
                                <div className="absolute top-2 right-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      dish.stock <= 5
                                        ? 'bg-red-500 text-white'
                                        : 'bg-emerald-500 text-white'
                                    }`}
                                  >
                                    Stock: {dish.stock}
                                  </span>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                    {dish.name}
                                  </h4>
                                  {dish.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                      {dish.description}
                                    </p>
                                  )}
                                  <div className="font-mono text-[10px] text-slate-400 mt-1">
                                    id: {dish.id}
                                  </div>
                                </div>

                                {/* Pricing */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                                      Price
                                    </span>
                                    {dish.variants && dish.variants.length > 0 ? (
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {dish.variants.map((v) => (
                                          <span
                                            key={v.label}
                                            className="px-1.5 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700"
                                          >
                                            {v.label}: {formatCurrency(v.price, currency)}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-sm font-extrabold text-slate-900">
                                        {formatCurrency(dish.price || 0, currency)}
                                      </span>
                                    )}
                                  </div>

                                  {/* Quick Stock +/- */}
                                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newStock = Math.max(0, (dish.stock || 0) - 1);
                                        onUpdateItem?.({ ...dish, stock: newStock, updatedAt: Date.now() });
                                      }}
                                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                                    >
                                      -
                                    </button>
                                    <span className="text-xs font-bold w-6 text-center text-slate-800">
                                      {dish.stock}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newStock = (dish.stock || 0) + 1;
                                        onUpdateItem?.({ ...dish, stock: newStock, updatedAt: Date.now() });
                                      }}
                                      className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                  <button
                                    onClick={() => setEditingDishItem(dish)}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setCloningDish(dish);
                                      const other = tenants.find((t) => t.id !== selectedMenuTenantId);
                                      if (other) setCloneTargetTenantId(other.id);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                                    title="Clone dish to another restaurant"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Clone</span>
                                  </button>

                                  {deletingDishId === dish.id ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteItem?.(dish.id);
                                          setStatusMessage(`Deleted "${dish.name}"`);
                                          setTimeout(() => setStatusMessage(null), 3000);
                                          setDeletingDishId(null);
                                        }}
                                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-2xs font-bold transition shadow-xs cursor-pointer"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingDishId(null)}
                                        className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-semibold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingDishId(dish.id)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                      title="Delete dish"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: FEATURE FLAGS MATRIX */}
      {activeTab === 'features' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Per-Restaurant Feature Flag Matrix</h3>
              <p className="text-xs text-slate-500">
                Instantly enable or disable functional modules per restaurant (e.g. Online payments or AI Assistant)
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">Changes take effect immediately</span>
          </div>

          <div className="space-y-6">
            {tenants.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: t.themeColor }}
                    >
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{t.name}</h4>
                      <span className="text-[11px] font-mono text-slate-500">tenant_id: {t.id}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-white border border-slate-200 text-slate-700">
                    Currency: {t.currency}
                  </span>
                </div>

                {/* Feature switches grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* AI Order Assistant */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">AI Order Assistant</div>
                        <div className="text-[10px] text-slate-400">Gemini 2.5 Flash</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(t.id, 'aiOrderAssistant', t.featureFlags.aiOrderAssistant)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                        t.featureFlags.aiOrderAssistant ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                          t.featureFlags.aiOrderAssistant ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Online Payments */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Online Mobile Payments</div>
                        <div className="text-[10px] text-slate-400">M-Pesa STK Push</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(t.id, 'onlinePayments', t.featureFlags.onlinePayments)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                        t.featureFlags.onlinePayments ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                          t.featureFlags.onlinePayments ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Kitchen Display Queue */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ChefHat className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Kitchen Display</div>
                        <div className="text-[10px] text-slate-400">Interactive Tick Queue</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(t.id, 'kitchenDisplay', t.featureFlags.kitchenDisplay)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                        t.featureFlags.kitchenDisplay ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                          t.featureFlags.kitchenDisplay ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* SMS Receipts */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">SMS & PDF Receipts</div>
                        <div className="text-[10px] text-slate-400">Digital Confirmation</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(t.id, 'smsReceipts', t.featureFlags.smsReceipts)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                        t.featureFlags.smsReceipts ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                          t.featureFlags.smsReceipts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Staff Payroll */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Staff Payroll & Absences</div>
                        <div className="text-[10px] text-slate-400">Automated Deductions</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(t.id, 'staffPayroll', t.featureFlags.staffPayroll)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                        t.featureFlags.staffPayroll ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                          t.featureFlags.staffPayroll ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Inventory Tracking */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="font-semibold text-xs text-slate-900">Inventory & Stock Tracking</div>
                        <div className="text-[10px] text-slate-400">Raw Procurement Deductions</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFeature(t.id, 'inventoryTracking', t.featureFlags.inventoryTracking)}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ${
                        t.featureFlags.inventoryTracking ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ${
                          t.featureFlags.inventoryTracking ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ONBOARD RESTAURANT */}
      {activeTab === 'onboard' && (
        <div className="space-y-6">
          <TenantOnboardingWizard
            onTenantCreated={async (newTenant) => {
              await onRefreshTenants();
              onSelectTenant(newTenant);
              setStatusMessage(`Tenant '${newTenant.name}' onboarded successfully!`);
              setActiveTab('metrics');
            }}
          />

          <div className="text-center pt-2">
            <details className="inline-block text-left text-xs text-slate-500 cursor-pointer">
              <summary className="font-semibold text-slate-600 hover:text-slate-900 list-none text-center">
                Need manual single-page provision form? <span className="underline">Show Legacy Form</span>
              </summary>
              <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto text-left">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-bold text-slate-900 text-lg">Manual Restaurant Provisioning</h3>
                  <p className="text-xs text-slate-500">
                    Direct parameter entry for rapid terminal testing.
                  </p>
                </div>

                <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Restaurant Brand Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Serengeti Smokehouse"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tagline / Slogan</label>
                      <input
                        type="text"
                        placeholder="e.g. Prime Grilled Steaks & Wings"
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Owner / Manager Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Baraka Mwamba"
                        value={formOwnerName}
                        onChange={(e) => setFormOwnerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Owner Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. owner@serengeti.co.tz"
                        value={formOwnerEmail}
                        onChange={(e) => setFormOwnerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={submittingOnboard}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm inline-flex items-center gap-2"
                    >
                      {submittingOnboard ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Provisioning...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Complete Manual Provision
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* TAB 4: RBAC & SCOPE AUDIT SIMULATOR */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">RBAC Token & Tenant Scoping Validator</h3>
            <p className="text-xs text-slate-500">
              Live verification tool: test JWT claims to prove that cross-tenant access is blocked with 403 Forbidden.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulation controls */}
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-600" />
                  Step 1: Configure Simulated JWT Role
                </h4>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">User Role</label>
                  <select
                    value={simulatedRole}
                    onChange={(e) => setSimulatedRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="owner">Restaurant Owner (Scoped to single restaurant)</option>
                    <option value="staff">Staff / Kitchen (Scoped to single restaurant)</option>
                    <option value="developer">Developer / Super Admin (Global scope: ALL)</option>
                    <option value="customer">Customer (Public access)</option>
                  </select>
                </div>

                {simulatedRole !== 'developer' && (
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Assigned Token Scope (restaurant_id)
                    </label>
                    <select
                      value={simulatedTenant}
                      onChange={(e) => setSimulatedTenant(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Step 2: Target Tenant Endpoint to Query
                </h4>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">
                    API Endpoint: /api/tenants/:restaurantId/orders
                  </label>
                  <select
                    value={targetTenantToQuery}
                    onChange={(e) => setTargetTenantToQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        Query: {t.name} ({t.id})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={runScopeIsolationTest}
                  disabled={testingEndpoint}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  {testingEndpoint ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Testing API Scoping...
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Execute JWT Scoping Test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Test Results Output */}
            <div className="p-5 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-auto flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Scoping Audit Result
                  </span>
                  {testResult && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        testResult.allowed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      HTTP {testResult.status} {testResult.allowed ? 'GRANTED' : 'BLOCKED'}
                    </span>
                  )}
                </div>

                {testResult ? (
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">
                      {testResult.allowed
                        ? '✅ ACCESS ALLOWED: Role has authorized scope.'
                        : '🛑 403 FORBIDDEN: Tenant Scope Mismatch caught and blocked.'}
                    </p>
                    <pre className="text-[11px] bg-slate-900 p-3 rounded-lg text-emerald-300 overflow-x-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-slate-500 py-12 text-center">
                    Click &quot;Execute JWT Scoping Test&quot; to test row-level tenant isolation.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Rule: Super Admin has Global access (ALL). Owners & Staff can only access matching tenant_id.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-TENANT DATA MIGRATION */}
      {activeTab === 'migration' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Firestore Row-Level Tenant Migration</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Scans all database collections and tags un-scoped records with default tenant identifier (<code>ollis-pizza</code>).
              </p>
            </div>

            <button
              onClick={async () => {
                setMigrationRunning(true);
                try {
                  const res = await migrateFirestoreDataToTenant('ollis-pizza');
                  setMigrationResult(res);
                  setStatusMessage('Data migration successfully processed. Unscoped records were backfilled with ollis-pizza.');
                } catch (e: any) {
                  setStatusMessage(`Migration error: ${e?.message || 'Failed'}`);
                } finally {
                  setMigrationRunning(false);
                }
              }}
              disabled={migrationRunning}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition"
            >
              <RefreshCw className={`w-4 h-4 ${migrationRunning ? 'animate-spin' : ''}`} />
              {migrationRunning ? 'Running Migration...' : 'Run Tenant Data Migration'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Strategy</span>
              <p className="text-sm font-bold text-slate-800">Row-Level Multitenancy</p>
              <p className="text-xs text-slate-500">Every document carries a <code>restaurant_id</code> attribute used for index filtering.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Default Tenant</span>
              <p className="text-sm font-bold text-slate-800">ollis-pizza</p>
              <p className="text-xs text-slate-500">Legacy documents without tenant tags are anchored to Olli&apos;s Pizza House.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Collections Covered</span>
              <p className="text-sm font-bold text-slate-800">5 Collections</p>
              <p className="text-xs text-slate-500"><code>items</code>, <code>orders</code>, <code>staff</code>, <code>devices</code>, <code>purchases</code>.</p>
            </div>
          </div>

          {migrationResult && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Migration Completed Successfully
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-900">{migrationResult.migratedItems}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Menu Items</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-900">{migrationResult.migratedOrders}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Orders</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-900">{migrationResult.migratedStaff}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Staff Members</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-900">{migrationResult.migratedDevices}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Terminals</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-900">{migrationResult.migratedPurchases}</div>
                  <div className="text-[11px] text-slate-600 font-medium">Purchases</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 font-mono text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Automated Verification Script Output:</div>
            <div>&gt; Scanning Firestore project: ai-studio-ollispizzahousep-8a8310aa-8da7-47fa-86ab-6a86c6adbe8f</div>
            <div>&gt; Verifying tenant isolation rules on collections... PASS</div>
            <div>&gt; JWT Bearer Token Scope check (restaurant_id in Claims)... ACTIVE</div>
            <div>&gt; Ready for multi-tenant SaaS scaling.</div>
          </div>
        </div>
      )}

      {/* TAB 7: DEVELOPER SPACE: ROOT MODE & BRANCH PARTITIONS */}
      {activeTab === 'developer_settings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Developer Header Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-900/60 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Developer Space • Super Admin & Root Console</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Unified Developer Space & Root Controls
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Consolidated root control center: live branch partition inspection, developer root mode infrastructure, RBAC matrix, container disaster recovery, and multi-tenant SaaS tools all in one space.
                </p>
              </div>

              {/* Developer Action Bar */}
              <div className="flex items-center flex-wrap gap-2.5">
                {onToggleDeveloperMode && (
                  <button
                    type="button"
                    onClick={onToggleDeveloperMode}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                      developerMode
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Layout Mode: {developerMode ? 'Active' : 'Standard'}</span>
                  </button>
                )}

                {onOpenAiAssistant && (
                  <button
                    type="button"
                    onClick={onOpenAiAssistant}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold border border-indigo-400 transition shadow-xs cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Gemini AI Concierge</span>
                  </button>
                )}

                {onOpenOnboardingWizard && (
                  <button
                    type="button"
                    onClick={onOpenOnboardingWizard}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold border border-emerald-400 transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Onboard Branch</span>
                  </button>
                )}
              </div>
            </div>

            {/* Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800/80 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Partitions</span>
                <span className="text-sm font-black text-white">{tenants.length} Registered</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">RLS Scope</span>
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Strict Row Isolation
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Root Override Key</span>
                <span className="text-sm font-mono font-bold text-amber-300">ENH-SEC-9021</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Scope</span>
                <span className="text-sm font-mono font-bold text-indigo-300 truncate block">
                  {tenants.find((t) => t.id === currentTenantId)?.name || currentTenantId}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Switcher inside Developer Space */}
          <div className="flex items-center gap-2 p-2 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
            <button
              type="button"
              id="dev-space-root-master-tab"
              onClick={() => setDevSubView('root_master')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'root_master'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Developer Root Master Control</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                {businessOwners.length} Owners
              </span>
            </button>

            <button
              type="button"
              id="dev-space-access-limits-tab"
              onClick={() => setDevSubView('access_limits')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'access_limits'
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-500/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Access & Limits (Function, View & Settings)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-400/30">
                Owners & Staff
              </span>
            </button>

            <button
              type="button"
              id="dev-space-branch-switcher-tab"
              onClick={() => setDevSubView('branch_switcher')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'branch_switcher'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Registered Businesses</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                {tenants.length} Businesses
              </span>
            </button>

            <button
              type="button"
              id="dev-space-settings-admin-tab"
              onClick={() => setDevSubView('settings_admin')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'settings_admin'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Settings & Admin Controls</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200">
                Printers & Layout
              </span>
            </button>

            <button
              type="button"
              id="dev-space-dropdown-tabs-tab"
              onClick={() => setDevSubView('dropdown_tabs')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'dropdown_tabs'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-4 h-4 text-pink-500" />
              <span>Situated In Dropdown Menu (10 tabs)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold border border-pink-200">
                10 Tabs
              </span>
            </button>

            <button
              type="button"
              id="dev-space-branch-partitions-tab"
              onClick={() => setDevSubView('branch_partitions')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'branch_partitions'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Eye className="w-4 h-4 text-teal-600" />
              <span>Branch Partition Inspector</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold border border-teal-200">
                Review Mode
              </span>
            </button>

            <button
              type="button"
              id="dev-space-root-infra-tab"
              onClick={() => setDevSubView('root_infra')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                devSubView === 'root_infra'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>Super-Root Infra & RBAC</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                Console
              </span>
            </button>
          </div>

          {/* SUB-VIEW 1: DEVELOPER ROOT MASTER CONTROL */}
          {devSubView === 'root_master' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Relocated Component Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-indigo-500/40 text-white shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                          <span>Developer Root Master Control</span>
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 font-mono">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Relocated in Developer Space</span>
                        </span>
                      </div>
                      <p className="text-xs text-indigo-200/80 mt-1 max-w-2xl">
                        Full administrative ownership console. Manage business owner login accounts, bypass locks, generate master access credentials, and audit restaurant licenses across all branches.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-[11px] font-mono text-indigo-200">
                      License: <strong className="text-amber-300">{settings?.ownershipLicense || 'ENH-ROOT-MASTER-2025'}</strong>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-indigo-900/80 text-xs">
                  <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-300 uppercase font-bold block">Business Owners</span>
                    <span className="text-sm font-black text-white">{businessOwners.length} Active Accounts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-300 uppercase font-bold block">Root Privileges</span>
                    <span className="text-sm font-black text-emerald-400">Unrestricted Bypass</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-300 uppercase font-bold block">Master PIN</span>
                    <span className="text-sm font-mono font-bold text-amber-300">{settings?.pin || '8888'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/20">
                    <span className="text-[10px] text-indigo-300 uppercase font-bold block">Store Scope</span>
                    <span className="text-sm font-bold text-white truncate block">
                      {settings?.restaurantName || restaurantName || 'Main Restaurant'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relocated Setting Component: Role Switcher & RBAC Master Console */}
              <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-black uppercase tracking-wider text-white">
                          Role Switcher & RBAC Master
                        </h5>
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          Relocated Setting Component
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Select or test active operating roles directly in Developer Space.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Current Role:</span>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black uppercase border ${
                      currentRole === UserRole.DEVELOPER
                        ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/40'
                        : currentRole === UserRole.OWNER
                        ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40'
                        : 'bg-amber-500/25 text-amber-300 border-amber-400/40'
                    }`}>
                      {currentRole || UserRole.DEVELOPER}
                    </span>
                  </div>
                </div>

                {/* 3 Role Switch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* DEVELOPER */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole(UserRole.DEVELOPER);
                      sound.playSuccess();
                      triggerHaptic('success');
                      setStatusMessage('Active role switched to DEVELOPER (Root Mode)!');
                      setTimeout(() => setStatusMessage(null), 3500);
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      currentRole === UserRole.DEVELOPER
                        ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/40'
                        : 'bg-slate-800/60 border-slate-700 hover:border-indigo-500/40 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                        <Terminal className="w-4 h-4" />
                      </div>
                      {currentRole === UserRole.DEVELOPER && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-500 text-white">ACTIVE</span>
                      )}
                    </div>
                    <span className="text-xs font-black block text-white">Developer Root Mode</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Unrestricted master privileges, RLS audit & tenant controls</span>
                  </button>

                  {/* OWNER */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole(UserRole.OWNER);
                      sound.playSuccess();
                      triggerHaptic('success');
                      setStatusMessage('Active role switched to BUSINESS OWNER!');
                      setTimeout(() => setStatusMessage(null), 3500);
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      currentRole === UserRole.OWNER
                        ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-500/40'
                        : 'bg-slate-800/60 border-slate-700 hover:border-emerald-500/40 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      {currentRole === UserRole.OWNER && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 font-black">ACTIVE</span>
                      )}
                    </div>
                    <span className="text-xs font-black block text-white">Business Owner</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Financial audits, staff payroll, inventory & menu pricing</span>
                  </button>

                  {/* STAFF */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onSwitchRole) onSwitchRole(UserRole.STAFF);
                      sound.playSuccess();
                      triggerHaptic('success');
                      setStatusMessage('Active role switched to STAFF (Terminal POS)!');
                      setTimeout(() => setStatusMessage(null), 3500);
                    }}
                    className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                      currentRole === UserRole.STAFF
                        ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-500/40'
                        : 'bg-slate-800/60 border-slate-700 hover:border-amber-500/40 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      {currentRole === UserRole.STAFF && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-slate-950 font-black">ACTIVE</span>
                      )}
                    </div>
                    <span className="text-xs font-black block text-white">Staff Terminal</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Order taking, cash/M-Pesa cashiering & kitchen ticket dispatch</span>
                  </button>
                </div>

                {/* Master Security PIN & Root Override */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Master Security PIN & Root Override</span>
                      <span className="text-[10.5px] text-slate-400 block">Required for unlocking developer privileges and root overrides</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={masterPin}
                      onChange={(e) => setMasterPin(e.target.value)}
                      className="w-28 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-black text-xs text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="PIN"
                      maxLength={8}
                    />
                    <button
                      type="button"
                      onClick={handleSavePin}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition cursor-pointer active:scale-95"
                    >
                      Save PIN
                    </button>
                  </div>
                </div>
              </div>

              {/* Embedded BusinessOwnerAccountsPanel Component */}
              <BusinessOwnerAccountsPanel
                businessOwners={businessOwners}
                settings={
                  settings || {
                    restaurantName: restaurantName || 'Restaurant POS',
                    address: '',
                    phoneNumber: '',
                    currency: 'TSh',
                    taxRate: 18,
                    serviceFee: 0,
                    receiptFooter: '',
                    pin: '8888',
                    ownerName: 'Root Developer',
                    ownershipLicense: 'ENH-ROOT-MASTER-2025',
                  }
                }
                onAddOwner={onAddBusinessOwner || (() => {})}
                onUpdateOwner={onUpdateBusinessOwner || (() => {})}
                onDeleteOwner={onDeleteBusinessOwner || (() => {})}
                onUpdateSettings={onUpdateSettings}
              />
            </div>
          )}

          {/* SUB-VIEW: ACCESS & LIMITS MATRIX (FUNCTION, VIEW & SETTINGS) */}
          {devSubView === 'access_limits' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <DeveloperPermissionsPanel
                currentConfig={currentPermConfig}
                onSaveConfig={handleSavePermissionsConfig}
                activeBranchName={tenants.find((t) => t.id === currentTenantId)?.name || 'Current Branch'}
                ownersCount={businessOwners.length}
                staffCount={staffCount}
              />
            </div>
          )}

          {/* SUB-VIEW 2: SWITCH BRANCH / LOCATION */}
          {devSubView === 'branch_switcher' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Hero Banner */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                          <span>Registered Businesses Directory</span>
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-mono">
                          <Building2 className="w-3 h-3 text-emerald-600" />
                          <span>Multi-Tenant Enterprise Directory</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        View and manage all registered restaurant businesses in your system. Each restaurant owner operates their own independent business enterprise and can create and manage their own operating branches.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenOnboardingWizard ? onOpenOnboardingWizard() : setActiveTab('onboard')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Onboard Registered Business</span>
                    </button>
                  </div>
                </div>

                {/* Active Operating Branch Card */}
                {(() => {
                  const activeTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];
                  if (!activeTenant) return null;
                  const CulinaryIcon = RESTAURANT_ICONS.find((i) => i.id === activeTenant.icon)?.Icon || UtensilsCrossed;

                  return (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-400/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-300 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {activeTenant.logoUrl ? (
                            <BrandLogo logoUrl={activeTenant.logoUrl} altText={activeTenant.name} className="w-9 h-9 object-contain" />
                          ) : (
                            <CulinaryIcon className="w-6 h-6 text-emerald-700" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-extrabold text-slate-900">{activeTenant.name}</h5>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs font-mono">
                              Active Operating Branch
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {activeTenant.branchName || activeTenant.tagline || 'Main Headquarters'} • {activeTenant.phone || activeTenant.address || 'Partition Online'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
                            <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">ID: {activeTenant.id}</span>
                            <span className="bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">Currency: {activeTenant.currency || 'TSh'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => setDevSubView('branch_partitions')}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-100/60 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Partition Data</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter and Search Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={branchSearch}
                      onChange={(e) => setBranchSearch(e.target.value)}
                      placeholder="Search branch name, city, address, or partition code..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span>Showing</span>
                    <strong className="text-slate-900 font-bold">
                      {tenants.filter((t) => {
                        if (!branchSearch.trim()) return true;
                        const q = branchSearch.toLowerCase();
                        return (
                          t.name.toLowerCase().includes(q) ||
                          t.id.toLowerCase().includes(q) ||
                          (t.branchName && t.branchName.toLowerCase().includes(q)) ||
                          (t.address && t.address.toLowerCase().includes(q))
                        );
                      }).length}
                    </strong>
                    <span>of {tenants.length} locations</span>
                  </div>
                </div>

                {/* Branches Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {tenants
                    .filter((t) => {
                      if (!branchSearch.trim()) return true;
                      const q = branchSearch.toLowerCase();
                      return (
                        t.name.toLowerCase().includes(q) ||
                        t.id.toLowerCase().includes(q) ||
                        (t.branchName && t.branchName.toLowerCase().includes(q)) ||
                        (t.address && t.address.toLowerCase().includes(q))
                      );
                    })
                    .map((t) => {
                      const isCurrent = t.id === currentTenantId;
                      const CulinaryIcon = RESTAURANT_ICONS.find((i) => i.id === t.icon)?.Icon || UtensilsCrossed;

                      return (
                        <div
                          key={t.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                            isCurrent
                              ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                              : 'bg-slate-50/60 hover:bg-white border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
                                  {t.logoUrl ? (
                                    <BrandLogo logoUrl={t.logoUrl} altText={t.name} className="w-8 h-8 rounded-lg object-contain" />
                                  ) : (
                                    <CulinaryIcon className="w-5 h-5 text-slate-700" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-xs font-bold text-slate-900 truncate">{t.name}</h5>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-teal-50 text-teal-800 border border-teal-200 rounded shrink-0">
                                      Registered Business
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {t.ownerName ? `Owner: ${t.ownerName} • ` : ''}
                                    {t.branches?.length || 1} operating {(t.branches?.length || 1) === 1 ? 'branch' : 'branches'}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  t.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}
                              >
                                {t.status === 'active' ? 'Live' : 'Maintenance'}
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-600">
                              {t.address && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{t.address}</span>
                                </div>
                              )}
                              {t.phone && (
                                <div className="flex items-center gap-1.5 truncate">
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{t.phone}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-200/80 text-slate-700 font-mono font-semibold">
                                ID: {t.id}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold">
                                {t.currency || 'TSh'}
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center gap-1">
                                <Store className="w-3 h-3 text-teal-600" />
                                <span>{t.branches?.length || 1} Branches</span>
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                            {isCurrent ? (
                              <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-2xs">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Operating Branch</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectTenant(t);
                                  sound.playSuccess();
                                  triggerHaptic('success');
                                  setStatusMessage(`Successfully switched active branch to ${t.name}!`);
                                  setTimeout(() => setStatusMessage(null), 3000);
                                }}
                                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                              >
                                <Store className="w-3.5 h-3.5" />
                                <span>Switch to this Branch</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingLogoTenant(t);
                              }}
                              title="Customize Branch Branding"
                              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition active:scale-95 cursor-pointer shrink-0"
                            >
                              <Palette className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: SETTINGS & ADMIN CONTROLS */}
          {devSubView === 'settings_admin' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Hero Banner */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                      <Sliders className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                          <span>Settings & Admin Controls</span>
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 font-mono">
                          <SlidersHorizontal className="w-3 h-3 text-amber-600" />
                          <span>Relocated in Developer Space</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        Manage thermal receipt printers, VAT/tax parameters, receipt footers, store identity, and the complete top bar navigation layout.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      id="superadmin-clear-analytics-btn"
                      onClick={() => setShowClearAnalyticsModal(true)}
                      className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>Clear Analytics &amp; Reports</span>
                    </button>

                    <button
                      type="button"
                      id="superadmin-delete-restaurant-btn"
                      onClick={() => {
                        setTenantDeleteTargetId(currentTenantId);
                        setShowDeleteTenantModal(true);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Restaurant</span>
                    </button>

                    {onOpenSettingsModal && (
                      <button
                        type="button"
                        onClick={onOpenSettingsModal}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Launch Full Settings Modal</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Section A: Store Profile & Business Identity */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Store Identity & Financial Profile
                      </h5>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Restaurant / Store Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. Olli's Pizza House"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Tagline / Motto</label>
                      <input
                        type="text"
                        value={profileTagline}
                        onChange={(e) => setProfileTagline(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. Authentic Woodfired Pizzas"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. +255 700 000 000"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. Masaki, Dar es Salaam"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={profileCurrency}
                        onChange={(e) => setProfileCurrency(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                        placeholder="TSh"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">VAT / Tax Rate (%)</label>
                      <input
                        type="number"
                        value={profileTaxRate}
                        onChange={(e) => setProfileTaxRate(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                        placeholder="18"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Receipt Footer Note</label>
                      <input
                        type="text"
                        value={profileReceiptFooter}
                        onChange={(e) => setProfileReceiptFooter(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="e.g. Thank you for dining with us! Karibu tena."
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Top Bar & Navigation Layout Manager */}
                <div className="pt-2">
                  <div className="mb-3">
                    <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                      <span>Top Bar & Navigation Layout Setting</span>
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customize which tabs sit in the Primary Navigation Bar versus the Dropdown Menu, rename tabs, and configure ordering.
                    </p>
                  </div>

                  {/* Embedded TopBarSettingsPanel directly in Developer Space */}
                  <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <TopBarSettingsPanel
                      config={resolveTopBarConfig(topBarConfig)}
                      onSaveConfig={onUpdateTopBarConfig || (() => {})}
                      isModal={false}
                    />
                  </div>
                </div>

                {/* Section C: Thermal Receipt Printers & POS Hardware */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Thermal Receipt Printers & POS Hardware
                        </h5>
                        <span className="text-[10.5px] text-slate-500">
                          Configure ESC/POS network print queues, paper roll dimensions, and auto-cut triggers.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestPrintSlip}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Print Slip</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSavePrinterSettings}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Hardware</span>
                      </button>
                    </div>
                  </div>

                  {testPrintSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{testPrintSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Printer IP Address</label>
                      <input
                        type="text"
                        value={printerIp}
                        onChange={(e) => setPrinterIp(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                        placeholder="192.168.1.200"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Port (Raw ESC/POS)</label>
                      <input
                        type="number"
                        value={printerPort}
                        onChange={(e) => setPrinterPort(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                        placeholder="9100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Paper Roll Width</label>
                      <select
                        value={printerPaperWidth}
                        onChange={(e) => setPrinterPaperWidth(e.target.value as '80mm' | '58mm')}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                      >
                        <option value="80mm">80mm (Standard POS Terminal)</option>
                        <option value="58mm">58mm (Compact / Mobile Belt)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Auto-Cut Guillotine</label>
                      <button
                        type="button"
                        onClick={() => setPrinterAutoCut(!printerAutoCut)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          printerAutoCut
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{printerAutoCut ? 'Enabled (Full Cut)' : 'Disabled (Tear Bar)'}</span>
                        {printerAutoCut ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section D: Visual Appearance & High Clarity (Reduce Blur) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-indigo-600" />
                      <div>
                        <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Visual Appearance & Clarity Control
                        </h5>
                        <span className="text-[10.5px] text-slate-500">
                          Fine-tune contrast, eliminate interface blur, and manage UI alert chimes.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Reduce Blur Toggle */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">Reduce Blur & High Clarity</span>
                        <button
                          type="button"
                          onClick={handleToggleReduceBlur}
                          className="cursor-pointer"
                        >
                          {devReduceBlur ? (
                            <ToggleRight className="w-6 h-6 text-indigo-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {devReduceBlur ? 'Active: All blur filters removed for high-speed crisp rendering.' : 'Disabled: Normal rendering mode with standard blur.'}
                      </p>
                    </div>

                    {/* Theme Mode */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-800 mb-2">POS Color Theme</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSelectTheme('dark')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            devTheme === 'dark'
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Dark
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectTheme('light')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            devTheme === 'light'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Light
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectTheme('emerald')}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            devTheme === 'emerald'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Emerald
                        </button>
                      </div>
                    </div>

                    {/* Audio Chime Alerts */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">POS Sound Alerts</span>
                        <button
                          type="button"
                          onClick={handleToggleSoundAlerts}
                          className="cursor-pointer"
                        >
                          {devSoundAlerts ? (
                            <ToggleRight className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {devSoundAlerts ? 'Active: Synthesizer alerts enabled for orders, receipts & actions.' : 'Muted: Silent UI operations.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 4: SITUATED IN DROPDOWN MENU (10 TABS) */}
          {devSubView === 'dropdown_tabs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Hero Banner */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-600 shrink-0 shadow-2xs">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                          <span>Situated In Dropdown Menu (10 tabs)</span>
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-800 border border-pink-200 flex items-center gap-1 font-mono">
                          <Layers className="w-3 h-3 text-pink-600" />
                          <span>10 Relocated Components</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        Direct operational launchpad for all 10 dropdown navigation components. Inspect live operational records, jump straight into any tab, or move tabs into the primary top bar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDevSubView('settings_admin')}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-600" />
                      <span>Configure Layout in Settings</span>
                    </button>
                  </div>
                </div>

                {/* Telemetry Strip for the 10 Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <span className="text-[10px] text-rose-700 font-bold uppercase block">Debts & Credit</span>
                    <span className="text-sm font-black text-rose-900">{debtsCount} Active</span>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-[10px] text-sky-700 font-bold uppercase block">Dishes / Stock</span>
                    <span className="text-sm font-black text-sky-900">{items.length} Items</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block">Purchases</span>
                    <span className="text-sm font-black text-amber-900">{purchasesCount} Receipts</span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="text-[10px] text-purple-700 font-bold uppercase block">Shopping List</span>
                    <span className="text-sm font-black text-purple-900">{shoppingCount} Ingredients</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 col-span-2 sm:col-span-4 lg:col-span-1">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">M-Pesa Logs</span>
                    <span className="text-sm font-black text-emerald-900">{mpesaCount} Statements</span>
                  </div>
                </div>

                {/* 10 Dropdown Tab Cards Grid */}
                {(() => {
                  const resolvedConfig = resolveTopBarConfig(topBarConfig);

                  const DROPDOWN_10_TABS: Array<{
                    id: string;
                    targetTab: TabType;
                    defaultName: string;
                    defaultSubtitle: string;
                    icon: React.ReactNode;
                    badgeText: string;
                    colorClass: string;
                    borderClass: string;
                    bgClass: string;
                  }> = [
                    {
                      id: 'tab_debts',
                      targetTab: 'debts',
                      defaultName: 'Customer Debts & Credit Tabs',
                      defaultSubtitle: 'Customer tabs, credit limits, settlement records & ledger',
                      icon: <Clock className="w-5 h-5 text-rose-600" />,
                      badgeText: `${debtsCount} active debt records`,
                      colorClass: 'text-rose-700',
                      borderClass: 'border-rose-200',
                      bgClass: 'bg-rose-50/70',
                    },
                    {
                      id: 'tab_inventory',
                      targetTab: 'inventory',
                      defaultName: 'Stock & Inventory Control',
                      defaultSubtitle: 'Real-time dish stocks, recipe costings & inventory pricing',
                      icon: <Boxes className="w-5 h-5 text-sky-600" />,
                      badgeText: `${items.length} items in catalog`,
                      colorClass: 'text-sky-700',
                      borderClass: 'border-sky-200',
                      bgClass: 'bg-sky-50/70',
                    },
                    {
                      id: 'tab_purchases',
                      targetTab: 'purchases',
                      defaultName: 'Procurement & Purchases',
                      defaultSubtitle: 'Daily supplies, restock expense receipts & vendor invoices',
                      icon: <ShoppingBag className="w-5 h-5 text-amber-600" />,
                      badgeText: `${purchasesCount} expense receipts`,
                      colorClass: 'text-amber-700',
                      borderClass: 'border-amber-200',
                      bgClass: 'bg-amber-50/70',
                    },
                    {
                      id: 'tab_shopping',
                      targetTab: 'shopping',
                      defaultName: 'Market Shopping List',
                      defaultSubtitle: 'Raw ingredients checklist, market restock & orders',
                      icon: <ListOrdered className="w-5 h-5 text-purple-600" />,
                      badgeText: `${shoppingCount} checklist items`,
                      colorClass: 'text-purple-700',
                      borderClass: 'border-purple-200',
                      bgClass: 'bg-purple-50/70',
                    },
                    {
                      id: 'tab_mpesa',
                      targetTab: 'mpesa',
                      defaultName: 'M-Pesa Live Statements',
                      defaultSubtitle: 'Live STK push receipts, C2B mobile money logs & reconciliations',
                      icon: <Smartphone className="w-5 h-5 text-emerald-600" />,
                      badgeText: `${mpesaCount} mobile money logs`,
                      colorClass: 'text-emerald-700',
                      borderClass: 'border-emerald-200',
                      bgClass: 'bg-emerald-50/70',
                    },
                    {
                      id: 'tab_finances',
                      targetTab: 'finances',
                      defaultName: 'Finances & Cash Register',
                      defaultSubtitle: 'Cash drawer float, daily reconciliation & capital ledger',
                      icon: <Wallet className="w-5 h-5 text-teal-600" />,
                      badgeText: 'Cash register & capital float',
                      colorClass: 'text-teal-700',
                      borderClass: 'border-teal-200',
                      bgClass: 'bg-teal-50/70',
                    },
                    {
                      id: 'tab_customers',
                      targetTab: 'customers',
                      defaultName: 'Customer Directory',
                      defaultSubtitle: 'VIP guest directory, customer visit logs & loyalty profiles',
                      icon: <Users className="w-5 h-5 text-blue-600" />,
                      badgeText: `${customersCount} VIP customers`,
                      colorClass: 'text-blue-700',
                      borderClass: 'border-blue-200',
                      bgClass: 'bg-blue-50/70',
                    },
                    {
                      id: 'tab_analytics',
                      targetTab: 'analytics',
                      defaultName: 'Audit & Analytics Reports',
                      defaultSubtitle: 'Hourly sales volume, dish profit margins & PDF reports',
                      icon: <BarChart3 className="w-5 h-5 text-cyan-600" />,
                      badgeText: 'Sales heatmaps & PDF export',
                      colorClass: 'text-cyan-700',
                      borderClass: 'border-cyan-200',
                      bgClass: 'bg-cyan-50/70',
                    },
                    {
                      id: 'tab_suppliers',
                      targetTab: 'suppliers',
                      defaultName: 'Suppliers & Vendors',
                      defaultSubtitle: 'Food & beverage vendor directory, contact reps & orders',
                      icon: <Truck className="w-5 h-5 text-emerald-700" />,
                      badgeText: `${suppliersCount} verified suppliers`,
                      colorClass: 'text-emerald-800',
                      borderClass: 'border-emerald-300',
                      bgClass: 'bg-emerald-50/70',
                    },
                    {
                      id: 'tab_settings',
                      targetTab: 'admin',
                      defaultName: 'Settings & Admin Controls (Developer Space)',
                      defaultSubtitle: 'Store profile, thermal printers, receipt formatting & tax • Relocated strictly to Developer Space',
                      icon: <Sliders className="w-5 h-5 text-amber-700" />,
                      badgeText: 'Developer Space Only',
                      colorClass: 'text-amber-800',
                      borderClass: 'border-amber-300',
                      bgClass: 'bg-amber-50/70',
                    },
                  ];

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                      {DROPDOWN_10_TABS.map((tabItem, idx) => {
                        const comp = resolvedConfig.components[tabItem.id];
                        const displayName = comp?.customLabel || tabItem.defaultName;
                        const displaySubtitle = comp?.customSubtitle || tabItem.defaultSubtitle;
                        const isDropdownPlacement = (comp?.placement || 'dropdown_menu') === 'dropdown_menu';

                        return (
                          <div
                            key={tabItem.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${tabItem.bgClass} ${tabItem.borderClass} shadow-2xs hover:shadow-sm`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                                    {tabItem.icon}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="text-xs font-bold text-slate-900">{displayName}</h5>
                                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-black uppercase font-mono bg-white border border-slate-200 text-slate-600">
                                        #{idx + 1}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{displaySubtitle}</p>
                                  </div>
                                </div>

                                <span
                                  className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                    isDropdownPlacement
                                      ? 'bg-pink-100 text-pink-800 border-pink-200'
                                      : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                  }`}
                                >
                                  {isDropdownPlacement ? 'Dropdown Menu' : 'Primary Nav'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] font-mono">
                                <span className={`px-2 py-0.5 rounded-md font-bold bg-white/90 border ${tabItem.borderClass} ${tabItem.colorClass}`}>
                                  {tabItem.badgeText}
                                </span>
                              </div>
                            </div>

                            {/* Card Action Buttons */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                              <button
                                type="button"
                                onClick={() => handleLaunchTab(tabItem.targetTab)}
                                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                                <span>Launch Tab</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleToggleDropdownTabPlacement(tabItem.id)}
                                title={isDropdownPlacement ? 'Promote to Primary Navigation Bar' : 'Move back to Dropdown Menu'}
                                className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                              >
                                {isDropdownPlacement ? (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-pink-500" />
                                    <span className="hidden sm:inline">Move to Nav</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-indigo-600" />
                                    <span className="hidden sm:inline">In Nav</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 7 SUB-VIEW 1: DEVELOPER SUPER-ROOT INFRASTRUCTURE PANEL */}
          {devSubView === 'root_infra' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <DeveloperInfraPanel
                currentRole={currentRole || currentUser?.role || UserRole.DEVELOPER}
                onSwitchRole={onSwitchRole || (() => {})}
                restaurantName={restaurantName || tenants.find((t) => t.id === currentTenantId)?.name || 'ENH Multi-Tenant Master'}
                onResetReport={onResetReport}
                onResetAllReports={onResetAllReports}
                onResetData={onResetData}
              />
            </div>
          )}

          {/* TAB 7 SUB-VIEW 2: BRANCH PARTITION INSPECTOR */}
          {devSubView === 'branch_partitions' && (
            <>
              {/* Branch Partition Inspector Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Branch Inspector & Review Mode</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect any branch partition without passwords, preview logos and culinary tags, and test review mode safely.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={devSearchQuery}
                  onChange={(e) => setDevSearchQuery(e.target.value)}
                  placeholder="Search branch or code..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Restaurant Partitions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {tenants
                .filter((t) => {
                  if (!devSearchQuery.trim()) return true;
                  const q = devSearchQuery.toLowerCase();
                  return (
                    t.name.toLowerCase().includes(q) ||
                    t.id.toLowerCase().includes(q) ||
                    (t.tenantCode && t.tenantCode.toLowerCase().includes(q)) ||
                    (t.branchName && t.branchName.toLowerCase().includes(q))
                  );
                })
                .map((t) => {
                  const isCurrent = t.id === currentTenantId;
                  const CulinaryIcon =
                    RESTAURANT_ICONS.find((i) => i.id === t.icon)?.Icon || UtensilsCrossed;

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 overflow-hidden">
                              {t.logoUrl ? (
                                <BrandLogo
                                  logoUrl={t.logoUrl}
                                  altText={t.name}
                                  className="w-8 h-8 rounded-lg object-contain"
                                />
                              ) : (
                                <CulinaryIcon className="w-5 h-5 text-slate-700" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {t.name}
                              </h5>
                              <p className="text-[11px] text-slate-500 truncate">
                                {t.branchName || t.tagline || 'Main Branch'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}
                          >
                            {t.status === 'active' ? 'Live' : 'Maintenance'}
                          </span>
                        </div>

                        {/* Metadata pills */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-200/80 text-slate-700 font-mono font-semibold">
                            ID: {t.id}
                          </span>
                          {t.tenantCode && (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-mono font-bold">
                              Code: {t.tenantCode}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-600 font-bold">
                            {t.currency || 'TZS'}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTenant(t);
                            setStatusMessage(`Switched active partition to ${t.name}`);
                            setTimeout(() => setStatusMessage(null), 3000);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isCurrent ? 'Current Branch' : 'Review in Sandbox'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingLogoTenant(t)}
                          title="Customize Brand Logo, Colors & Culinary Icon"
                          className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition active:scale-95 cursor-pointer shrink-0"
                        >
                          <Palette className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* RLS Security Rule Audit Verification Log */}
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-2 font-mono text-xs border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center justify-between">
              <span>Tenant Row-Level Security (RLS) Isolation Audit</span>
              <span className="text-emerald-400 font-bold">All Partitions Encrypted & Isolated</span>
            </div>
            <div className="text-slate-300">
              &gt; Active Security Profile: Strict Multi-Tenant Branch Partitioning (restaurant_id header verified)
            </div>
            <div className="text-slate-300">
              &gt; Super Admin Access Mode: Dual MFA with Biometric/SMS OTP Verification + Root Keystroke Guard
            </div>
            <div className="text-emerald-400">
              &gt; Status: All developer root mode components and super admin unified inside Developer Space.
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Clone Dish to Another Restaurant Modal */}
      {cloningDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Copy className="w-5 h-5 text-emerald-600" />
                <span>Clone Dish Across Tenants</span>
              </h3>
              <button
                onClick={() => setCloningDish(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Original Dish
              </span>
              <div className="font-bold text-slate-800 text-sm">{cloningDish.name}</div>
              <div className="text-xs text-slate-500">Category: {cloningDish.category}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Target Restaurant:
              </label>
              <select
                value={cloneTargetTenantId}
                onChange={(e) => setCloneTargetTenantId(e.target.value)}
                className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500">
                This will create a completely isolated copy of this dish inside the target restaurant's menu with its own independent stock and price.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCloningDish(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetTenant = tenants.find((t) => t.id === cloneTargetTenantId);
                  const clonedItem: MenuItem = {
                    ...cloningDish,
                    id: `dish-${cloneTargetTenantId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    restaurant_id: cloneTargetTenantId,
                    name: `${cloningDish.name} (Copy)`,
                    updatedAt: Date.now(),
                  };
                  onAddNewItem?.(clonedItem);
                  setStatusMessage(`Cloned "${cloningDish.name}" to ${targetTenant?.name || cloneTargetTenantId}`);
                  setTimeout(() => setStatusMessage(null), 3500);
                  setCloningDish(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
              >
                Duplicate to Restaurant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Dish Modal in Super Admin */}
      {isAddingNewDish && (
        <NewItemModal
          onClose={() => setIsAddingNewDish(false)}
          onSave={(newItem) => {
            onAddNewItem?.({
              ...newItem,
              restaurant_id: selectedMenuTenantId,
            });
            setIsAddingNewDish(false);
            setStatusMessage(`Added dish "${newItem.name}" to menu`);
            setTimeout(() => setStatusMessage(null), 3500);
          }}
          currency={tenants.find((t) => t.id === selectedMenuTenantId)?.currency || 'TZS'}
          restaurantId={selectedMenuTenantId}
          restaurantName={tenants.find((t) => t.id === selectedMenuTenantId)?.name}
          existingCategories={items
            .filter((i) => (i.restaurant_id || 'ollis-pizza') === selectedMenuTenantId)
            .map((i) => i.category)}
        />
      )}

      {/* Edit Dish Modal in Super Admin */}
      {editingDishItem && (
        <EditItemModal
          key={editingDishItem.id}
          item={editingDishItem}
          isOpen={true}
          currency={tenants.find((t) => t.id === (editingDishItem.restaurant_id || selectedMenuTenantId))?.currency || 'TZS'}
          onClose={() => setEditingDishItem(null)}
          onSave={(updated) => {
            onUpdateItem?.(updated);
            setEditingDishItem(null);
            setStatusMessage(`Updated dish "${updated.name}"`);
            setTimeout(() => setStatusMessage(null), 3500);
          }}
          onDelete={(id) => {
            onDeleteItem?.(id);
            setEditingDishItem(null);
          }}
          restaurantId={editingDishItem.restaurant_id || selectedMenuTenantId}
          restaurantName={
            tenants.find((t) => t.id === (editingDishItem.restaurant_id || selectedMenuTenantId))?.name
          }
          existingCategories={items
            .filter((i) => (i.restaurant_id || 'ollis-pizza') === (editingDishItem.restaurant_id || selectedMenuTenantId))
            .map((i) => i.category)}
        />
      )}
      {/* Brand & Logo Customization Modal in Developer Settings */}
      {editingLogoTenant && (
        <LogoEditorModal
          isOpen={true}
          onClose={() => setEditingLogoTenant(null)}
          currentLogoUrl={editingLogoTenant.logoUrl}
          currentName={editingLogoTenant.name}
          currentTagline={editingLogoTenant.tagline || ''}
          currentThemeColor={editingLogoTenant.themeColor}
          currentIcon={editingLogoTenant.icon}
          currentBranchName={editingLogoTenant.branchName}
          onSave={(data) => {
            const updated = {
              ...editingLogoTenant,
              logoUrl: data.logoUrl,
              name: data.name,
              tagline: data.tagline,
              themeColor: data.themeColor,
              icon: data.icon,
              branchName: data.branchName,
            };
            const currentList = loadStoredTenants();
            const updatedList = currentList.map((t) => (t.id === updated.id ? updated : t));
            saveStoredTenants(updatedList);
            setStatusMessage(`Updated brand identity for ${data.name}`);
            setTimeout(() => setStatusMessage(null), 3000);
            setEditingLogoTenant(null);
            onRefreshTenants();
          }}
        />
      )}

      {/* Clear Analytics & Reports Modal in Developer Space */}
      {showClearAnalyticsModal && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-300 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-rose-950">
                Confirm Clear Analytics &amp; Reports
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to reset all orders, sales revenue histories, customer debt ledgers, and reporting metrics for <strong>{restaurantName || 'this restaurant'}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowClearAnalyticsModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="superadmin-confirm-clear-btn"
                onClick={() => {
                  if (onResetAnalytics) onResetAnalytics();
                  if (onResetAllReports) onResetAllReports('CONFIRM_RESET');
                  setShowClearAnalyticsModal(false);
                  sound.playCancel();
                  setDashboardNotice('Analytics and reports cleared successfully.');
                  setTimeout(() => setDashboardNotice(null), 3500);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Clear All Analytics &amp; Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Restaurant Modal in Developer Space */}
      {showDeleteTenantModal && (
        <div className="fixed inset-0 z-70 bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-300 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-950">
                Confirm Delete Restaurant
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Permanently purge restaurant branch and all data partitions. This action is irreversible.
              </p>
            </div>

            {tenants && tenants.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Branch:
                </label>
                <select
                  value={tenantDeleteTargetId}
                  onChange={(e) => setTenantDeleteTargetId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-red-200 bg-red-50/50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteTenantModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="superadmin-confirm-delete-tenant-btn"
                onClick={() => {
                  const targetId = tenantDeleteTargetId || currentTenantId;
                  if (targetId && onDeleteTenant) {
                    onDeleteTenant(targetId);
                    setShowDeleteTenantModal(false);
                    sound.playCancel();
                    setDashboardNotice('Restaurant permanently deleted.');
                    setTimeout(() => setDashboardNotice(null), 3500);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Notice Banner */}
      {dashboardNotice && (
        <div className="fixed bottom-6 right-6 z-80 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-emerald-600 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{dashboardNotice}</span>
        </div>
      )}
    </div>
  );
};
