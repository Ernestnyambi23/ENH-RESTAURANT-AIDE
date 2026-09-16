import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  RefreshCw,
  Sparkles,
  Store,
  Palette,
  Pizza,
  Coffee,
  Flame,
  ChefHat,
  Beer,
  Wine,
  Cake,
  Fish,
  Soup,
  UtensilsCrossed,
  Beef,
  LucideIcon,
} from 'lucide-react';

export interface LogoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  currentName: string;
  currentTagline: string;
  currentThemeColor?: string;
  currentIcon?: string;
  currentBranchName?: string;
  onSave: (data: {
    logoUrl: string;
    name: string;
    tagline: string;
    themeColor?: string;
    icon?: string;
    branchName?: string;
  }) => void;
}

export const RESTAURANT_ICONS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'pizza', label: 'Pizza & Italian', Icon: Pizza },
  { id: 'flame', label: 'Grill & BBQ', Icon: Flame },
  { id: 'burger', label: 'Burgers & Fast Food', Icon: Beef },
  { id: 'utensils', label: 'Bistro & Dining', Icon: UtensilsCrossed },
  { id: 'chef', label: 'Chef & Fine Dining', Icon: ChefHat },
  { id: 'coffee', label: 'Cafe & Espresso', Icon: Coffee },
  { id: 'beer', label: 'Pub & Brewery', Icon: Beer },
  { id: 'wine', label: 'Lounge & Bar', Icon: Wine },
  { id: 'cake', label: 'Bakery & Sweets', Icon: Cake },
  { id: 'fish', label: 'Seafood & Catch', Icon: Fish },
  { id: 'soup', label: 'Local Dishes & Soups', Icon: Soup },
  { id: 'store', label: 'General Storefront', Icon: Store },
  { id: 'sparkles', label: 'Modern & Luxe', Icon: Sparkles },
];

export const BRAND_THEME_PALETTES = [
  { id: '#059669', name: 'Emerald Green', bgClass: 'bg-emerald-600', ringClass: 'ring-emerald-500' },
  { id: '#0f766e', name: 'Deep Teal', bgClass: 'bg-teal-700', ringClass: 'ring-teal-600' },
  { id: '#2563eb', name: 'Royal Blue', bgClass: 'bg-blue-600', ringClass: 'ring-blue-500' },
  { id: '#d97706', name: 'Amber Gold', bgClass: 'bg-amber-600', ringClass: 'ring-amber-500' },
  { id: '#dc2626', name: 'Crimson Red', bgClass: 'bg-red-600', ringClass: 'ring-red-500' },
  { id: '#7c3aed', name: 'Royal Violet', bgClass: 'bg-violet-600', ringClass: 'ring-violet-500' },
  { id: '#78350f', name: 'Espresso Bronze', bgClass: 'bg-amber-900', ringClass: 'ring-amber-800' },
  { id: '#334155', name: 'Slate Charcoal', bgClass: 'bg-slate-700', ringClass: 'ring-slate-600' },
];

export const LOGO_PRESETS = [
  {
    name: 'ENH Official Aide',
    url: '/logo.jpg',
    category: 'Official Brand',
  },
  {
    name: 'Artisan Pizza Oven',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
    category: 'Pizza & Pasta',
  },
  {
    name: 'Flame Burger & Grill',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    category: 'Burgers & Fries',
  },
  {
    name: 'Espresso & Bakery Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
    category: 'Coffee & Breakfast',
  },
  {
    name: 'Crispy Chicken & Wings',
    url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80',
    category: 'Chicken & Meat',
  },
  {
    name: 'Craft Cocktails & Lounge',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=80',
    category: 'Bar & Drinks',
  },
  {
    name: 'Prime Steakhouse & BBQ',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    category: 'Steaks & BBQ',
  },
  {
    name: 'Fresh Greens & Salads',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    category: 'Healthy & Vegan',
  },
  {
    name: 'Sushi & Asian Delights',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
    category: 'Asian Cuisine',
  },
];

export const LogoEditorModal: React.FC<LogoEditorModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl = '',
  currentName,
  currentTagline,
  currentThemeColor = '#059669',
  currentIcon = 'pizza',
  currentBranchName = 'Main Branch',
  onSave,
}) => {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '/logo.jpg');
  const [name, setName] = useState(currentName);
  const [tagline, setTagline] = useState(currentTagline);
  const [branchName, setBranchName] = useState(currentBranchName);
  const [themeColor, setThemeColor] = useState(currentThemeColor || '#059669');
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || 'pizza');
  const [activeTab, setActiveTab] = useState<'logo' | 'icon' | 'color'>('logo');
  const [logoSubTab, setLogoSubTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLogoUrl(currentLogoUrl || '/logo.jpg');
      setName(currentName);
      setTagline(currentTagline);
      setBranchName(currentBranchName || 'Main Branch');
      setThemeColor(currentThemeColor || '#059669');
      setSelectedIcon(currentIcon || 'pizza');
      setPreviewError(false);
    }
  }, [isOpen, currentLogoUrl, currentName, currentTagline, currentThemeColor, currentIcon, currentBranchName]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrl(result);
        setPreviewError(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      logoUrl: logoUrl.trim() || '/logo.jpg',
      name: name.trim() || currentName,
      tagline: tagline.trim() || currentTagline,
      themeColor,
      icon: selectedIcon,
      branchName: branchName.trim() || 'Main Branch',
    });
    onClose();
  };

  const CurrentIconComponent = RESTAURANT_ICONS.find((i) => i.id === selectedIcon)?.Icon || UtensilsCrossed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white border border-slate-200 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logo-editor-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-2xl text-white flex items-center justify-center shadow-xs transition-colors"
              style={{ backgroundColor: themeColor }}
            >
              <CurrentIconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 id="logo-editor-title" className="text-sm font-black text-slate-900 leading-tight">
                Customize Restaurant Appearance & Logo
              </h2>
              <p className="text-[11px] text-slate-500">
                Official logo, culinary icon, and primary brand theme color
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-14 h-14 rounded-2xl p-0.5 shadow-sm bg-white overflow-hidden flex items-center justify-center border-2"
                  style={{ borderColor: themeColor }}
                >
                  {previewError ? (
                    <div className="text-[9px] text-red-500 font-bold text-center">Invalid Image</div>
                  ) : (
                    <img
                      src={logoUrl || '/logo.jpg'}
                      alt="Logo Preview"
                      className="w-full h-full object-cover rounded-xl"
                      onError={() => setPreviewError(true)}
                    />
                  )}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg text-white flex items-center justify-center shadow-xs text-[10px]"
                  style={{ backgroundColor: themeColor }}
                  title={selectedIcon}
                >
                  <CurrentIconComponent className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 truncate">
                    {name || 'Restaurant Name'}
                  </span>
                  <span
                    className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white shrink-0"
                    style={{ backgroundColor: themeColor }}
                  >
                    {branchName || 'Main Branch'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{tagline || 'Tagline'}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10.5px] text-emerald-700 font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Updates login screen, blurred backdrop, POS header, & receipts</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setLogoUrl('/logo.jpg');
                setThemeColor('#059669');
                setSelectedIcon('pizza');
                setPreviewError(false);
              }}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-slate-50 px-2 py-1 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
              title="Reset default ENH appearance"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Customization Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'logo'
                ? 'bg-white text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Official Logo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('icon')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'icon'
                ? 'bg-white text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CurrentIconComponent className="w-3.5 h-3.5" />
            <span>2. Culinary Icon</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('color')}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'color'
                ? 'bg-white text-slate-950 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>3. Brand Theme</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: LOGO */}
          {activeTab === 'logo' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLogoSubTab('upload')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    logoSubTab === 'upload'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setLogoSubTab('presets')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    logoSubTab === 'presets'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Curated Presets
                </button>
                <button
                  type="button"
                  onClick={() => setLogoSubTab('url')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    logoSubTab === 'url'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  Image URL
                </button>
              </div>

              {/* Upload area */}
              {logoSubTab === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-emerald-50/30 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mb-2 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Click to upload official restaurant logo
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG, SVG, WebP (Square or circular crops recommended)
                  </span>
                </div>
              )}

              {/* Presets */}
              {logoSubTab === 'presets' && (
                <div className="grid grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-1">
                  {LOGO_PRESETS.map((preset) => {
                    const isSelected = logoUrl === preset.url;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setLogoUrl(preset.url);
                          setPreviewError(false);
                        }}
                        className={`relative flex flex-col items-center p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/40 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 mb-1.5 shrink-0 border border-slate-200">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10.5px] font-bold text-slate-800 truncate w-full">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-slate-500 truncate w-full">
                          {preset.category}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* URL */}
              {logoSubTab === 'url' && (
                <div className="space-y-1.5">
                  <input
                    type="url"
                    placeholder="https://example.com/restaurant-logo.png"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      setPreviewError(false);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  />
                  <span className="text-[10.5px] text-slate-500 block">
                    Paste any direct image URL. It will also be blurred as the login backdrop.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CULINARY ICON */}
          {activeTab === 'icon' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Select Characteristic Restaurant Icon:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {RESTAURANT_ICONS.map(({ id, label, Icon }) => {
                  const isSelected = selectedIcon === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedIcon(id)}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/40 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: isSelected ? themeColor : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#334155',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold truncate w-full leading-tight">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BRAND COLOR & DETAILS */}
          {activeTab === 'color' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Primary Brand Appearance Theme Palette:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BRAND_THEME_PALETTES.map((pal) => {
                    const isSelected = themeColor === pal.id;
                    return (
                      <button
                        key={pal.id}
                        type="button"
                        onClick={() => setThemeColor(pal.id)}
                        className={`p-2 rounded-xl border flex items-center gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-400 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: pal.id }}
                        />
                        <span className="text-[10.5px] truncate">{pal.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Custom Hex Color:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-900 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shared Restaurant Name, Branch & Tagline Inputs */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Restaurant Brand Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Olli's Pizza House"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Branch / Location Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Main Branch or Airport Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Tagline / Sub-caption
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Authentic Wood-Fired Specialties"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply & Save Appearance</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
