import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  Zap,
  Eye,
  Settings,
  Sliders,
  Check,
  X,
  RotateCcw,
  Search,
  Filter,
  Save,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  Users,
  Crown,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Terminal,
} from 'lucide-react';
import {
  UserRole,
  RolePermissionCategory,
  RolePermissionRisk,
  RolePermissionItem,
  RolePermissionsConfig,
  ROLE_PERMISSIONS_REGISTRY,
  getDefaultRolePermissionsConfig,
  applyPresetPermissions,
} from '../utils/rbac';

interface DeveloperPermissionsPanelProps {
  currentConfig?: RolePermissionsConfig;
  onSaveConfig: (newConfig: RolePermissionsConfig) => void;
  activeBranchName?: string;
  ownersCount?: number;
  staffCount?: number;
}

export const DeveloperPermissionsPanel: React.FC<DeveloperPermissionsPanelProps> = ({
  currentConfig,
  onSaveConfig,
  activeBranchName = 'Current Location',
  ownersCount = 1,
  staffCount = 5,
}) => {
  // Local working copy of permissions config
  const [config, setConfig] = useState<RolePermissionsConfig>(() => {
    return currentConfig || getDefaultRolePermissionsConfig();
  });

  // Selected role view: 'owner' | 'staff' | 'matrix'
  const [activeRoleView, setActiveRoleView] = useState<'owner' | 'staff' | 'matrix'>('owner');

  // Selected category filter
  const [activeCategory, setActiveCategory] = useState<'all' | RolePermissionCategory>('all');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Risk filter
  const [riskFilter, setRiskFilter] = useState<'all' | RolePermissionRisk>('all');

  // Toast / Save feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync if currentConfig changes from outside
  React.useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
      setHasUnsavedChanges(false);
    }
  }, [currentConfig]);

  // Handle single toggle
  const handleToggle = (role: 'owner' | 'staff', permId: string) => {
    setConfig((prev) => {
      const roleMap = { ...prev[role] };
      const currentVal = roleMap[permId] ?? false;
      roleMap[permId] = !currentVal;

      const next = {
        ...prev,
        [role]: roleMap,
        updatedAt: Date.now(),
        updatedBy: 'developer',
      };
      setHasUnsavedChanges(true);
      return next;
    });
  };

  // Batch toggle all visible in category
  const handleBatchToggle = (role: 'owner' | 'staff', grant: boolean) => {
    setConfig((prev) => {
      const roleMap = { ...prev[role] };
      filteredItems.forEach((item) => {
        // Developer infra and wipe shouldn't be bulk-granted by accident unless explicitly intended
        if (grant && (item.id === 'settings_developer_bypass' || item.id === 'fn_wipe_branch_data')) {
          return;
        }
        roleMap[item.id] = grant;
      });

      setHasUnsavedChanges(true);
      return {
        ...prev,
        [role]: roleMap,
        updatedAt: Date.now(),
        updatedBy: 'developer_batch',
      };
    });
  };

  // Preset handler
  const handleApplyPreset = (
    preset: 'balanced' | 'strict_staff' | 'cashier_only' | 'kitchen_only' | 'full_owner' | 'default'
  ) => {
    const newConfig = applyPresetPermissions(preset);
    setConfig(newConfig);
    setHasUnsavedChanges(true);

    const presetNames: Record<string, string> = {
      balanced: 'Standard Balanced Profile',
      strict_staff: 'Strict Staff Lockdown',
      cashier_only: 'Cashier-Only Profile',
      kitchen_only: 'Kitchen KDS Only Profile',
      full_owner: 'Full Autonomous Owner Profile',
      default: 'System Factory Defaults',
    };

    setSaveToast(`Applied "${presetNames[preset]}". Click Save to deploy!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Save handler
  const handleSave = () => {
    onSaveConfig(config);
    setHasUnsavedChanges(false);
    setSaveToast('Role Access & Limits successfully saved and deployed live!');
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return ROLE_PERMISSIONS_REGISTRY.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Risk filter
      if (riskFilter !== 'all' && item.riskLevel !== riskFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesTab = item.associatedTab?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesDesc && !matchesId && !matchesTab) {
          return false;
        }
      }
      return true;
    });
  }, [activeCategory, riskFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = ROLE_PERMISSIONS_REGISTRY.length;
    let ownerGranted = 0;
    let staffGranted = 0;

    ROLE_PERMISSIONS_REGISTRY.forEach((item) => {
      if (config.owner?.[item.id]) ownerGranted++;
      if (config.staff?.[item.id]) staffGranted++;
    });

    return {
      total,
      ownerGranted,
      ownerRestricted: total - ownerGranted,
      staffGranted,
      staffRestricted: total - staffGranted,
      functionCount: ROLE_PERMISSIONS_REGISTRY.filter((i) => i.category === 'function').length,
      viewCount: ROLE_PERMISSIONS_REGISTRY.filter((i) => i.category === 'view').length,
      settingsCount: ROLE_PERMISSIONS_REGISTRY.filter((i) => i.category === 'settings').length,
    };
  }, [config]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOP HERO HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-violet-600/5 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-indigo-600/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Developer Space Master Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Live Runtime Enforcement
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Scope: <strong className="text-white">{activeBranchName}</strong>
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Access & Limits Control</span>
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Owners & Staff Matrix
              </span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Select and configure every explicit access and restriction on <strong className="text-white">Functions</strong> (orders, voids, discounts, inventory, finances), <strong className="text-white">Views</strong> (screens, reports, salaries, debts), and <strong className="text-white">Settings</strong> (store identity, taxes, printers, staff) for Business Owners and their Staff.
            </p>
          </div>

          {/* Master Developer Root Bypass Guarantee Banner */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 lg:w-80 shrink-0 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Developer Root Immunity</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                100% BYPASS
              </span>
            </div>
            <p className="text-[11.5px] text-slate-300 leading-normal">
              Developer accounts retain permanent, irrevocable master access across all functions, screens, and settings regardless of owner or staff toggles.
            </p>
            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Active Owners: <strong className="text-white">{ownersCount}</strong></span>
              <span>Active Staff: <strong className="text-white">{staffCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Action & Save Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                Unsaved modifications pending
              </span>
            )}
            {saveToast && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saveToast}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('default')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-2 shadow-sm cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 ring-2 ring-emerald-400/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/30'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{hasUnsavedChanges ? 'Save & Deploy Live' : 'Deployed & Up to Date'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FAST PRESET CONFIGURATION BUTTONS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Developer Quick-Setup Presets</span>
          </span>
          <span className="text-[11px] text-slate-400">Click to instantly populate recommended policy</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('balanced')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 hover:shadow-xs text-left transition group cursor-pointer"
          >
            <span className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600">
              Standard Balanced
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5">
              Standard owner full + staff transactional
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('strict_staff')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-rose-300 hover:shadow-xs text-left transition group cursor-pointer"
          >
            <span className="block text-xs font-bold text-slate-900 group-hover:text-rose-600">
              Strict Staff Lockdown
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5">
              No discounts, voids, debts or price alters
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('cashier_only')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300 hover:shadow-xs text-left transition group cursor-pointer"
          >
            <span className="block text-xs font-bold text-slate-900 group-hover:text-blue-600">
              Cashier-Only Shift
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5">
              Orders + M-Pesa + debts; locks kitchen & stock
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('kitchen_only')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-xs text-left transition group cursor-pointer"
          >
            <span className="block text-xs font-bold text-slate-900 group-hover:text-emerald-600">
              Kitchen KDS Only
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5">
              KDS prep queue & shopping list only; locks POS
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('full_owner')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-300 hover:shadow-xs text-left transition group cursor-pointer"
          >
            <span className="block text-xs font-bold text-slate-900 group-hover:text-purple-600">
              Autonomous Owner
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5">
              100% store control; locks dev root bypass
            </span>
          </button>
        </div>
      </div>

      {/* 3. AUDIT STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Business Owners Audit */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeRoleView === 'owner'
            ? 'bg-amber-500/10 border-amber-400 shadow-xs'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-slate-900">Business Owners</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Role: OWNER
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.ownerGranted}</span>
            <span className="text-xs text-slate-500">of {metrics.total} accesses granted</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.ownerGranted / metrics.total) * 100}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold">{metrics.ownerGranted} Active</span>
            <span className="text-rose-600 font-bold">{metrics.ownerRestricted} Limited</span>
          </div>
        </div>

        {/* Staff Members Audit */}
        <div className={`p-4 rounded-2xl border transition-all ${
          activeRoleView === 'staff'
            ? 'bg-blue-500/10 border-blue-400 shadow-xs'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-bold text-slate-900">Their Staff</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Role: STAFF
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.staffGranted}</span>
            <span className="text-xs text-slate-500">of {metrics.total} accesses granted</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(metrics.staffGranted / metrics.total) * 100}%` }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-600 font-bold">{metrics.staffGranted} Active</span>
            <span className="text-rose-600 font-bold">{metrics.staffRestricted} Limited</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-bold text-slate-900">3-Pillar Scope</span>
            </div>
            <span className="text-xs font-mono font-bold text-purple-600">
              {metrics.total} Controls
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-xs font-extrabold text-indigo-600">{metrics.functionCount}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Functions</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-xs font-extrabold text-purple-600">{metrics.viewCount}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Views</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-xs font-extrabold text-amber-600">{metrics.settingsCount}</span>
              <span className="block text-[10px] text-slate-500 uppercase font-bold">Settings</span>
            </div>
          </div>
          <div className="mt-2.5 text-center text-[10.5px] text-slate-400">
            Developer selects limits for each pillar individually
          </div>
        </div>
      </div>

      {/* 4. TARGET ROLE SWITCHER + CATEGORY SELECTOR + FILTER TOOLBAR */}
      <div className="space-y-3">
        {/* Role Perspective Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/90 p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveRoleView('owner')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeRoleView === 'owner'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-900" />
              <span>Business Owners Access</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/15 font-bold">
                {metrics.ownerGranted}/{metrics.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleView('staff')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeRoleView === 'staff'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-blue-200" />
              <span>Their Staff Access</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/20 font-bold">
                {metrics.staffGranted}/{metrics.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleView('matrix')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                activeRoleView === 'matrix'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
              <span>Side-by-Side Comparison Matrix</span>
            </button>
          </div>

          {/* Batch Actions for current role */}
          {activeRoleView !== 'matrix' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBatchToggle(activeRoleView, true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 bg-white transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Grant All in View</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchToggle(activeRoleView, false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 bg-white transition cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Restrict All in View</span>
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs: Function, View, Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>All Controls ({metrics.total})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('function')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeCategory === 'function'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Functions & Actions ({metrics.functionCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('view')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeCategory === 'view'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-purple-300" />
              <span>2. Views & Screens ({metrics.viewCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeCategory === 'settings'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-amber-300" />
              <span>3. Settings & Config ({metrics.settingsCount})</span>
            </button>
          </div>

          {/* Search and Risk Level Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search accesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Risk filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Risks</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
              <option value="critical">Critical Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. PERMISSIONS ITEMS LIST / MATRIX */}
      {activeRoleView === 'matrix' ? (
        /* SIDE-BY-SIDE MATRIX VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-4 w-72">Access / Limit Control</th>
                  <th className="py-3.5 px-4 w-32">Category</th>
                  <th className="py-3.5 px-4 w-28">Risk</th>
                  <th className="py-3.5 px-4 text-center w-36 bg-amber-500/5 text-amber-900 border-x border-slate-200">
                    Business Owners
                  </th>
                  <th className="py-3.5 px-4 text-center w-36 bg-blue-500/5 text-blue-900 border-r border-slate-200">
                    Their Staff
                  </th>
                  <th className="py-3.5 px-4 text-center w-40 bg-slate-900 text-slate-200">
                    Developer Master
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item) => {
                  const ownerGranted = config.owner?.[item.id] ?? false;
                  const staffGranted = config.staff?.[item.id] ?? false;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</div>
                        {item.associatedTab && (
                          <span className="inline-block mt-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            Tab: {item.associatedTab}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase ${
                          item.category === 'function'
                            ? 'bg-indigo-100 text-indigo-700'
                            : item.category === 'view'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.category === 'function' && <Zap className="w-2.5 h-2.5" />}
                          {item.category === 'view' && <Eye className="w-2.5 h-2.5" />}
                          {item.category === 'settings' && <Settings className="w-2.5 h-2.5" />}
                          <span>{item.category}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.riskLevel === 'low'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.riskLevel === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : item.riskLevel === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.riskLevel}
                        </span>
                      </td>

                      {/* Owner Switch */}
                      <td className="py-3.5 px-4 text-center bg-amber-500/5 border-x border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleToggle('owner', item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            ownerGranted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {ownerGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{ownerGranted ? 'Granted' : 'Limited'}</span>
                        </button>
                      </td>

                      {/* Staff Switch */}
                      <td className="py-3.5 px-4 text-center bg-blue-500/5 border-r border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleToggle('staff', item.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            staffGranted
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {staffGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{staffGranted ? 'Granted' : 'Limited'}</span>
                        </button>
                      </td>

                      {/* Developer Root Bypass */}
                      <td className="py-3.5 px-4 text-center bg-slate-900 text-slate-300">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                          <Lock className="w-3 h-3 text-amber-400" />
                          Root Bypass
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SINGLE ROLE INTERACTIVE CARD LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const currentRoleKey = activeRoleView; // 'owner' | 'staff'
            const isGranted = config[currentRoleKey]?.[item.id] ?? false;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                  isGranted
                    ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                    : 'bg-slate-50/80 border-slate-200/60 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.category === 'function'
                          ? 'bg-indigo-100 text-indigo-700'
                          : item.category === 'view'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.category === 'function' && <Zap className="w-2.5 h-2.5" />}
                        {item.category === 'view' && <Eye className="w-2.5 h-2.5" />}
                        {item.category === 'settings' && <Settings className="w-2.5 h-2.5" />}
                        <span>{item.category}</span>
                      </span>

                      <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase ${
                        item.riskLevel === 'low'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.riskLevel === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : item.riskLevel === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.riskLevel} risk
                      </span>

                      {item.associatedTab && (
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Tab: {item.associatedTab}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.name}
                    </h4>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggle(currentRoleKey, item.id)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isGranted
                          ? currentRoleKey === 'owner'
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                          : 'bg-slate-300'
                      }`}
                      role="switch"
                      aria-checked={isGranted}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          isGranted ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isGranted
                        ? currentRoleKey === 'owner' ? 'text-amber-700' : 'text-blue-700'
                        : 'text-slate-400'
                    }`}>
                      {isGranted ? 'Access Allowed' : 'Restricted'}
                    </span>
                  </div>
                </div>

                {/* Warning if staff has dangerous permissions */}
                {currentRoleKey === 'staff' && isGranted && item.riskLevel === 'critical' && (
                  <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span><strong>Security Notice:</strong> Critical permission is active on staff role.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. BOTTOM FOOTER DEPLOYMENT BAR */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-xs block text-white">Developer Security Protocol</span>
            <span className="text-[11px] text-slate-400">
              All role permission limits are stored persistently and evaluated at runtime by RBAC gates.
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save & Apply Permissions</span>
        </button>
      </div>
    </div>
  );
};

export default DeveloperPermissionsPanel;
