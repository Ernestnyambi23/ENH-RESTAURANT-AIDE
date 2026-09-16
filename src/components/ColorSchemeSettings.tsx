import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, Save, Check, Sparkles } from 'lucide-react';
import {
  DEFAULT_PRIMARY,
  DEFAULT_ACCENT,
  PRESET_COLORS,
  isValidHex,
  normalizeHex,
  getContrastColor,
  applyThemeColors,
  getStoredThemeColors,
} from '../utils/colorTheme';

interface ColorSchemeSettingsProps {
  onSaveTheme?: (primary: string, accent: string) => void;
}

export function ColorSchemeSettings({ onSaveTheme }: ColorSchemeSettingsProps) {
  const [primary, setPrimary] = useState<string>(DEFAULT_PRIMARY);
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load saved colors on mount
  useEffect(() => {
    const { primary: savedPrimary, accent: savedAccent } = getStoredThemeColors();
    setPrimary(savedPrimary);
    setAccent(savedAccent);
    applyThemeColors(savedPrimary, savedAccent);
  }, []);

  // Update global CSS root variables and inject stylesheets dynamically whenever primary or accent changes
  useEffect(() => {
    if (isValidHex(primary) && isValidHex(accent)) {
      applyThemeColors(primary, accent);
    }
  }, [primary, accent]);

  const handlePresetClick = (color: string, type: 'primary' | 'accent') => {
    if (type === 'primary') {
      setPrimary(color);
      if (isValidHex(accent)) applyThemeColors(color, accent);
    } else {
      setAccent(color);
      if (isValidHex(primary)) applyThemeColors(primary, color);
    }
  };

  const resetToDefault = () => {
    setPrimary(DEFAULT_PRIMARY);
    setAccent(DEFAULT_ACCENT);
    localStorage.removeItem('app_primary_color');
    localStorage.removeItem('app_accent_color');
    applyThemeColors(DEFAULT_PRIMARY, DEFAULT_ACCENT);
    setSavedStatus(false);
    setErrorMessage('');
    if (onSaveTheme) {
      onSaveTheme(DEFAULT_PRIMARY, DEFAULT_ACCENT);
    }
  };

  const saveScheme = () => {
    if (!isValidHex(primary) || !isValidHex(accent)) {
      setErrorMessage('Please enter valid Hex values (e.g. #1F4D3E or #E67E22)');
      return;
    }
    const cleanPrimary = normalizeHex(primary, DEFAULT_PRIMARY);
    const cleanAccent = normalizeHex(accent, DEFAULT_ACCENT);

    setErrorMessage('');
    localStorage.setItem('app_primary_color', cleanPrimary);
    localStorage.setItem('app_accent_color', cleanAccent);
    applyThemeColors(cleanPrimary, cleanAccent);

    if (onSaveTheme) {
      onSaveTheme(cleanPrimary, cleanAccent);
    }

    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  const primaryTextColor = getContrastColor(primary);
  const accentTextColor = getContrastColor(accent);

  return (
    <div className="bg-white border border-[#e2e4dc] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#1b2620]">
              Custom Theme &amp; Color Scheme
            </h3>
            <p className="text-xs text-[#8b978f]">
              Configure custom Primary &amp; Accent brand colors with live contrast calculation across the whole app
            </p>
          </div>
        </div>

        {savedStatus && (
          <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-xs animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Theme Saved!
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
          {errorMessage}
        </div>
      )}

      {/* Primary & Accent Color Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Color Picker */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-[#fafbfa] border border-[#e2e4dc]">
          <label className="text-xs font-bold text-[#4c5a52] uppercase tracking-wider block">
            Primary Color (Main Brand)
          </label>
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              id="theme-primary-color-input"
              value={isValidHex(primary) ? normalizeHex(primary) : DEFAULT_PRIMARY}
              onChange={(e) => setPrimary(e.target.value.toUpperCase())}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
            />
            <input
              type="text"
              id="theme-primary-hex-input"
              value={primary}
              onChange={(e) => setPrimary(e.target.value.toUpperCase())}
              maxLength={7}
              placeholder="#1F4D3E"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm uppercase font-bold focus:outline-none focus:border-[#1f4d3e]"
            />
          </div>
        </div>

        {/* Accent Color Picker */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-[#fafbfa] border border-[#e2e4dc]">
          <label className="text-xs font-bold text-[#4c5a52] uppercase tracking-wider block">
            Accent Color (Highlight &amp; Badges)
          </label>
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              id="theme-accent-color-input"
              value={isValidHex(accent) ? normalizeHex(accent) : DEFAULT_ACCENT}
              onChange={(e) => setAccent(e.target.value.toUpperCase())}
              className="w-10 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5 bg-white shrink-0"
            />
            <input
              type="text"
              id="theme-accent-hex-input"
              value={accent}
              onChange={(e) => setAccent(e.target.value.toUpperCase())}
              maxLength={7}
              placeholder="#E67E22"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm uppercase font-bold focus:outline-none focus:border-[#1f4d3e]"
            />
          </div>
        </div>
      </div>

      {/* Preset Palettes */}
      <div className="space-y-3 pt-1">
        <div>
          <label className="text-xs font-bold text-[#4c5a52] block mb-1.5">
            Quick Select Primary Palette
          </label>
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={`primary-${color}`}
                type="button"
                className={`w-full aspect-square rounded-lg transition-transform hover:scale-105 cursor-pointer border-2 ${
                  primary.toUpperCase() === color.toUpperCase()
                    ? 'border-[#1b2620] scale-110 shadow-sm ring-2 ring-white'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handlePresetClick(color, 'primary')}
                title={`Set primary: ${color}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#4c5a52] block mb-1.5">
            Quick Select Accent Palette
          </label>
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
            {PRESET_COLORS.map((color) => (
              <button
                key={`accent-${color}`}
                type="button"
                className={`w-full aspect-square rounded-lg transition-transform hover:scale-105 cursor-pointer border-2 ${
                  accent.toUpperCase() === color.toUpperCase()
                    ? 'border-[#1b2620] scale-110 shadow-sm ring-2 ring-white'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handlePresetClick(color, 'accent')}
                title={`Set accent: ${color}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#4c5a52]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Live Interactive Preview</span>
        </div>
        <div
          className="rounded-2xl p-5 transition-all shadow-sm space-y-3"
          style={{
            backgroundColor: primary,
            color: primaryTextColor,
          }}
        >
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-base tracking-tight">Dashboard Header Preview</h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/20 text-white/90">
              Primary: {primary}
            </span>
          </div>

          <p className="text-xs opacity-90">
            This live preview shows instant contrast ratios and accent button color interactions across the entire POS.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              className="px-4 py-2 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: accent,
                color: accentTextColor,
              }}
            >
              Action Button ({accent})
            </button>

            <span className="text-[11px] opacity-80">
              Accent Contrast: <strong>{accentTextColor}</strong>
            </span>
          </div>

          <div
            className="p-3 rounded-xl text-xs font-medium backdrop-blur-xs"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: primaryTextColor,
            }}
          >
            Secondary container with semi-transparent overlay
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          id="theme-reset-btn"
          onClick={resetToDefault}
          className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#4c5a52] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>

        <button
          type="button"
          id="theme-save-btn"
          onClick={saveScheme}
          className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
          style={{
            backgroundColor: primary,
            color: primaryTextColor,
          }}
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Theme</span>
        </button>
      </div>
    </div>
  );
}

export default ColorSchemeSettings;
