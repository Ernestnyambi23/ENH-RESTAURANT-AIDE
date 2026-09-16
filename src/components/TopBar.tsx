import React, { useState, useRef, useEffect } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  CheckSquare,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Shield,
  Bell,
  Terminal,
  UserCheck,
  LogOut,
  MoreVertical,
  Bot,
  Store,
  Building2,
  ChevronDown,
  ChevronRight,
  Sliders,
  Sparkles,
  Pencil,
  Clock,
  Boxes,
  Receipt,
  ListOrdered,
  Wallet,
  Users,
  BarChart3,
  Sun,
  Moon,
  Palette,
  Globe,
  Monitor,
  Copy,
  Check,
  Banknote,
  CreditCard,
  QrCode,
  Truck,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { TabType, Language, AuthUser, TenantRestaurant, TopBarLayoutConfig, TopBarComponentSetting, AppTheme } from '../types';
import { resolveTopBarConfig } from '../utils/topBarConfig';
import { TopBarSettingsPanel } from './TopBarSettingsPanel';
import { BrandLogo } from './BrandLogo';
import { LogoEditorModal } from './LogoEditorModal';
import { useAppTranslation } from '../utils/translations';
import { UserRole } from '../utils/rbac';
import { useFirebase } from '../firebase/FirebaseContext';

interface TopBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  restaurantName: string;
  tagline: string;
  logoUrl?: string;
  onUpdateBranding?: (branding: { logoUrl: string; name: string; tagline: string }) => void;
  activeOrderCount: number;
  completedOrderCount: number;
  cartCount: number;
  isAdminUnlocked: boolean;
  currentRole?: UserRole;
  authUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenRoleAuthModal?: () => void;
  onOpenCart: () => void;
  onOpenAndroidAppModal?: () => void;
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenTenantSwitcher?: () => void;
  onOpenBranchSwitcher?: () => void;
  onOpenSuperAdmin?: (initialTab?: 'metrics' | 'dishes' | 'onboard' | 'features' | 'audit' | 'migration' | 'developer_settings', initialSubView?: 'root_master' | 'access_limits' | 'branch_switcher' | 'settings_admin' | 'dropdown_tabs' | 'branch_partitions' | 'root_infra') => void;
  unreadNotificationsCount?: number;
  pendingDevicesCount?: number;
  language?: Language;
  hideAdminFromNav?: boolean;
  developerMode?: boolean;
  onToggleDeveloperMode?: () => void;
  onInlineUpdateTenant?: (updates: { name?: string; tagline?: string }) => void;
  tenants?: TenantRestaurant[];
  currentTenantId?: string;
  onSelectTenant?: (tenant: TenantRestaurant) => void;
  topBarConfig?: TopBarLayoutConfig;
  onUpdateTopBarConfig?: (config: TopBarLayoutConfig) => void;
  currentTheme?: AppTheme;
  onUpdateTheme?: (theme: AppTheme) => void;
  onUpdateLanguage?: (lang: Language) => void;
  onResetAnalytics?: () => void;
  onResetAllReports?: (masterKey: string) => boolean | void;
  onDeleteTenant?: (tenantId: string) => void;
  trashCount?: number;
  onOpenTrashBin?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  restaurantName,
  tagline,
  logoUrl = '/logo.jpg',
  onUpdateBranding,
  activeOrderCount,
  completedOrderCount,
  cartCount,
  isAdminUnlocked,
  currentRole = UserRole.STAFF,
  authUser,
  onLogout,
  onOpenRoleAuthModal,
  onOpenCart,
  onOpenAndroidAppModal,
  onOpenSettings,
  onOpenNotifications,
  onOpenAiAssistant,
  onOpenTenantSwitcher,
  onOpenBranchSwitcher,
  onOpenSuperAdmin,
  unreadNotificationsCount = 0,
  pendingDevicesCount = 0,
  language = 'en',
  hideAdminFromNav = false,
  developerMode = false,
  onToggleDeveloperMode,
  onInlineUpdateTenant,
  tenants,
  currentTenantId,
  onSelectTenant,
  topBarConfig,
  trashCount,
  onOpenTrashBin,
  onUpdateTopBarConfig,
  currentTheme = 'white',
  onUpdateTheme,
  onUpdateLanguage,
  onResetAnalytics,
  onResetAllReports,
  onDeleteTenant,
}) => {
  const { t } = useAppTranslation(language);
  const { user: firebaseUser, signInWithGoogle, signOutUser } = useFirebase();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isTopBarCustomizerOpen, setIsTopBarCustomizerOpen] = useState(false);
  const [isClearAnalyticsModalOpen, setIsClearAnalyticsModalOpen] = useState(false);
  const [isDeleteRestaurantModalOpen, setIsDeleteRestaurantModalOpen] = useState(false);
  const [tenantToDeleteId, setTenantToDeleteId] = useState<string>(currentTenantId || '');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [copiedMethod, setCopiedMethod] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleCopyPayment = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMethod(label);
    setTimeout(() => setCopiedMethod(null), 2000);
  };

  const config = resolveTopBarConfig(topBarConfig);

  const TAB_KEY_TO_TAB_TYPE: Record<string, TabType> = {
    tab_order: 'order',
    tab_order_received: 'order_received',
    tab_order_completed: 'order_completed',
    tab_debts: 'debts',
    tab_inventory: 'inventory',
    tab_purchases: 'purchases',
    tab_shopping: 'shopping',
    tab_mpesa: 'mpesa',
    tab_finances: 'finances',
    tab_customers: 'customers',
    tab_suppliers: 'suppliers',
    tab_analytics: 'analytics',
    tab_settings: 'admin',
  };

  const isTabActive = (componentId: string, activeTab: TabType) => {
    const mapped = TAB_KEY_TO_TAB_TYPE[componentId];
    if (!mapped) return false;
    if (mapped === 'order') return activeTab === 'order' || activeTab === 'menu';
    if (mapped === 'order_received') return activeTab === 'order_received' || activeTab === 'orders';
    return activeTab === mapped;
  };

  const getTabBadgeCount = (componentId: string): number | undefined => {
    if (componentId === 'tab_order_received') return activeOrderCount > 0 ? activeOrderCount : undefined;
    if (componentId === 'tab_order_completed') return completedOrderCount > 0 ? completedOrderCount : undefined;
    if (componentId === 'cart') return cartCount > 0 ? cartCount : undefined;
    if (componentId === 'notifications') return unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined;
    return undefined;
  };

  const renderNavIcon = (iconName: string, className = 'w-3.5 h-3.5') => {
    switch (iconName) {
      case 'UtensilsCrossed':
      case 'tab_order':
        return <UtensilsCrossed className={className} />;
      case 'CheckSquare':
      case 'tab_order_received':
        return <CheckSquare className={`${className} text-[#c8791f]`} />;
      case 'CheckCircle2':
      case 'tab_order_completed':
        return <CheckCircle2 className={`${className} text-emerald-400`} />;
      case 'Clock':
      case 'tab_debts':
        return <Clock className={`${className} text-rose-400`} />;
      case 'Boxes':
      case 'tab_inventory':
        return <Boxes className={`${className} text-sky-400`} />;
      case 'Receipt':
      case 'tab_purchases':
        return <Receipt className={`${className} text-amber-400`} />;
      case 'ListOrdered':
      case 'tab_shopping':
        return <ListOrdered className={`${className} text-purple-400`} />;
      case 'Smartphone':
      case 'tab_mpesa':
        return <Smartphone className={`${className} text-emerald-400`} />;
      case 'Wallet':
      case 'tab_finances':
        return <Wallet className={`${className} text-teal-400`} />;
      case 'Users':
      case 'tab_customers':
        return <Users className={`${className} text-blue-400`} />;
      case 'Truck':
      case 'tab_suppliers':
        return <Truck className={`${className} text-emerald-400`} />;
      case 'BarChart3':
      case 'tab_analytics':
        return <BarChart3 className={`${className} text-cyan-400`} />;
      case 'Sliders':
      case 'tab_settings':
      default:
        return <Sliders className={`${className} text-amber-400`} />;
    }
  };

  // Split components by situation/placement
  const allComponents = Object.values(config.components);

  const isDark = currentTheme === 'dark';
  const isWarmLight = currentTheme === 'light';
  const isWhite = !isDark && !isWarmLight;

  const leftComponents = allComponents
    .filter((c) => c.visible && c.placement === 'header_left')
    .sort((a, b) => a.order - b.order);

  const centerComponents = allComponents
    .filter((c) => c.visible && c.placement === 'header_center')
    .sort((a, b) => a.order - b.order);

  const rightComponents = allComponents
    .filter((c) => c.visible && c.placement === 'header_right')
    .sort((a, b) => a.order - b.order);

  const navTabs = allComponents
    .filter((c) => c.visible && c.placement === 'nav_tabs' && (c.id !== 'tab_settings' || currentRole === UserRole.DEVELOPER))
    .sort((a, b) => a.order - b.order);

  // tab_settings is strictly removed from general dropdown menu shortcuts and relocated to Developer Space
  const dropdownTabs = allComponents
    .filter((c) => c.visible && c.placement === 'dropdown_menu' && c.type === 'nav_tab' && c.id !== 'tab_settings')
    .sort((a, b) => a.order - b.order);

  const renderHeaderItem = (comp: TopBarComponentSetting) => {
    if (!comp.visible || comp.placement === 'hidden') return null;

    if (comp.id === 'logo') {
      return (
        <div key={comp.id} className="relative shrink-0">
          <button
            type="button"
            id="top-left-business-logo"
            onClick={() => setIsLogoModalOpen(true)}
            title={comp.customLabel ? `${comp.customLabel} - Click to edit logo` : "Click to edit business logo icon & brand"}
            className="relative group cursor-pointer block rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full aspect-square ring-2 ring-emerald-300/50 group-hover:ring-amber-400/90 shadow-md bg-white p-0.5 overflow-hidden flex items-center justify-center transition-all">
              <img
                src={logoUrl || '/logo.jpg'}
                alt={comp.customLabel || restaurantName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs border border-[#1f4d3e] group-hover:scale-110 transition-transform">
              <Pencil className="w-2.5 h-2.5" />
            </span>
          </button>
        </div>
      );
    }

    if (comp.id === 'brand_title') {
      const displayName = comp.customLabel || restaurantName;
      const displayTagline = comp.customSubtitle || tagline;
      return (
        <div key={comp.id} className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              id="header-restaurant-title-btn"
              onClick={() => setIsLogoModalOpen(true)}
              title="Click to edit restaurant brand & logo"
              className="text-left group/title flex items-center gap-1 cursor-pointer max-w-full"
            >
              <h1
                contentEditable={currentRole === UserRole.DEVELOPER && developerMode}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const val = e.currentTarget.textContent?.trim();
                  if (val && val !== displayName) {
                    onInlineUpdateTenant?.({ name: val });
                  }
                }}
                className={`text-[15px] sm:text-[17px] font-extrabold tracking-tight truncate leading-tight transition-colors ${
                  isWhite
                    ? 'text-slate-900 group-hover/title:text-emerald-700'
                    : 'text-white group-hover/title:text-amber-200'
                } ${
                  currentRole === UserRole.DEVELOPER && developerMode
                    ? isWhite
                      ? 'border border-dashed border-amber-500 bg-amber-50/80 px-1.5 py-0.5 rounded cursor-text'
                      : 'border border-dashed border-amber-300/80 bg-black/25 px-1.5 py-0.5 rounded cursor-text'
                    : ''
                }`}
              >
                {displayName}
              </h1>
              <Pencil className={`w-3 h-3 opacity-60 group-hover/title:opacity-100 shrink-0 transition-all ${
                isWhite ? 'text-slate-400 group-hover/title:text-emerald-600' : 'text-emerald-300/60 group-hover/title:text-amber-300'
              }`} />
            </button>
          </div>

          <p
            onClick={() => setIsLogoModalOpen(true)}
            contentEditable={currentRole === UserRole.DEVELOPER && developerMode}
            suppressContentEditableWarning={true}
            onBlur={(e) => {
              const val = e.currentTarget.textContent?.trim();
              if (val && val !== displayTagline) {
                onInlineUpdateTenant?.({ tagline: val });
              }
            }}
            title="Click to edit tagline & brand"
            className={`text-[10.5px] sm:text-[11.5px] truncate leading-none mt-0.5 cursor-pointer transition-all ${
              isWhite ? 'text-slate-500 hover:text-slate-800' : 'text-[#cfe0d7] hover:text-white'
            } ${
              currentRole === UserRole.DEVELOPER && developerMode
                ? isWhite
                  ? 'border border-dashed border-amber-500 bg-amber-50/80 px-1 py-0.5 rounded cursor-text'
                  : 'border border-dashed border-amber-300/80 bg-black/25 px-1 py-0.5 rounded cursor-text'
                : ''
            }`}
          >
            {displayTagline}
          </p>
        </div>
      );
    }

    if (comp.id === 'branch_switcher') {
      if (!onOpenBranchSwitcher && !onOpenTenantSwitcher) return null;
      const currentBranch = tenants?.find((t) => t.id === currentTenantId)?.branchName || 'Main';
      return (
        <button
          key={comp.id}
          type="button"
          id="header-branch-switcher-badge"
          onClick={() => {
            if (onOpenBranchSwitcher) {
              onOpenBranchSwitcher();
            } else if (onOpenTenantSwitcher) {
              onOpenTenantSwitcher();
            }
          }}
          title="Switch operating branch for this restaurant"
          className={`px-2 py-1 rounded-xl border text-[10.5px] font-extrabold flex items-center gap-1 transition-all active:scale-95 cursor-pointer truncate max-w-[130px] shrink-0 ${
            isWhite
              ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200 text-slate-800'
              : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
          }`}
        >
          <Store className={`w-3 h-3 shrink-0 ${isWhite ? 'text-emerald-700' : 'text-amber-300'}`} />
          <span className="truncate">{comp.customLabel || currentBranch}</span>
          <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
        </button>
      );
    }

    if (comp.id === 'role_badge') {
      return (
        <button
          key={comp.id}
          type="button"
          id="header-role-badge-btn"
          onClick={() => {
            if (onOpenRoleAuthModal) onOpenRoleAuthModal();
            else onOpenSettings();
          }}
          title="Switch or verify RBAC role"
          className={`px-2 py-1 rounded-xl text-[9.5px] font-black uppercase tracking-wider border shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 ${
            isWhite
              ? currentRole === UserRole.DEVELOPER
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : currentRole === UserRole.OWNER
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
              : currentRole === UserRole.DEVELOPER
              ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40'
              : currentRole === UserRole.OWNER
              ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
              : 'bg-amber-500/25 text-amber-200 border-amber-400/30'
          }`}
        >
          <Shield className="w-2.5 h-2.5 shrink-0" />
          <span>{comp.customLabel || currentRole}</span>
        </button>
      );
    }

    if (comp.id === 'notifications') {
      if (!onOpenNotifications) return null;
      const showBadge = comp.showBadge !== false && unreadNotificationsCount > 0;
      return (
        <button
          key={comp.id}
          type="button"
          id="header-notification-btn"
          onClick={onOpenNotifications}
          title={comp.customLabel || "Arrival & System Notifications"}
          className={`relative p-2 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 ${
            isWhite
              ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80 text-slate-700'
              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
          }`}
        >
          <Bell className={`w-4 h-4 ${isWhite ? 'text-slate-700' : 'text-emerald-200'}`} />
          {showBadge && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      );
    }

    if (comp.id === 'trash_bin' || comp.id === 'trash') {
      if (!onOpenTrashBin) return null;
      return (
        <button
          key={comp.id}
          type="button"
          id="header-trash-bin-btn"
          onClick={onOpenTrashBin}
          title="Trash Bin (30-day deleted orders retention)"
          className={`relative p-2 rounded-xl border transition-all active:scale-95 cursor-pointer shadow-xs shrink-0 ${
            isWhite
              ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80 text-slate-700'
              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
          }`}
        >
          <Trash2 className={`w-4 h-4 ${isWhite ? 'text-amber-700' : 'text-amber-300'}`} />
          {trashCount !== undefined && trashCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {trashCount}
            </span>
          )}
        </button>
      );
    }

    if (comp.id === 'cart') {
      const showBadge = comp.showBadge !== false && cartCount > 0;
      return (
        <button
          key={comp.id}
          type="button"
          id="header-cart-btn"
          onClick={onOpenCart}
          className={`relative px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
            isWhite
              ? 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80 text-slate-800'
              : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">{comp.customLabel || t('nav.cart', 'Cart')}</span>
          {showBadge && (
            <span className="bg-[#c8791f] text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
              {cartCount}
            </span>
          )}
        </button>
      );
    }

    if (comp.type === 'nav_tab') {
      const mappedTab = TAB_KEY_TO_TAB_TYPE[comp.id] || 'order';
      const isActive = isTabActive(comp.id, currentTab);
      const badgeCount = comp.showBadge !== false ? getTabBadgeCount(comp.id) : undefined;
      return (
        <button
          key={comp.id}
          type="button"
          onClick={() => onSelectTab(mappedTab)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
            isActive
              ? isWhite
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-[#143529] shadow-xs'
              : isWhite
              ? 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/80'
              : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
          }`}
        >
          {renderNavIcon(comp.icon || comp.id, 'w-3.5 h-3.5')}
          <span className="hidden sm:inline">{comp.customLabel || comp.name}</span>
          {badgeCount !== undefined && badgeCount > 0 && (
            <span className="bg-[#c8791f] text-white text-[9px] font-extrabold px-1.5 rounded-full">
              {badgeCount}
            </span>
          )}
        </button>
      );
    }

    return null;
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <header
      className={`sticky top-0 z-30 transition-colors ${
        isWhite
          ? 'bg-white border-b border-slate-200 text-slate-800 shadow-xs'
          : isDark
          ? 'bg-[#101713] text-white border-b border-slate-800 shadow-md'
          : 'bg-[#1f4d3e] text-white shadow-md'
      }`}
    >
      {/* Brand & Action Header: Dynamically rendered based on topBarConfig placements */}
      <div className="max-w-2xl mx-auto px-3.5 pt-3 pb-2 flex items-center justify-between gap-2">
        {/* Left Side: Situated in header_left */}
        <div className="flex items-center gap-2.5 min-w-0">
          {(leftComponents.length > 0
            ? leftComponents
            : [config.components.logo, config.components.brand_title].filter(Boolean)
          ).map(renderHeaderItem)}
        </div>

        {/* Center Side: Situated in header_center */}
        {centerComponents.length > 0 && (
          <div className="flex items-center gap-1.5 min-w-0 justify-center">
            {centerComponents.map(renderHeaderItem)}
          </div>
        )}

        {/* Right Side: Situated in header_right + Menu Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {rightComponents
            .filter((c) => c.id !== 'menu_button')
            .map(renderHeaderItem)}

          {/* Top-Right Three Dots Settings Menu Wrapper (⋮) */}
          <div className="relative shrink-0">
            <button
              ref={menuButtonRef}
              type="button"
              id="top-right-settings-icon"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              title={
                isDropdownOpen
                  ? 'Close Menu'
                  : currentRole === UserRole.DEVELOPER
                  ? 'System Menu, Tenant Switcher & Dev Controls (⋮)'
                  : isAdminUnlocked
                  ? 'System Menu & Branch Management (⋮)'
                  : 'System Menu & Config (⋮)'
              }
              aria-label="Settings Menu"
              aria-expanded={isDropdownOpen}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-xs transition-all group relative cursor-pointer active:scale-95 shrink-0 ${
                isWhite
                  ? isDropdownOpen
                    ? 'bg-slate-200 border-emerald-600 text-slate-900 ring-2 ring-emerald-500/30'
                    : 'bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/80 text-slate-700 hover:text-slate-950'
                  : isDropdownOpen
                  ? 'bg-white/25 border-emerald-400/80 ring-2 ring-emerald-400/30 text-white'
                  : 'bg-white/15 hover:bg-white/25 border-white/30 hover:border-white/40 text-white'
              }`}
            >
              <MoreVertical className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                isWhite ? 'text-slate-700 group-hover:text-slate-950' : 'text-emerald-200 group-hover:text-white'
              }`} />
              {isAdminUnlocked ? (
                <span
                  className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full ring-1 ${
                    isWhite ? 'ring-slate-300' : 'ring-[#1f4d3e]'
                  } shrink-0 ${
                    currentRole === UserRole.DEVELOPER ? 'bg-indigo-500 shadow-[0_0_6px_#818cf8]' : 'bg-emerald-500 shadow-[0_0_6px_#34d399]'
                  }`}
                />
              ) : (
                <span className={`absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-1 ${
                  isWhite ? 'ring-slate-300' : 'ring-[#1f4d3e]'
                } shrink-0 shadow-[0_0_6px_#fbbf24]`} />
              )}
              {pendingDevicesCount > 0 && !isAdminUnlocked && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-white text-[9px] font-black flex items-center justify-center text-black animate-pulse">
                  {pendingDevicesCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu accessed by clicking three dots on right side */}
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                id="top-right-dropdown-menu"
                className={`absolute top-full right-0 mt-2.5 w-76 sm:w-84 max-h-[min(82vh,620px)] flex flex-col rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                  isDark
                    ? 'bg-[#0d1722]/98 border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.65)] text-white'
                    : 'bg-white/95 border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-slate-800'
                }`}
              >
                {/* Fixed Banner at top of Dropdown */}
                <div className={`shrink-0 p-3 border-b ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-900 via-[#10202e] to-slate-900 border-slate-800 text-white'
                    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full aspect-square overflow-hidden bg-white p-0.5 shrink-0 ring-1 ring-emerald-400/40">
                        <img
                          src={logoUrl || '/logo.jpg'}
                          alt={restaurantName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-[10px] font-extrabold uppercase tracking-wider truncate ${
                          isDark ? 'text-amber-400' : 'text-amber-600'
                        }`}>
                          ENH RESTAURANT MANAGEMENT
                        </div>
                        <div className={`text-xs font-bold truncate max-w-[170px] ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {restaurantName}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      id="dropdown-menu-role-badge"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (onOpenRoleAuthModal) {
                          onOpenRoleAuthModal();
                        } else {
                          onOpenSettings();
                        }
                      }}
                      title="Click to switch or verify RBAC role"
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 cursor-pointer hover:opacity-85 active:scale-95 transition-all ${
                        isDark
                          ? currentRole === UserRole.DEVELOPER
                            ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
                            : currentRole === UserRole.OWNER
                            ? 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40'
                            : 'bg-amber-500/20 text-amber-200 border-amber-400/30'
                          : currentRole === UserRole.DEVELOPER
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : currentRole === UserRole.OWNER
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {currentRole}
                    </button>
                  </div>
                  <p className={`text-[10.5px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tagline}</p>
                </div>

                {/* SCROLLABLE LIST ITEMS */}
                {currentRole === UserRole.STAFF ? (
                  /* ========================================================================= */
                  /* STAFF-ONLY SETTINGS DROPMENU:
                     1. Language Choice (English / Kiswahili)
                     2. Theme Mode Look of App (Dark, White, Auto mode)
                     3. Display of Payment Methods (Cash, M-Pesa, Airtel Money, Tigo Pesa, Card POS, QR)
                  */
                  /* ========================================================================= */
                  <div className={`flex-1 overflow-y-auto overscroll-contain p-3 space-y-3.5 scrollbar-thin scrollbar-track-transparent ${
                    isDark ? 'scrollbar-thumb-slate-700' : 'scrollbar-thumb-slate-300'
                  }`}>
                    {/* Role Notice */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <div>
                          <span className="font-extrabold text-xs block">Staff Terminal Settings</span>
                          <span className="text-[10.5px] text-slate-500">Fast Shift & Payment Access</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Restricted
                      </span>
                    </div>

                    {/* 1. Language Choice */}
                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Language Choice / Lugha</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase">
                          {language === 'sw' ? 'Kiswahili' : 'English'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => onUpdateLanguage?.('en')}
                          className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            language === 'en'
                              ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇺🇸 English</span>
                          {language === 'en' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateLanguage?.('sw')}
                          className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            language === 'sw'
                              ? 'bg-emerald-700 text-white border-emerald-600 shadow-xs'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>🇹🇿 Kiswahili</span>
                          {language === 'sw' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      </div>
                    </div>

                    {/* 2. Theme Mode Look of App (Dark, White, Auto) */}
                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>App Appearance Look</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 capitalize">
                          {currentTheme} mode
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateTheme?.('white')}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            currentTheme === 'white'
                              ? 'bg-white text-slate-950 border-slate-400 ring-2 ring-emerald-500/50 shadow-xs'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>White</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateTheme?.('dark')}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            currentTheme === 'dark'
                              ? 'bg-slate-900 text-white border-slate-600 ring-2 ring-emerald-500/50 shadow-xs'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span>Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateTheme?.('auto')}
                          className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            currentTheme === 'auto'
                              ? 'bg-emerald-700 text-white border-emerald-600 ring-2 ring-emerald-500/50 shadow-xs'
                              : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          <Monitor className="w-4 h-4 text-emerald-400" />
                          <span>Auto</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Display of Payment Methods */}
                    <div className={`p-3 rounded-2xl border ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Display of Payment Methods</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold">
                          Counter Tills
                        </span>
                      </div>

                      <div className="space-y-2">
                        {/* Cash */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <Banknote className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                Cash (Fedha Taslimu)
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                Drawer active • TZS currency accepted
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                            Active
                          </span>
                        </div>

                        {/* Vodacom M-Pesa */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>Vodacom M-Pesa</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                                  549102
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                Lipa Namba (Till) • {restaurantName}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPayment('M-Pesa Till', '549102')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                            title="Copy M-Pesa Till Number"
                          >
                            {copiedMethod === 'M-Pesa Till' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Airtel Money */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>Airtel Money</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                                  680219
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                Till Namba • Counter Checkout
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPayment('Airtel Till', '680219')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                            title="Copy Airtel Till Number"
                          >
                            {copiedMethod === 'Airtel Till' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Tigo Pesa */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                <span>Tigo Pesa</span>
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                  392011
                                </span>
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                Lipa kwa Simu • {restaurantName}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPayment('Tigo Till', '392011')}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer shrink-0"
                            title="Copy Tigo Till Number"
                          >
                            {copiedMethod === 'Tigo Till' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Card / POS Terminal */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                Card (POS Terminal)
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                Visa & Mastercard • Terminal POS-01
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 shrink-0">
                            Online
                          </span>
                        </div>

                        {/* QR Code / Selcom */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                              <QrCode className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                Selcom & Mastercard QR
                              </div>
                              <div className="text-[10.5px] text-slate-500 truncate">
                                Scan to pay at counter
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* SCROLLABLE LIST ITEMS: Can scroll up and down freely (Owner & Developer) */
                  <div className={`flex-1 overflow-y-auto overscroll-contain p-2 space-y-1 divide-y scrollbar-thin scrollbar-track-transparent ${
                    isDark ? 'divide-slate-800/80 scrollbar-thumb-slate-700' : 'divide-slate-200/80 scrollbar-thumb-slate-300'
                  }`}>
                  {/* EDITABLE QUICK ACTION: Edit Logo & Restaurant Branding (Developer Only) */}
                  {currentRole === UserRole.DEVELOPER && (
                    <button
                      type="button"
                      id="dropdown-menu-edit-logo-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsLogoModalOpen(true);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border mb-1 ${
                        isDark
                          ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-amber-500/40 bg-amber-500/10'
                          : 'hover:bg-amber-50/90 border-amber-200/80 hover:border-amber-400/60 bg-amber-50/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full ring-1 ring-amber-400/50 bg-white p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                          <img
                            src={logoUrl || '/logo.jpg'}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = '/logo.jpg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${
                            isDark ? 'text-amber-200' : 'text-amber-900'
                          }`}>
                            Edit Logo & Branding
                          </span>
                          <span className={`text-[10.5px] block truncate ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Change circular logo, name & tagline
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 border border-amber-500/30">
                          Edit
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  )}

                  {/* ADMIN CONTROL: Customize Top Bar & Navigation Layout (Developer Only) */}
                  {currentRole === UserRole.DEVELOPER && (
                    <button
                      type="button"
                      id="dropdown-menu-customize-topbar-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsTopBarCustomizerOpen(true);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border mb-1 ${
                        isDark
                          ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-emerald-500/50 bg-emerald-950/40'
                          : 'hover:bg-emerald-50/90 border-emerald-200/80 hover:border-emerald-400/60 bg-emerald-50/50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          <Sliders className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-bold block truncate ${
                            isDark ? 'text-emerald-200' : 'text-emerald-900'
                          }`}>
                            Customize Top Bar & Nav
                          </span>
                          <span className={`text-[10.5px] block truncate ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Rename components & choose placement
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                          Layout
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  )}

                  {/* QUICK THEME SWITCHER - HIGH VISIBILITY WHITE THEME */}
                  <div className={`p-2.5 rounded-xl border space-y-2 mb-1.5 shadow-xs ${
                    isDark ? 'bg-slate-900/80 border-slate-700/70 text-slate-200' : 'bg-slate-50/90 border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Display Theme</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 border border-emerald-500/40">
                        {currentTheme === 'white' ? '⚪ Pure White' : currentTheme === 'dark' ? '🌙 Dark' : '☀️ Warm'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                      <button
                        type="button"
                        id="theme-switch-white-btn"
                        onClick={() => {
                          onUpdateTheme?.('white');
                        }}
                        className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                          currentTheme === 'white'
                            ? 'bg-white text-slate-950 font-black shadow-sm border-emerald-600 ring-2 ring-emerald-500/40'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-white'
                        }`}
                        title="Pure White Theme for maximum daylight and kitchen visibility"
                      >
                        <span className="w-2 h-2 rounded-full bg-white border border-slate-400 shrink-0" />
                        <span>White</span>
                      </button>
                      <button
                        type="button"
                        id="theme-switch-light-btn"
                        onClick={() => {
                          onUpdateTheme?.('light');
                        }}
                        className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                          currentTheme === 'light'
                            ? 'bg-amber-50 text-amber-950 font-black shadow-sm border-amber-400 ring-2 ring-amber-500/40'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-white'
                        }`}
                        title="Warm classic cream theme"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#e8e4d8] border border-amber-600 shrink-0" />
                        <span>Warm</span>
                      </button>
                      <button
                        type="button"
                        id="theme-switch-dark-btn"
                        onClick={() => {
                          onUpdateTheme?.('dark');
                        }}
                        className={`py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                          currentTheme === 'dark'
                            ? 'bg-emerald-950 text-emerald-200 font-black shadow-sm border-emerald-500 ring-2 ring-emerald-500/80'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-white'
                        }`}
                        title="Dark night mode for low light"
                      >
                        <Moon className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* RELOCATED TO DEVELOPER SPACE: SETTINGS & ADMINISTRATIVE CONTROLS (Developer Only) */}
                  {currentRole === UserRole.DEVELOPER && (
                    <div className={`p-2.5 rounded-2xl border space-y-1.5 transition-all ${
                      isDark
                        ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950/70 border-indigo-500/30 shadow-inner'
                        : 'bg-gradient-to-b from-indigo-50/60 via-slate-50/70 to-white border-indigo-200/80 shadow-xs'
                    }`}>
                      <div className="flex items-center justify-between px-1 pb-1 border-b border-indigo-500/20">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            Developer Space • Relocated Settings
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                          Developer Access Only
                        </span>
                      </div>

                      <div className="space-y-1">
                        {/* Unified Access Button: Developer Space, Super Admin & Role Master Access */}
                        <button
                          type="button"
                          id="dropdown-menu-role-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            if (currentRole === UserRole.DEVELOPER && onOpenSuperAdmin) {
                              onOpenSuperAdmin('developer_settings', 'root_master');
                            } else if (onOpenRoleAuthModal) {
                              onOpenRoleAuthModal();
                            } else if (onOpenSuperAdmin) {
                              onOpenSuperAdmin('developer_settings', 'root_master');
                            } else {
                              onOpenSettings();
                            }
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                            isDark
                              ? 'bg-gradient-to-r from-indigo-950/60 to-slate-900/80 hover:bg-indigo-900/60 border-indigo-500/40 text-indigo-100 shadow-inner'
                              : 'bg-gradient-to-r from-indigo-50/90 to-purple-50/70 hover:bg-indigo-100/90 border-indigo-200/90 text-indigo-950 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                currentRole === UserRole.DEVELOPER
                                  ? 'bg-indigo-500/25 text-indigo-400 border-indigo-500/40'
                                  : currentRole === UserRole.OWNER
                                  ? 'bg-emerald-500/25 text-emerald-500 border-emerald-500/40'
                                  : 'bg-amber-500/25 text-amber-500 border-amber-500/40'
                              }`}
                            >
                              <Terminal className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black block truncate">
                                  Developer Space & Super Admin
                                </span>
                              </div>
                              <span className={`text-[10px] block truncate ${
                                isDark ? 'text-indigo-300/80' : 'text-indigo-600/80'
                              }`}>
                                Super-Root Access • Role & Settings Master Console
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span
                              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                                currentRole === UserRole.DEVELOPER
                                  ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/35'
                                  : currentRole === UserRole.OWNER
                                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/35'
                                  : 'bg-amber-500/20 text-amber-500 border-amber-500/35'
                              }`}
                            >
                              {currentRole}
                            </span>
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hidden sm:inline-block">
                              Dev Space
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* 2. Switch Operating Branch */}
                        {(onOpenBranchSwitcher || onOpenTenantSwitcher) && (
                          <button
                            type="button"
                            id="header-operating-branch-btn"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (onOpenBranchSwitcher) {
                                onOpenBranchSwitcher();
                              } else if (onOpenTenantSwitcher) {
                                onOpenTenantSwitcher();
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                              isDark
                                ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-emerald-500/40 bg-slate-900/40'
                                : 'hover:bg-slate-100/90 border-slate-200/80 hover:border-emerald-500/40 bg-white/80 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className={`text-xs font-bold block truncate ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>Switch Operating Branch</span>
                                <span className={`text-[10px] block truncate ${
                                  isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  Active: {tenants?.find((t) => t.id === currentTenantId)?.branchName || 'Main Branch'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        )}

                        {/* 2b. Registered Businesses (Multi-Restaurant SaaS Directory) */}
                        {onOpenTenantSwitcher && (
                          <button
                            type="button"
                            id="header-tenant-switcher-btn"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenTenantSwitcher();
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                              isDark
                                ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-emerald-500/40 bg-slate-900/40'
                                : 'hover:bg-slate-100/90 border-slate-200/80 hover:border-emerald-500/40 bg-white/80 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className={`text-xs font-bold block truncate ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>Registered Businesses Directory</span>
                                <span className={`text-[10px] block truncate ${
                                  isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}>
                                  SaaS Network • {tenants?.length || 1} Registered Businesses
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        )}

                        {/* 3. Developer Granular Access & Limits Matrix Shortcut */}
                        {onOpenSuperAdmin && (
                          <button
                            type="button"
                            id="header-dev-access-limits-btn"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              if (currentRole === UserRole.DEVELOPER) {
                                onOpenSuperAdmin('developer_settings', 'access_limits');
                              } else if (onOpenRoleAuthModal) {
                                onOpenRoleAuthModal();
                              } else {
                                onOpenSettings();
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                              isDark
                                ? 'bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-500/35 text-emerald-100'
                                : 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-bold block truncate">Access & Limits (Owners & Staff)</span>
                                <span className={`text-[10px] block truncate ${
                                  isDark ? 'text-emerald-300/70' : 'text-emerald-600/70'
                                }`}>Relocated in Dev Space • Permissions Matrix</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                                Dev Space
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        )}

                        {/* 4. Settings & Admin Controls (Developer Space) */}
                        <button
                          type="button"
                          id="dropdown-menu-settings-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenSettings();
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                            isDark
                              ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-amber-500/40 bg-slate-900/40 text-white'
                              : 'hover:bg-slate-100/90 border-slate-200/80 hover:border-amber-500/40 bg-white/80 shadow-2xs text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/25 flex items-center justify-center shrink-0">
                              <Sliders className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className={`text-xs font-bold block truncate ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}>Settings &amp; Admin Controls</span>
                              <span className={`text-[10px] block truncate ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}>Printers, taxes, layout &amp; store configuration</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 border border-amber-500/30">
                              Settings
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* Trash Bin - 30-Day Soft-Delete Storage */}
                        {onOpenTrashBin && (
                          <button
                            type="button"
                            id="dropdown-trash-bin-btn"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onOpenTrashBin();
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                              isDark
                                ? 'hover:bg-amber-950/40 border-amber-900/40 hover:border-amber-500/50 bg-amber-950/20 text-white'
                                : 'hover:bg-amber-50/80 border-amber-200/80 hover:border-amber-400 bg-amber-50/40 shadow-2xs text-stone-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0">
                                <Trash2 className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold block truncate">Trash Bin</span>
                                  {trashCount !== undefined && trashCount > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-extrabold">
                                      {trashCount}
                                    </span>
                                  )}
                                </div>
                                <span className={`text-[10px] block truncate ${
                                  isDark ? 'text-amber-300/70' : 'text-amber-700/80'
                                }`}>Soft-deleted orders kept for 30 days</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                30-Day
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        )}

                        {/* 5. Clear Analytics & Reports Access Button */}
                        <button
                          type="button"
                          id="dropdown-clear-analytics-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsClearAnalyticsModalOpen(true);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                            isDark
                              ? 'hover:bg-rose-950/60 border-rose-900/60 hover:border-rose-500/50 bg-rose-950/20 text-rose-200'
                              : 'hover:bg-rose-50 border-rose-200/80 hover:border-rose-400 bg-rose-50/50 text-rose-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 flex items-center justify-center shrink-0">
                              <RotateCcw className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">Clear Analytics &amp; Reports</span>
                              <span className={`text-[10px] block truncate ${
                                isDark ? 'text-rose-300/70' : 'text-rose-600/70'
                              }`}>Wipe sales, order histories &amp; reset reports</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                              Clear
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>

                        {/* 6. Delete a Restaurant Access Button */}
                        <button
                          type="button"
                          id="dropdown-delete-restaurant-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setTenantToDeleteId(currentTenantId || (tenants && tenants[0]?.id) || '');
                            setIsDeleteRestaurantModalOpen(true);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                            isDark
                              ? 'hover:bg-red-950/70 border-red-900/70 hover:border-red-500 bg-red-950/30 text-red-200'
                              : 'hover:bg-red-50 border-red-300 hover:border-red-500 bg-red-50/70 text-red-950 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">Delete a Restaurant</span>
                              <span className={`text-[10px] block truncate ${
                                isDark ? 'text-red-300/70' : 'text-red-600/70'
                              }`}>Permanently purge branch, menu &amp; logs</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-600 dark:text-red-300 border border-red-600/40">
                              Delete
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* BUSINESS OWNER: Store Settings & Controls (Owner Only) */}
                  {currentRole === UserRole.OWNER && (
                    <div className="space-y-1.5 mb-1">
                      <button
                        type="button"
                        id="dropdown-owner-settings-btn"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenSettings();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                          isDark
                            ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-emerald-500/40 bg-slate-900/40'
                            : 'hover:bg-slate-100/90 border-slate-200/80 hover:border-emerald-500/40 bg-white/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shrink-0">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>Store Settings &amp; Controls</span>
                            <span className={`text-[10px] block truncate ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>Printers, taxes, receipts &amp; store profile</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                            Settings
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Android App / APK */}
                  {onOpenAndroidAppModal && (
                    <div className="pt-1">
                      <button
                        type="button"
                        id="header-android-btn"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenAndroidAppModal();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                          isDark
                            ? 'hover:bg-slate-800/90 border-slate-800/80 hover:border-emerald-500/40 bg-slate-900/40'
                            : 'hover:bg-slate-100/90 border-slate-200/80 hover:border-emerald-500/40 bg-white/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex items-center justify-center shrink-0">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>{t('nav.android_app', 'Android POS App / APK')}</span>
                            <span className={`text-[10.5px] block truncate ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}>Install on handhelds & Sunmi POS</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                            Android App
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    </div>
                  )}

                  {/* SITUATED IN DROPDOWN MENU SHORTCUTS */}
                  {dropdownTabs.length > 0 && (
                    <div className="pt-2 pb-1 space-y-1">
                      <div className={`text-[10px] uppercase font-black px-2.5 mb-1.5 tracking-wider flex items-center justify-between ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        <span>Situated In Dropdown Menu</span>
                        <span className="font-mono text-[9.5px] text-emerald-600 font-bold">({dropdownTabs.length} tabs)</span>
                      </div>
                      {dropdownTabs.map((comp) => {
                        const mappedTab = TAB_KEY_TO_TAB_TYPE[comp.id];
                        if (!mappedTab) return null;
                        const isActive = isTabActive(comp.id, currentTab);
                        const badgeCount = comp.showBadge !== false ? getTabBadgeCount(comp.id) : undefined;

                        return (
                          <button
                            key={comp.id}
                            type="button"
                            onClick={() => {
                              setIsDropdownOpen(false);
                              onSelectTab(mappedTab);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                              isActive
                                ? isDark
                                  ? 'bg-emerald-600/30 border-emerald-500/60 text-white font-bold shadow-xs'
                                  : 'bg-emerald-600 text-white font-bold shadow-xs'
                                : isDark
                                ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
                                : 'bg-white/80 border-slate-200/80 hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isActive && !isDark ? 'bg-white/20' : 'bg-black/5 dark:bg-white/10'
                              }`}>
                                {renderNavIcon(comp.icon || comp.id, 'w-3.5 h-3.5')}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs truncate block font-bold">
                                  {comp.customLabel || comp.name}
                                </span>
                                {comp.customSubtitle && (
                                  <span className={`text-[10px] truncate block ${
                                    isActive && !isDark ? 'text-white/80' : 'text-slate-400'
                                  }`}>
                                    {comp.customSubtitle}
                                  </span>
                                )}
                              </div>
                            </div>
                            {badgeCount !== undefined && badgeCount > 0 && (
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                                {badgeCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Cloud & Google Account Integration */}
                  <div className={`p-2.5 rounded-xl mt-1 border ${
                    isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/90 border-slate-200'
                  }`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <span>Cloud Account</span>
                      <span className="text-[9px] text-emerald-600 font-mono">Cloud SQL Synced</span>
                    </div>
                    {firebaseUser ? (
                      <div className="space-y-2">
                        <button
                          type="button"
                          id="google-user-profile-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            signOutUser();
                          }}
                          title={`Google Account: ${firebaseUser.displayName || firebaseUser.email} (Synced to Cloud SQL). Tap to sign out.`}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer group active:scale-98 border ${
                            isDark ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60' : 'bg-white hover:bg-slate-100/90 border-slate-200 text-slate-800 shadow-2xs'
                          }`}
                        >
                          {firebaseUser.photoURL ? (
                            <img
                              src={firebaseUser.photoURL}
                              alt={firebaseUser.displayName || 'User'}
                              className="w-8 h-8 rounded-full object-cover border border-emerald-400/80 shadow-xs shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-emerald-700 text-xs font-bold text-white flex items-center justify-center border border-white/30 shrink-0">
                              {firebaseUser.email?.charAt(0).toUpperCase() || 'G'}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className={`text-xs font-bold block truncate ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {firebaseUser.displayName || firebaseUser.email}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-mono block truncate">
                              {firebaseUser.email}
                            </span>
                          </div>
                          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 shrink-0 transition-colors" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        id="google-sign-in-btn"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signInWithGoogle();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-900 text-left transition-all shadow-xs active:scale-98 cursor-pointer border border-slate-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span className="text-xs font-bold text-slate-900">Sign In with Google</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Cloud Sync</span>
                      </button>
                    )}
                  </div>

                  {/* Developer Settings Section (Strictly Developer Only) */}
                  {currentRole === UserRole.DEVELOPER && (
                    <div className={`p-2.5 rounded-2xl mt-2 border space-y-1.5 ${
                      isDark ? 'bg-slate-950/80 border-indigo-900/50' : 'bg-indigo-50/60 border-indigo-200/80'
                    }`}>
                      <div className="flex items-center justify-between px-1 mb-1">
                        <span className={`text-[10.5px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? 'text-indigo-300' : 'text-indigo-900'
                        }`}>
                          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Developer Settings</span>
                        </span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          Dev Root
                        </span>
                      </div>

                      {/* 1. Gemini AI Developer Concierge (Relocated to Developer Settings) */}
                      {onOpenAiAssistant && (
                        <button
                          type="button"
                          id="dropdown-menu-developer-ai-assistant-btn"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenAiAssistant();
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all group active:scale-98 cursor-pointer border ${
                            isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 border-indigo-500/30 hover:border-emerald-500/50 text-white'
                              : 'bg-white hover:bg-slate-50 border-indigo-200 hover:border-emerald-500/50 text-slate-900 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/35 flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold block truncate">
                                Gemini AI Concierge
                              </span>
                              <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Maps Grounding, Search & Chat
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                              Gemini
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </button>
                      )}

                      {/* 2. Developer Layout Mode Toggle */}
                      {onToggleDeveloperMode && (
                        <button
                          type="button"
                          id="dropdown-menu-dev-mode-toggle-btn"
                          onClick={() => {
                            onToggleDeveloperMode();
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all active:scale-98 cursor-pointer ${
                            developerMode
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-xs'
                              : isDark
                              ? 'bg-slate-900/90 hover:bg-slate-800 text-indigo-200 border-indigo-500/30 font-bold'
                              : 'bg-white hover:bg-slate-50 text-indigo-700 border-indigo-200 font-bold shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sliders className="w-3.5 h-3.5" />
                            <span className="text-xs">{developerMode ? 'Developer Mode: ACTIVE' : 'Developer Layout Mode'}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-extrabold ${developerMode ? 'bg-black text-amber-300' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                            {developerMode ? 'ON' : 'OFF'}
                          </span>
                        </button>
                      )}

                      {/* 3. Settings & Admin Controls (Relocated to Developer) */}
                      <button
                        type="button"
                        id="dropdown-menu-dev-admin-settings-btn"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenSettings();
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all group active:scale-98 cursor-pointer ${
                          isDark
                            ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-200 border-indigo-500/30 hover:border-amber-500/50'
                            : 'bg-white hover:bg-amber-50/50 text-amber-950 border-indigo-200 hover:border-amber-400/60 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Sliders className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">Settings &amp; Admin Controls</span>
                            <span className={`text-[10px] block truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Relocated • Printers, taxes &amp; store config
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 border border-amber-500/30 shrink-0">
                          Settings
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

                {/* Fixed Footer: Logout Action */}
                {onLogout && (
                  <div className={`shrink-0 p-2 border-t ${
                    isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <button
                      type="button"
                      id="dropdown-menu-logout-btn"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout();
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all active:scale-98 cursor-pointer border ${
                        isDark
                          ? 'bg-red-950/40 hover:bg-red-900/60 border-red-800/50 text-red-200 hover:text-white'
                          : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sections Bar (Situated in nav_tabs according to Admin Settings) */}
      {config.showNavRow !== false && (navTabs.length > 0 || true) && (
        <div className="max-w-2xl mx-auto px-3 pb-2.5">
          <div
            className={`grid gap-1.5 p-1 rounded-2xl text-center overflow-x-auto transition-all ${
              isWhite
                ? 'bg-slate-100/90 border border-slate-200 shadow-xs'
                : isDark
                ? 'bg-black/40 border border-white/10'
                : 'bg-black/25 border border-white/15'
            }`}
            style={{
              gridTemplateColumns: `repeat(${Math.max(navTabs.length || 3, 1)}, minmax(0, 1fr))`,
            }}
          >
            {(navTabs.length > 0
              ? navTabs
              : [config.components.tab_order, config.components.tab_order_received, config.components.tab_order_completed].filter(Boolean)
            ).map((comp) => {
              const mappedTab = TAB_KEY_TO_TAB_TYPE[comp.id] || 'order';
              const isActive = isTabActive(comp.id, currentTab);
              const badgeCount = comp.showBadge !== false ? getTabBadgeCount(comp.id) : undefined;
              const displayLabel = comp.customLabel || comp.name;

              return (
                <button
                  key={comp.id}
                  type="button"
                  id={`bar-tab-${comp.id}`}
                  onClick={() => onSelectTab(mappedTab)}
                  title={comp.customSubtitle || displayLabel}
                  className={`relative py-2 px-1 rounded-xl text-[11.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    isActive
                      ? isWhite
                        ? 'bg-emerald-700 text-white shadow-sm font-black'
                        : 'bg-white text-[#143529] shadow-sm'
                      : isWhite
                      ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 font-semibold'
                      : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
                  }`}
                >
                  {renderNavIcon(comp.icon || comp.id, 'w-3.5 h-3.5 shrink-0')}
                  <span className="truncate">{displayLabel}</span>
                  {badgeCount !== undefined && badgeCount > 0 && (
                    <span
                      className={`text-[9px] font-extrabold px-1.5 rounded-full min-w-[14px] ${
                        comp.id === 'tab_order_received'
                          ? 'bg-[#b3402f] text-white'
                          : 'bg-[#c8791f] text-white'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Editable Logo & Branding Modal */}
      <LogoEditorModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogoUrl={logoUrl}
        currentName={restaurantName}
        currentTagline={tagline}
        onSave={(updates) => {
          onUpdateBranding?.(updates);
        }}
      />

      {/* Top Bar Components & Layout Customizer Modal (Admin Control) */}
      {isTopBarCustomizerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <TopBarSettingsPanel
              currentConfig={config}
              settings={
                {
                  restaurantName,
                  tagline,
                  logoUrl,
                  language,
                } as any
              }
              onSaveConfig={(newConfig) => {
                onUpdateTopBarConfig?.(newConfig);
                setIsTopBarCustomizerOpen(false);
              }}
              onClose={() => setIsTopBarCustomizerOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear Analytics & Reports */}
      {isClearAnalyticsModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-rose-200 dark:border-rose-900/50 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-rose-900 dark:text-rose-200">
                  Clear Analytics &amp; Reports
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {restaurantName || 'Active Restaurant'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to clear all analytics and reports? This will reset all live order histories, daily sales metrics, debt ledger logs, and reporting summaries for this restaurant. This action cannot be reversed.
            </p>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>Menu items, recipes, staff logins, and thermal printer setups will remain safe.</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsClearAnalyticsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-clear-analytics-btn"
                onClick={() => {
                  onResetAnalytics?.();
                  onResetAllReports?.('CONFIRM_RESET');
                  setIsClearAnalyticsModalOpen(false);
                  setActionSuccessNotice('All analytics and reports have been reset successfully.');
                  setTimeout(() => setActionSuccessNotice(null), 4000);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Yes, Clear Analytics &amp; Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete a Restaurant */}
      {isDeleteRestaurantModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-red-200 dark:border-red-900/50 shadow-2xl space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-red-900 dark:text-red-200">
                  Delete a Restaurant
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Irreversible branch deletion
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Select the restaurant instance you wish to permanently delete. All associated menus, inventory logs, sales orders, staff records, and databases will be permanently purged.
            </p>

            {tenants && tenants.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Restaurant to Delete
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-950/40">
                  {tenants.map((t) => {
                    const isSelected = (tenantToDeleteId || currentTenantId) === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTenantToDeleteId(t.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-red-500/10 border-red-500/50 text-red-900 dark:text-red-200 font-bold'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <Store className="w-4 h-4 text-red-500 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">{t.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{t.tagline || t.currency || t.id}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                            Selected
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-[11px] text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <span>
                Permanent action. Cannot be recovered or restored after execution.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteRestaurantModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-restaurant-btn"
                onClick={() => {
                  const targetId = tenantToDeleteId || currentTenantId;
                  if (targetId && onDeleteTenant) {
                    onDeleteTenant(targetId);
                    setIsDeleteRestaurantModalOpen(false);
                    setActionSuccessNotice('The restaurant has been permanently deleted.');
                    setTimeout(() => setActionSuccessNotice(null), 4000);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Permanently Delete Restaurant</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {actionSuccessNotice && (
        <div className="fixed top-20 right-6 z-80 max-w-sm w-full bg-emerald-700 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          <span className="text-xs font-bold">{actionSuccessNotice}</span>
        </div>
      )}
    </header>
  );
};
