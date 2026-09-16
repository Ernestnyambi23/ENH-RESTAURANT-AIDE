import React, { useState, useMemo } from 'react';
import {
  TopBarComponentSetting,
  TopBarLayoutConfig,
  TopBarPlacement,
  RestaurantSettings,
} from '../types';
import {
  DEFAULT_TOPBAR_COMPONENTS,
  DEFAULT_TOPBAR_CONFIG,
  PRESET_TOPBAR_LAYOUTS,
  resolveTopBarConfig,
  saveTopBarConfigToLocalStorage,
} from '../utils/topBarConfig';
import {
  Sliders,
  Eye,
  EyeOff,
  Pencil,
  Check,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Layers,
  Save,
  Smartphone,
  Store,
  Bell,
  ShoppingBag,
  MoreVertical,
  UtensilsCrossed,
  CheckSquare,
  CheckCircle2,
  Clock,
  Boxes,
  Receipt,
  ListOrdered,
  Wallet,
  Users,
  BarChart3,
  Shield,
  Heading,
  Image as ImageIcon,
  Search,
  Layout,
  AlignLeft,
  AlignCenter,
  X,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

interface TopBarSettingsPanelProps {
  currentConfig?: TopBarLayoutConfig | null;
  settings: RestaurantSettings;
  onSaveConfig: (newConfig: TopBarLayoutConfig) => void;
  onClose?: () => void;
  isModal?: boolean;
}

// Icon mapper for components
function renderComponentIcon(iconName?: string, className = 'w-4 h-4') {
  switch (iconName) {
    case 'Image':
      return <ImageIcon className={className} />;
    case 'Heading':
      return <Heading className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Bell':
      return <Bell className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'MoreVertical':
      return <MoreVertical className={className} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />;
    case 'CheckSquare':
      return <CheckSquare className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Boxes':
      return <Boxes className={className} />;
    case 'Receipt':
      return <Receipt className={className} />;
    case 'ListOrdered':
      return <ListOrdered className={className} />;
    case 'Smartphone':
      return <Smartphone className={className} />;
    case 'Wallet':
      return <Wallet className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'BarChart3':
      return <BarChart3 className={className} />;
    case 'Sliders':
    default:
      return <Sliders className={className} />;
  }
}

const PLACEMENT_OPTIONS: { id: TopBarPlacement; label: string; shortLabel: string; desc: string }[] = [
  { id: 'header_left', label: 'Top Bar (Left Side)', shortLabel: 'Left Header', desc: 'Situated at the top left of the header' },
  { id: 'header_center', label: 'Top Bar (Center)', shortLabel: 'Center Header', desc: 'Centered prominently in the main header' },
  { id: 'header_right', label: 'Top Bar (Right Side)', shortLabel: 'Right Header', desc: 'Action controls on the top right' },
  { id: 'nav_tabs', label: 'Primary Navigation Bar', shortLabel: 'Nav Tabs Row', desc: 'Directly visible in the sub-header tabs row' },
  { id: 'dropdown_menu', label: 'Inside 3-Dot Dropdown Menu', shortLabel: 'Dropdown (⋮)', desc: 'Hidden under the ⋮ menu for clean layout' },
  { id: 'hidden', label: 'Hidden / Disabled', shortLabel: 'Hidden', desc: 'Completely omitted from top bar navigation' },
];

export const TopBarSettingsPanel: React.FC<TopBarSettingsPanelProps> = ({
  currentConfig,
  settings,
  onSaveConfig,
  onClose,
  isModal = false,
}) => {
  // Working draft state
  const [config, setConfig] = useState<TopBarLayoutConfig>(() => resolveTopBarConfig(currentConfig));
  const [filterType, setFilterType] = useState<'all' | 'header' | 'tabs'>('all');
  const [placementFilter, setPlacementFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedToast, setSavedToast] = useState<boolean>(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);

  const componentList = useMemo(() => {
    const list = Object.values(config.components) as TopBarComponentSetting[];
    return list.sort((a, b) => {
      // First sort by type, then by placement, then by order
      if (a.placement !== b.placement) {
        return a.placement.localeCompare(b.placement);
      }
      return a.order - b.order;
    });
  }, [config.components]);

  const filteredComponents = useMemo(() => {
    return componentList.filter((comp) => {
      if (filterType === 'header' && comp.type !== 'header_element') return false;
      if (filterType === 'tabs' && comp.type !== 'nav_tab') return false;
      if (placementFilter !== 'all' && comp.placement !== placementFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = comp.name.toLowerCase().includes(query);
        const matchesCustom = comp.customLabel.toLowerCase().includes(query);
        const matchesPlacement = comp.placement.toLowerCase().includes(query);
        return matchesName || matchesCustom || matchesPlacement;
      }
      return true;
    });
  }, [componentList, filterType, placementFilter, searchQuery]);

  // Handler to rename or update single component
  const handleUpdateComponent = (id: string, updates: Partial<TopBarComponentSetting>) => {
    setConfig((prev) => {
      const existing = prev.components[id] || DEFAULT_TOPBAR_COMPONENTS[id];
      if (!existing) return prev;
      return {
        ...prev,
        components: {
          ...prev.components,
          [id]: {
            ...existing,
            ...updates,
          },
        },
        updatedAt: Date.now(),
      };
    });
  };

  // Reorder items within the same placement zone
  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    sound.playClick();
    triggerHaptic('light');

    const targetComp = config.components[id];
    if (!targetComp) return;

    // Get all components sharing this placement
    const siblings = (Object.values(config.components) as TopBarComponentSetting[])
      .filter((c) => c.placement === targetComp.placement)
      .sort((a, b) => a.order - b.order);

    const currentIndex = siblings.findIndex((c) => c.id === id);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= siblings.length) return;

    const swapComp = siblings[swapIndex];

    setConfig((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [targetComp.id]: {
          ...targetComp,
          order: swapComp.order,
        },
        [swapComp.id]: {
          ...swapComp,
          order: targetComp.order,
        },
      },
      updatedAt: Date.now(),
    }));
  };

  // Apply a preset
  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESET_TOPBAR_LAYOUTS[presetKey];
    if (!preset) return;

    sound.playSuccess();
    triggerHaptic('medium');

    const newConfig: TopBarLayoutConfig = {
      ...DEFAULT_TOPBAR_CONFIG,
      ...preset.config,
      components: {
        ...config.components,
        ...(preset.config.components || {}),
      },
      updatedAt: Date.now(),
    };

    setConfig(newConfig);
  };

  // Reset to system defaults
  const handleResetToDefaults = () => {
    sound.playClick();
    triggerHaptic('warning');
    setConfig({ ...DEFAULT_TOPBAR_CONFIG, updatedAt: Date.now() });
  };

  // Save changes
  const handleSave = () => {
    sound.playSuccess();
    triggerHaptic('success');
    saveTopBarConfigToLocalStorage(config);
    onSaveConfig(config);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Count placements
  const countsByPlacement = useMemo(() => {
    const counts: Record<string, number> = {
      header_left: 0,
      header_center: 0,
      header_right: 0,
      nav_tabs: 0,
      dropdown_menu: 0,
      hidden: 0,
    };
    (Object.values(config.components) as TopBarComponentSetting[]).forEach((c) => {
      if (counts[c.placement] !== undefined) {
        counts[c.placement]++;
      }
    });
    return counts;
  }, [config.components]);

  return (
    <div className={`flex flex-col bg-[#fbfdfc] text-slate-800 ${isModal ? 'max-h-[85vh] overflow-hidden rounded-2xl' : 'w-full'}`}>
      {/* Top Banner / Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#143529] via-[#1f4d3e] to-[#122e23] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#143529]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Top Bar & Components Setting
              </h2>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-mono">
                Admin Control
              </span>
            </div>
            <p className="text-xs text-emerald-100/80">
              Rename components, customize titles, and choose where each element and navigation tab is situated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Reset to original system defaults"
            className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
          <button
            type="button"
            id="save-topbar-config-btn"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Apply</span>
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {savedToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-1">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-white" />
            Top Bar layout & renamed components applied successfully!
          </span>
          <span className="text-[10px] opacity-80">Saved to Cloud & Storage</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(85vh-130px)] space-y-5">
        {/* LIVE PREVIEW HUD */}
        <div className="p-3.5 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-emerald-700" />
              Live Top Bar Placement Simulation
            </span>
            <span className="text-[10px] text-amber-700 font-mono">
              Alignment: {config.headerAlignment || 'Standard Left-Right'}
            </span>
          </div>

          {/* Mini simulated top bar */}
          <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              {/* Left Zone */}
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                {(Object.values(config.components) as TopBarComponentSetting[])
                  .filter((c) => c.visible && c.placement === 'header_left')
                  .sort((a, b) => a.order - b.order)
                  .map((comp) => (
                    <span
                      key={comp.id}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1 truncate"
                    >
                      {renderComponentIcon(comp.icon, 'w-3 h-3 text-emerald-700')}
                      <span>{comp.customLabel || comp.name}</span>
                    </span>
                  ))}
              </div>

              {/* Center Zone */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {(Object.values(config.components) as TopBarComponentSetting[])
                  .filter((c) => c.visible && c.placement === 'header_center')
                  .sort((a, b) => a.order - b.order)
                  .map((comp) => (
                    <span
                      key={comp.id}
                      className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1"
                    >
                      {renderComponentIcon(comp.icon, 'w-3 h-3 text-amber-700')}
                      <span>{comp.customLabel || comp.name}</span>
                    </span>
                  ))}
              </div>

              {/* Right Zone */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {(Object.values(config.components) as TopBarComponentSetting[])
                  .filter((c) => c.visible && c.placement === 'header_right')
                  .sort((a, b) => a.order - b.order)
                  .map((comp) => (
                    <span
                      key={comp.id}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold flex items-center gap-1"
                    >
                      {renderComponentIcon(comp.icon, 'w-3 h-3 text-slate-700')}
                      <span>{comp.customLabel || comp.name}</span>
                      {comp.showBadge && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </span>
                  ))}
              </div>
            </div>

            {/* Sub-Header Tabs Simulation */}
            <div className="pt-1.5 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0">Tabs Row:</span>
              {(Object.values(config.components) as TopBarComponentSetting[])
                .filter((c) => c.visible && c.placement === 'nav_tabs')
                .sort((a, b) => a.order - b.order)
                .map((comp) => (
                  <span
                    key={comp.id}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-emerald-800 flex items-center gap-1 shrink-0"
                  >
                    {renderComponentIcon(comp.icon, 'w-3 h-3 text-emerald-700')}
                    <span>{comp.customLabel || comp.name}</span>
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* PRESET TEMPLATES BAR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Quick One-Click Layout Presets
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-500 font-medium">Alignment Style:</span>
              <button
                type="button"
                onClick={() => setConfig((p) => ({ ...p, headerAlignment: 'left_right' }))}
                className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                  config.headerAlignment === 'left_right' ? 'bg-[#1f4d3e] text-white border-[#1f4d3e]' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <AlignLeft className="w-3 h-3 inline mr-1" />
                Left-Spread
              </button>
              <button
                type="button"
                onClick={() => setConfig((p) => ({ ...p, headerAlignment: 'center_brand' }))}
                className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                  config.headerAlignment === 'center_brand' ? 'bg-[#1f4d3e] text-white border-[#1f4d3e]' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <AlignCenter className="w-3 h-3 inline mr-1" />
                Center Brand
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Object.entries(PRESET_TOPBAR_LAYOUTS).map(([key, p]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group active:scale-98 shadow-xs"
              >
                <div className="text-xs font-extrabold text-[#143529] group-hover:text-emerald-800">
                  {p.label}
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-2">
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* FILTER & SEARCH BAR */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Type tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'all' ? 'bg-white text-[#143529] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Components ({componentList.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('header')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'header' ? 'bg-white text-[#143529] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Header Elements (7)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('tabs')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'tabs' ? 'bg-white text-[#143529] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Navigation Tabs (12)
              </button>
            </div>

            {/* Placement filter */}
            <div className="flex items-center gap-2">
              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Placements (Anywhere)</option>
                <option value="header_left">Situated: Header Left ({countsByPlacement.header_left})</option>
                <option value="header_center">Situated: Header Center ({countsByPlacement.header_center})</option>
                <option value="header_right">Situated: Header Right ({countsByPlacement.header_right})</option>
                <option value="nav_tabs">Situated: Primary Nav Tabs ({countsByPlacement.nav_tabs})</option>
                <option value="dropdown_menu">Situated: Dropdown Menu (⋮) ({countsByPlacement.dropdown_menu})</option>
                <option value="hidden">Situated: Hidden ({countsByPlacement.hidden})</option>
              </select>

              {/* Search box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name or label..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-36 sm:w-44"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LIST OF COMPONENTS TO EDIT, RENAME & SITUATE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>
              Showing {filteredComponents.length} component{filteredComponents.length === 1 ? '' : 's'} to edit & position:
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">
              Changes update immediately in preview
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredComponents.map((comp) => {
              const isEditing = activeEditingId === comp.id;

              return (
                <div
                  key={comp.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    !comp.visible || comp.placement === 'hidden'
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 shadow-xs hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Component Info & Rename Header */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          backgroundColor: `${comp.color || '#10b981'}18`,
                          borderColor: `${comp.color || '#10b981'}40`,
                          borderWidth: '1px',
                          color: comp.color || '#10b981',
                        }}
                      >
                        {renderComponentIcon(comp.icon, 'w-5 h-5')}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-slate-900">
                            {comp.name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            ID: {comp.id}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              comp.type === 'header_element'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {comp.type === 'header_element' ? 'Header Bar' : 'Navigation Tab'}
                          </span>
                        </div>

                        {/* Editable Rename Input Box */}
                        <div className="flex items-center gap-2 pt-0.5 max-w-lg">
                          <div className="relative flex-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                              Custom Label / Renamed Display:
                            </label>
                            <input
                              type="text"
                              value={comp.customLabel}
                              onChange={(e) =>
                                handleUpdateComponent(comp.id, {
                                  customLabel: e.target.value,
                                })
                              }
                              placeholder={
                                comp.id === 'brand_title'
                                  ? settings.restaurantName || 'Restaurant Name'
                                  : comp.name
                              }
                              className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 shadow-xs"
                            />
                          </div>

                          {/* Secondary Tagline / Subtitle if applicable */}
                          {comp.id === 'brand_title' && (
                            <div className="relative flex-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                                Subtitle / Tagline:
                              </label>
                              <input
                                type="text"
                                value={comp.customSubtitle ?? ''}
                                onChange={(e) =>
                                  handleUpdateComponent(comp.id, {
                                    customSubtitle: e.target.value,
                                  })
                                }
                                placeholder={settings.tagline || 'Tagline'}
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 shadow-xs"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Situation / Placement & Controls */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Placement Selector */}
                      <div className="space-y-0.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Where Situated:
                        </label>
                        <select
                          value={comp.placement}
                          onChange={(e) => {
                            const newPlacement = e.target.value as TopBarPlacement;
                            handleUpdateComponent(comp.id, {
                              placement: newPlacement,
                              visible: newPlacement !== 'hidden',
                            });
                          }}
                          className={`px-3 py-1.5 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                            comp.placement === 'header_left'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : comp.placement === 'header_center'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : comp.placement === 'header_right'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : comp.placement === 'nav_tabs'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : comp.placement === 'dropdown_menu'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          {PLACEMENT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              📍 {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Reordering Controls (Order Priority) */}
                      <div className="space-y-0.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
                          Order #{comp.order}
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(comp.id, 'up')}
                            title="Move earlier in order"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-95 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(comp.id, 'down')}
                            title="Move later in order"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 active:scale-95 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Visibility Toggle */}
                      <div className="space-y-0.5">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
                          Visible
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateComponent(comp.id, {
                              visible: !comp.visible,
                              placement: !comp.visible && comp.placement === 'hidden' ? 'nav_tabs' : comp.placement,
                            })
                          }
                          className={`p-1.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            comp.visible && comp.placement !== 'hidden'
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-200 text-slate-500 border-slate-300'
                          }`}
                          title={comp.visible ? 'Visible on top bar' : 'Hidden from top bar'}
                        >
                          {comp.visible && comp.placement !== 'hidden' ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Badge count toggle if supported */}
                      {comp.showBadge !== undefined && (
                        <div className="space-y-0.5">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">
                            Badge
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateComponent(comp.id, {
                                showBadge: !comp.showBadge,
                              })
                            }
                            className={`px-2 py-1 rounded-xl text-[10.5px] font-bold border transition-all ${
                              comp.showBadge
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                            title="Toggle active count badge indicator"
                          >
                            {comp.showBadge ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="text-[11px] text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {countsByPlacement.nav_tabs} tabs on primary bar • {countsByPlacement.header_left + countsByPlacement.header_center + countsByPlacement.header_right} header controls • {countsByPlacement.dropdown_menu} in dropdown menu
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save & Apply Top Bar Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
