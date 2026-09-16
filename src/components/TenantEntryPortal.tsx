import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  Building2,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Store,
  Terminal,
  RotateCcw,
  Wrench,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  LogIn,
  Code2,
  Palette,
  Search,
  Sliders,
  Database,
  Layers,
  UtensilsCrossed,
  MapPin,
  Phone,
} from 'lucide-react';
import { TenantRestaurant, AuthUser, RestaurantSettings, StaffMember, BusinessOwnerAccount } from '../types';
import { UserRole, isDeveloperPasswordValid, DEVELOPER_PASSWORD } from '../utils/rbac';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';
import { loadStoredTenants, saveStoredTenants } from '../utils/storage';
import { BrandLogo } from './BrandLogo';
import { EnhLogo } from './EnhLogo';
import { SuperAdminSecureAccess } from './SuperAdminSecureAccess';
import { LogoEditorModal, RESTAURANT_ICONS } from './LogoEditorModal';

interface TenantEntryPortalProps {
  currentTenant: TenantRestaurant;
  onSelectTenant: (tenant: TenantRestaurant) => void;
  onLoginSuccess: (
    user: AuthUser,
    tenant: TenantRestaurant,
    initialTab?: 'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings'
  ) => void;
  settings: RestaurantSettings;
  staffList: StaffMember[];
  businessOwners?: BusinessOwnerAccount[];
  tenants: TenantRestaurant[];
  onOpenOnboardingWizard?: () => void;
}

export const TenantEntryPortal: React.FC<TenantEntryPortalProps> = ({
  currentTenant,
  onSelectTenant,
  onLoginSuccess,
  settings,
  staffList,
  businessOwners = [],
  tenants: initialTenants,
  onOpenOnboardingWizard,
}) => {
  // Available stages:
  // 'code_prompt' (Unique Code validation)
  // 'portal_unlocked' (Dual Login for validated tenant)
  // 'developer_space' (Dedicated Developer space before selecting a restaurant/branch)
  // 'enh_system_admin' (Direct Super Admin Master Login)
  const [entryStage, setEntryStage] = useState<
    'code_prompt' | 'portal_unlocked' | 'enh_system_admin' | 'developer_space'
  >('code_prompt');

  const [isSecureModalOpen, setIsSecureModalOpen] = useState(false);
  
  // Local tenant list that reflects recent custom edits
  const [localTenants, setLocalTenants] = useState<TenantRestaurant[]>(() => {
    const stored = loadStoredTenants();
    return stored.length > 0 ? stored : initialTenants;
  });

  // Code validation input
  const [tenantCodeInput, setTenantCodeInput] = useState(currentTenant?.uniqueCode || 'REST-9021');
  const [validatedTenant, setValidatedTenant] = useState<TenantRestaurant>(currentTenant);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Appearance customization modal state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizingTenant, setCustomizingTenant] = useState<TenantRestaurant | null>(null);

  // Developer Space search & filter
  const [devSearchQuery, setDevSearchQuery] = useState('');

  // Dual Login section toggle: 'staff' | 'owner'
  const [activeLoginSection, setActiveLoginSection] = useState<'staff' | 'owner'>('staff');

  // Staff credentials
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [staffPin, setStaffPin] = useState('');
  
  // Owner credentials
  const [ownerUsername, setOwnerUsername] = useState(validatedTenant?.ownerEmail || 'owner');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Super Admin / Developer master credentials
  const [masterUsername, setMasterUsername] = useState('developer');
  const [masterPassword, setMasterPassword] = useState('');
  const [masterError, setMasterError] = useState<string | null>(null);

  // General state
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Fast direct 1-click launcher for Developer Settings in Super Admin
  const handleOpenDeveloperSettings = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    sound.playClick();
    triggerHaptic('medium');
    const masterUser: AuthUser = {
      id: 'enh-superadmin-master',
      username: 'enh-master',
      name: 'ENH Platform Architect & Super Admin',
      role: UserRole.DEVELOPER,
      restaurant_id: 'ALL',
      businessId: null,
      email: 'admin@enh.co.tz',
      lastLoginAt: Date.now(),
    };
    onLoginSuccess(masterUser, validatedTenant || currentTenant, 'developer_settings');
  };

  // Check URL query parameters for direct /enh-system-admin/login access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get('route') === 'enh-system-admin' ||
      urlParams.get('admin') === 'true' ||
      window.location.pathname.includes('enh-system-admin')
    ) {
      setEntryStage('enh_system_admin');
    }
  }, []);

  // Sync stored tenants
  useEffect(() => {
    const stored = loadStoredTenants();
    if (stored && stored.length > 0) {
      setLocalTenants(stored);
      // Keep validatedTenant fresh if updated
      if (validatedTenant) {
        const found = stored.find((t) => t.id === validatedTenant.id);
        if (found) setValidatedTenant(found);
      }
    }
  }, [validatedTenant?.id]);

  // Update fields when validated tenant changes
  useEffect(() => {
    if (validatedTenant) {
      setOwnerUsername(validatedTenant.ownerEmail || 'owner');
    }
  }, [validatedTenant]);

  // Dynamic official logo for the blurred background
  const activeBackdropLogo =
    customizingTenant?.logoUrl || validatedTenant?.logoUrl || currentTenant?.logoUrl || '/logo.jpg';

  // Handle Unique Tenant Code Validation
  const handleValidateCode = (overrideCode?: string) => {
    const codeToTest = (overrideCode || tenantCodeInput).trim().toUpperCase();
    setValidationError(null);

    if (!codeToTest) {
      setValidationError('Please enter your assigned Unique Tenant Code.');
      sound.playError();
      return;
    }

    setIsValidating(true);

    setTimeout(() => {
      setIsValidating(false);
      const allTenants = loadStoredTenants();
      const matched = allTenants.find(
        (t) =>
          t.uniqueCode?.toUpperCase() === codeToTest ||
          t.id.toUpperCase() === codeToTest ||
          t.slug.toUpperCase() === codeToTest
      );

      if (!matched) {
        setValidationError(
          `Tenant Code "${codeToTest}" was not found. Please check your assigned code with ENH RESTAURANT MANAGEMENT AIDE LTD.`
        );
        sound.playError();
        triggerHaptic('heavy');
        return;
      }

      // Valid tenant found!
      setValidatedTenant(matched);
      onSelectTenant(matched);
      setEntryStage('portal_unlocked');
      sound.playSuccess();
      triggerHaptic('medium');
    }, 300);
  };

  // Developer Space: Review & Inspect Branch directly
  const handleReviewBranchAsDeveloper = (tenant: TenantRestaurant) => {
    sound.playSuccess();
    triggerHaptic('medium');
    onSelectTenant(tenant);

    const developerUser: AuthUser = {
      id: `dev_reviewer_${Date.now()}`,
      username: 'developer',
      name: 'ENH Developer Reviewer',
      email: 'developer@enh.co.tz',
      role: UserRole.DEVELOPER,
      businessId: tenant.id,
      restaurant_id: tenant.id,
      lastLoginAt: Date.now(),
    };

    onLoginSuccess(developerUser, tenant);
  };

  // Handle Staff Login
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    setTimeout(() => {
      setIsLoggingIn(false);
      const staff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];

      // Staff PIN check: default 1234 or empty
      if (staffPin && staffPin !== '1234' && staffPin !== '0000') {
        setLoginError('Incorrect Staff PIN. Default is 1234.');
        sound.playError();
        return;
      }

      const user: AuthUser = {
        id: staff?.id || `staff_${Date.now()}`,
        username: staff?.username || (staff?.name || 'Staff Member').toLowerCase().replace(/\s+/g, '_'),
        name: staff?.name || 'Staff Member',
        role: UserRole.STAFF,
        businessId: validatedTenant.id,
        restaurant_id: validatedTenant.id,
        lastLoginAt: Date.now(),
      };

      sound.playSuccess();
      triggerHaptic('medium');
      onLoginSuccess(user, validatedTenant);
    }, 350);
  };

  // Handle Owner Login
  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUser = ownerUsername.trim().toLowerCase();
    const cleanPass = ownerPassword.trim();

    if (!cleanPass) {
      setLoginError('Please enter owner password.');
      sound.playError();
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      setIsLoggingIn(false);
      // Master Developer override via Owner section
      if (
        (cleanUser === 'dev' || cleanUser === 'developer' || cleanUser === 'admin') &&
        isDeveloperPasswordValid(cleanPass, settings.adminPassword)
      ) {
        const user: AuthUser = {
          id: 'usr_dev_001',
          username: 'developer',
          name: 'Developer (Root Owner)',
          role: UserRole.DEVELOPER,
          businessId: null,
          restaurant_id: validatedTenant.id,
          lastLoginAt: Date.now(),
        };
        sound.playSuccess();
        triggerHaptic('medium');
        onLoginSuccess(user, validatedTenant);
        return;
      }

      // Owner verification: accepts adminPassword, 'admin123', 'owner123', or settings.adminPassword
      const isValidPassword =
        cleanPass === (settings.adminPassword || 'admin123') ||
        cleanPass === 'admin123' ||
        cleanPass === 'owner123' ||
        cleanPass === 'password123';

      if (isValidPassword) {
        const user: AuthUser = {
          id: `owner_${validatedTenant.id}`,
          username: cleanUser || 'owner',
          name: validatedTenant.ownerName || 'Restaurant Owner',
          email: validatedTenant.ownerEmail,
          role: UserRole.OWNER,
          businessId: validatedTenant.id,
          restaurant_id: validatedTenant.id,
          lastLoginAt: Date.now(),
        };
        sound.playSuccess();
        triggerHaptic('medium');
        onLoginSuccess(user, validatedTenant);
      } else {
        setLoginError('Incorrect password. Default demo password is "admin123".');
        sound.playError();
        triggerHaptic('heavy');
      }
    }, 350);
  };

  // Handle Master System Login
  const handleMasterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterError(null);

    const cleanUser = masterUsername.trim().toLowerCase();
    const cleanPass = masterPassword.trim();

    if (!cleanPass) {
      setMasterError('Master Developer password is required.');
      sound.playError();
      return;
    }

    if (
      isDeveloperPasswordValid(cleanPass, settings.adminPassword) ||
      cleanPass === 'admin123' ||
      cleanPass === 'developer123' ||
      cleanPass === DEVELOPER_PASSWORD
    ) {
      const user: AuthUser = {
        id: 'usr_dev_master',
        username: cleanUser || 'developer',
        name: 'ENH Super Admin & System Architect',
        role: UserRole.DEVELOPER,
        businessId: null,
        restaurant_id: validatedTenant.id,
        lastLoginAt: Date.now(),
      };

      sound.playSuccess();
      triggerHaptic('medium');
      onLoginSuccess(user, validatedTenant);
    } else {
      setMasterError('Access Denied: Invalid Master System Credentials.');
      sound.playError();
      triggerHaptic('heavy');
    }
  };

  // Filtered tenants in Developer Space
  const filteredTenants = useMemo(() => {
    if (!devSearchQuery.trim()) return localTenants;
    const q = devSearchQuery.toLowerCase();
    return localTenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.branchName && t.branchName.toLowerCase().includes(q)) ||
        (t.uniqueCode && t.uniqueCode.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q))
    );
  }, [localTenants, devSearchQuery]);

  // Handle saving appearance customization (logo, icon, color, name, tagline, branch)
  const handleSaveAppearance = (data: {
    logoUrl: string;
    name: string;
    tagline: string;
    themeColor?: string;
    icon?: string;
    branchName?: string;
  }) => {
    if (!customizingTenant) return;

    const updated: TenantRestaurant = {
      ...customizingTenant,
      name: data.name,
      tagline: data.tagline,
      logoUrl: data.logoUrl,
      themeColor: data.themeColor || customizingTenant.themeColor || '#059669',
      icon: data.icon || customizingTenant.icon || 'pizza',
      branchName: data.branchName || customizingTenant.branchName || 'Main Branch',
      updatedAt: Date.now(),
    };

    // Update in stored list
    const currentList = loadStoredTenants();
    const nextList = currentList.map((t) => (t.id === updated.id ? updated : t));
    saveStoredTenants(nextList);
    setLocalTenants(nextList);

    if (validatedTenant?.id === updated.id) {
      setValidatedTenant(updated);
    }

    onSelectTenant(updated);
    sound.playSuccess();
    triggerHaptic('medium');
    setIsCustomizerOpen(false);
    setCustomizingTenant(null);
  };

  // Check if validated tenant is under maintenance
  const isMaintenanceActive = validatedTenant?.isUnderMaintenance;

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-800 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative font-sans">
      {/* Dynamic Official Restaurant Logo Blurred Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        <img
          key={activeBackdropLogo}
          src={activeBackdropLogo}
          alt="Official Restaurant Logo Blurred Background"
          className="w-full h-full object-cover opacity-10 filter contrast-110 saturate-125 transition-all duration-700 pointer-events-none crisp-img"
          onError={(e) => {
            e.currentTarget.src = '/logo.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white/95" />
      </div>

      {/* Top Branding Header */}
      <header className="relative z-10 w-full border-b border-slate-200 bg-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm sm:text-base tracking-tight text-slate-900">
                ENH RESTAURANT MANAGEMENT AIDE
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Hospitality Operating System & Isolated Branch Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Super Admin / Developer Space Route Switcher */}
          <button
            type="button"
            id="portal-super-admin-root-btn"
            onClick={() => setIsSecureModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all active:scale-95 bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-emerald-500/60 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            title="Open Developer Space & Super Admin Console"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Developer Space & Super Admin</span>
            <span className="sm:hidden">Dev Space</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className={`w-full transition-all duration-300 ${
            entryStage === 'developer_space' ? 'max-w-5xl' : 'max-w-lg'
          }`}
        >
          {/* ========================================================================= */}
          {/* 1. DEVELOPER SPACE BEFORE SELECTING RESTAURANT OR BRANCH */}
          {/* ========================================================================= */}
          {entryStage === 'developer_space' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
              {/* Developer Space Top Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-black text-slate-900 text-lg">Developer Review & Branch Space</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Pre-Selection Inspector
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Review each restaurant and branch partition, customize icons & official logos, or test review mode.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setEntryStage('code_prompt')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>← Back to Code Login</span>
                  </button>
                  {onOpenOnboardingWizard && (
                    <button
                      type="button"
                      onClick={onOpenOnboardingWizard}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Onboard New Branch</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Developer Telemetry Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Total Restaurants
                  </span>
                  <span className="text-lg font-black text-slate-900">{localTenants.length} Active</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Partition Isolation
                  </span>
                  <span className="text-lg font-black text-emerald-700 flex items-center gap-1">
                    <Database className="w-4 h-4" />
                    <span>Active RLS</span>
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Developer Review Mode
                  </span>
                  <span className="text-lg font-black text-indigo-700">1-Click Inspect</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                    Logo Blur Backdrop
                  </span>
                  <span className="text-lg font-black text-slate-800">Dynamic Active</span>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={devSearchQuery}
                  onChange={(e) => setDevSearchQuery(e.target.value)}
                  placeholder="Search restaurants by brand name, branch location, or tenant code..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs placeholder:text-slate-400"
                />
              </div>

              {/* Restaurants & Branches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[58vh] overflow-y-auto pr-1">
                {filteredTenants.map((t) => {
                  const CulinaryIcon =
                    RESTAURANT_ICONS.find((i) => i.id === t.icon)?.Icon || UtensilsCrossed;

                  return (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/60 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                    >
                      {/* Top Brand Identity */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div
                              className="w-12 h-12 rounded-2xl p-0.5 shadow-2xs bg-white overflow-hidden flex items-center justify-center border-2"
                              style={{ borderColor: t.themeColor || '#059669' }}
                            >
                              <img
                                src={t.logoUrl || '/logo.jpg'}
                                alt={t.name}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  e.currentTarget.src = '/logo.jpg';
                                }}
                              />
                            </div>
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md text-white flex items-center justify-center shadow-xs text-[9px]"
                              style={{ backgroundColor: t.themeColor || '#059669' }}
                              title={`Icon: ${t.icon || 'pizza'}`}
                            >
                              <CulinaryIcon className="w-3 h-3" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-black text-slate-900 truncate">
                                {t.name}
                              </h3>
                              <span
                                className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded text-white shrink-0"
                                style={{ backgroundColor: t.themeColor || '#059669' }}
                              >
                                {t.branchName || 'Main Branch'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {t.tagline || 'Hospitality Cuisine'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[10.5px] text-slate-600">
                              <span className="flex items-center gap-1 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {t.uniqueCode}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span>{t.currency || 'TZS'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status chip */}
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          {t.status || 'Active'}
                        </span>
                      </div>

                      {/* Address & Meta */}
                      <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                        {t.address && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{t.address}</span>
                          </div>
                        )}
                        {t.ownerEmail && (
                          <div className="text-[10px] text-slate-400 truncate">
                            Owner: <span className="font-mono text-slate-600">{t.ownerEmail}</span>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Customization on icon or logo */}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomizingTenant(t);
                            setIsCustomizerOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title="Customize official logo, culinary icon & theme color"
                        >
                          <Palette className="w-3.5 h-3.5 text-amber-600" />
                          <span>Customize Look</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Standard Login selection */}
                          <button
                            type="button"
                            onClick={() => {
                              setValidatedTenant(t);
                              onSelectTenant(t);
                              setEntryStage('portal_unlocked');
                              sound.playClick();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer shadow-2xs"
                            title="Select this branch for standard staff/owner login"
                          >
                            Select
                          </button>

                          {/* Review & Inspect Branch */}
                          <button
                            type="button"
                            onClick={() => handleReviewBranchAsDeveloper(t)}
                            className="px-3 py-1.5 rounded-xl text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                            style={{ backgroundColor: t.themeColor || '#059669' }}
                            title="Directly review and inspect this branch without password"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review Branch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MODE B: UNIQUE TENANT CODE VALIDATION PROMPT */}
          {/* ========================================================================= */}
          {entryStage === 'code_prompt' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-3">
                <div className="flex justify-center mb-1">
                  <EnhLogo size="xl" textColor="navy" />
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Enter your restaurant's unique tenant code to load your isolated menu, kitchen tickets, and staff accounts.
                </p>
              </div>

              {validationError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Tenant Access Code <span className="text-emerald-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={tenantCodeInput}
                    onChange={(e) => setTenantCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleValidateCode();
                      }
                    }}
                    placeholder="e.g. REST-9021"
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white border border-slate-300 text-slate-900 font-mono font-black text-base tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase shadow-2xs placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidateCode()}
                    disabled={isValidating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-xs"
                    title="Validate Code"
                  >
                    {isValidating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Sample Tenant Access Cards */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Quick Access Demo Tenants:
                  </span>
                  <button
                    type="button"
                    onClick={() => setEntryStage('developer_space')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    View All in Dev Space →
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {localTenants.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTenantCodeInput(t.uniqueCode || t.id);
                        handleValidateCode(t.uniqueCode || t.id);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/90 hover:bg-white border border-slate-200 text-left transition group active:scale-98 shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-2xs overflow-hidden"
                          style={{ backgroundColor: t.themeColor || '#059669' }}
                        >
                          <img
                            src={t.logoUrl || '/logo.jpg'}
                            alt={t.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/logo.jpg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 truncate">
                            {t.name}
                          </p>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {t.branchName || 'Main Branch'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {t.uniqueCode || 'REST-XXXX'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. MODE C: TENANT PORTAL UNLOCKED - DUAL LOGIN (STAFF vs OWNER) */}
          {/* ========================================================================= */}
          {entryStage === 'portal_unlocked' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
              {/* Active Tenant Dynamic Branding Banner with Appearance Customizer Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-100 border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-xl p-0.5 shadow-2xs bg-white overflow-hidden flex items-center justify-center border-2"
                      style={{ borderColor: validatedTenant.themeColor || '#059669' }}
                    >
                      <img
                        src={validatedTenant.logoUrl || '/logo.jpg'}
                        alt={validatedTenant.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/logo.jpg';
                        }}
                      />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 truncate leading-tight">
                        {validatedTenant.name}
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5 flex items-center gap-1.5">
                      <Store className="w-3 h-3" />
                      <span>{validatedTenant.branchName || 'Main Branch'}</span>
                      <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {validatedTenant.uniqueCode}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Restaurant Customization on Icon / Logo / Appearance at Login */}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomizingTenant(validatedTenant);
                      setIsCustomizerOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition shadow-2xs cursor-pointer flex items-center gap-1"
                    title="Customize restaurant icon, logo, theme color & appearance"
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Customize Look</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEntryStage('code_prompt')}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 text-[11px] font-bold border border-slate-300 transition shadow-2xs cursor-pointer"
                    title="Switch Tenant Code"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Maintenance Notice Check */}
              {isMaintenanceActive ? (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-5 h-5 text-amber-600 animate-spin" />
                    <h4 className="font-black text-sm text-amber-950">System Under Maintenance</h4>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {validatedTenant.maintenanceMessage ||
                      'ENH RESTAURANT MANAGEMENT AIDE LTD. is currently deploying platform updates for this restaurant.'}
                  </p>
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                    <span className="text-[10px] text-amber-700 font-bold">ENH Maintenance Shield</span>
                    <button
                      type="button"
                      onClick={() => setEntryStage('enh_system_admin')}
                      className="text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      Developer Bypass
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* DUAL LOGIN OPTIONS TAB SWITCHER */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLoginSection('staff');
                        setLoginError(null);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        activeLoginSection === 'staff'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Staff Login</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveLoginSection('owner');
                        setLoginError(null);
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        activeLoginSection === 'owner'
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Owner Section</span>
                    </button>
                  </div>

                  {loginError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* 1. STAFF LOGIN SECTION */}
                  {activeLoginSection === 'staff' && (
                    <form onSubmit={handleStaffLogin} className="space-y-4 text-xs animate-in fade-in duration-200">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Select Staff Terminal User
                        </label>
                        <select
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.roleTitle || 'Server / Cashier'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Staff Passcode / Quick PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={staffPin}
                          onChange={(e) => setStaffPin(e.target.value)}
                          placeholder="Default PIN: 1234 (or leave blank)"
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-center tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                        />
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Role: Restricted POS & Orders</span>
                        <span className="text-emerald-700 font-bold">Fast Shift Access</span>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isLoggingIn ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>Enter Operational POS</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* 2. OWNER LOGIN SECTION */}
                  {activeLoginSection === 'owner' && (
                    <form onSubmit={handleOwnerLogin} className="space-y-4 text-xs animate-in fade-in duration-200">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Owner Email / Master Identifier
                        </label>
                        <input
                          type="text"
                          value={ownerUsername}
                          onChange={(e) => setOwnerUsername(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                          placeholder="e.g. owner@restaurant.com"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">
                          Manager / Admin Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={ownerPassword}
                            onChange={(e) => setOwnerPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                            placeholder="Enter password (demo: admin123)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                        <p className="text-slate-800 font-semibold">Full Manager Dashboard Privileges:</p>
                        <p>• Menu pricing & dish catalog editing</p>
                        <p>• Multi-branch management & financial analytics</p>
                        <p>• Payment gateway & staff payroll configuration</p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                      >
                        {isLoggingIn ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Shield className="w-4 h-4 text-emerald-400" />
                            <span>Unlock Owner Dashboard</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MODE D: SUPER ADMIN MASTER LOGIN ROUTE (/enh-system-admin/login) */}
          {/* ========================================================================= */}
          {entryStage === 'enh_system_admin' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-base">Super Admin Master Login</h2>
                    <p className="text-xs text-slate-500">
                      ENH RESTAURANT MANAGEMENT AIDE Root Credentials
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEntryStage('code_prompt')}
                  className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer font-semibold"
                >
                  Cancel
                </button>
              </div>

              {masterError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{masterError}</span>
                </div>
              )}

              <form onSubmit={handleMasterLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Master Administrator Username
                  </label>
                  <input
                    type="text"
                    value={masterUsername}
                    onChange={(e) => setMasterUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs placeholder:text-slate-400"
                    placeholder="developer or admin"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Master System Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={masterPassword}
                      onChange={(e) => setMasterPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs placeholder:text-slate-400"
                      placeholder="Enter master password (e.g. admin123)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-[11px] text-indigo-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cross-Tenant Super Admin Access</span>
                  </p>
                  <p>• Access to all restaurant tenants, schemas, and live database logs</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Authenticate Master Session</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200 bg-white px-4 py-3 text-center text-slate-600 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
        <span>Powered by ENH RESTAURANT MANAGEMENT AIDE LTD. • Strict Database Row-Level Multi-Tenancy Scoping</span>
        <button
          type="button"
          onClick={() => setIsSecureModalOpen(true)}
          className="text-[10px] text-emerald-700 hover:text-emerald-800 transition-colors font-mono font-bold cursor-pointer"
        >
          Root 2FA Access (type "enhadmin")
        </button>
      </footer>

      {/* Super Admin Secret Keystroke Override & Dual MFA Modal */}
      <SuperAdminSecureAccess
        isOpen={isSecureModalOpen}
        onClose={() => setIsSecureModalOpen(false)}
        onOpenDeveloperSpace={() => {
          setIsSecureModalOpen(false);
          setEntryStage('developer_space');
        }}
        onAuthenticated={({ user }) => {
          setIsSecureModalOpen(false);
          onLoginSuccess(user, validatedTenant || currentTenant, 'developer_settings');
        }}
      />

      {/* Restaurant Appearance Customizer Modal (Icon, Logo, Color, Name, Branch) */}
      {isCustomizerOpen && customizingTenant && (
        <LogoEditorModal
          isOpen={isCustomizerOpen}
          onClose={() => {
            setIsCustomizerOpen(false);
            setCustomizingTenant(null);
          }}
          currentLogoUrl={customizingTenant.logoUrl || '/logo.jpg'}
          currentName={customizingTenant.name}
          currentTagline={customizingTenant.tagline}
          currentBranchName={customizingTenant.branchName || 'Main Branch'}
          currentThemeColor={customizingTenant.themeColor || '#059669'}
          currentIcon={customizingTenant.icon || 'pizza'}
          onSave={handleSaveAppearance}
        />
      )}
    </div>
  );
};
