/**
 * Dynamic Brand Theme & Color Scheme Manager
 * Generates shades, contrast text colors, and manages global CSS variables & runtime stylesheet overrides.
 */

export const DEFAULT_PRIMARY = '#1F4D3E'; // Forest pine green
export const DEFAULT_ACCENT = '#E67E22';  // Warm coral amber

export const PRESET_COLORS = [
  '#1F4D3E', // Forest Pine (Default)
  '#4A6FA5', // Glaucous Blue
  '#2C3E50', // Midnight Navy
  '#1ABC9C', // Turquoise Mint
  '#E67E22', // Coral Orange
  '#D97706', // Amber Gold
  '#9B59B6', // Royal Violet
  '#E74C3C', // Crimson Red
  '#2ECC71', // Emerald Green
  '#3498DB', // Ocean Blue
  '#0D9488', // Deep Teal
  '#1A1A2E', // Obsidian Dark
  '#2D3748', // Slate Charcoal
  '#8B5CF6', // Vivid Purple
];

// Helper function to validate 3-digit or 6-digit hex colors
export const isValidHex = (hex: string): boolean => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex.trim());
};

// Normalize hex to 6 characters (e.g. #FFF -> #FFFFFF)
export const normalizeHex = (hexColor: string, defaultFallback = DEFAULT_PRIMARY): string => {
  if (!isValidHex(hexColor)) return defaultFallback;
  const hex = hexColor.trim().replace('#', '');
  if (hex.length === 3) {
    return '#' + hex.split('').map((c) => c + c).join('').toUpperCase();
  }
  return '#' + hex.toUpperCase();
};

// Calculate high-contrast text color (#FFFFFF or #1A1A2E) using YIQ formula
export const getContrastColor = (hexColor: string): string => {
  const hex = normalizeHex(hexColor).replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 135 ? '#1A1A2E' : '#FFFFFF';
};

// Adjust brightness of a hex color (positive percent = lighter, negative = darker)
export const adjustBrightness = (hexColor: string, percent: number): string => {
  const hex = normalizeHex(hexColor).replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  if (percent > 0) {
    // Lighten towards white
    r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  } else {
    // Darken towards black
    const factor = (100 + percent) / 100;
    r = Math.max(0, Math.round(r * factor));
    g = Math.max(0, Math.round(g * factor));
    b = Math.max(0, Math.round(b * factor));
  }

  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Convert hex to RGBA string
export const hexToRgba = (hexColor: string, alpha: number): string => {
  const hex = normalizeHex(hexColor).replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryTint: string;
  primaryTextColor: string;
  accent: string;
  accentDark: string;
  accentTint: string;
  accentTextColor: string;
}

export const computeThemePalette = (primaryHex: string, accentHex: string): ThemeColors => {
  const primary = normalizeHex(primaryHex, DEFAULT_PRIMARY);
  const accent = normalizeHex(accentHex, DEFAULT_ACCENT);

  return {
    primary,
    primaryDark: adjustBrightness(primary, -25),
    primaryTint: adjustBrightness(primary, 85),
    primaryTextColor: getContrastColor(primary),
    accent,
    accentDark: adjustBrightness(accent, -25),
    accentTint: adjustBrightness(accent, 85),
    accentTextColor: getContrastColor(accent),
  };
};

/**
 * Applies the theme colors to the document root and injects global CSS overrides.
 */
export const applyThemeColors = (primaryInput: string, accentInput: string) => {
  if (typeof document === 'undefined') return;

  const palette = computeThemePalette(primaryInput, accentInput);
  const root = document.documentElement;

  // Set CSS Custom Properties on :root
  root.style.setProperty('--primary-color', palette.primary);
  root.style.setProperty('--primary-dark', palette.primaryDark);
  root.style.setProperty('--primary-tint', palette.primaryTint);
  root.style.setProperty('--primary-text-color', palette.primaryTextColor);

  root.style.setProperty('--accent-color', palette.accent);
  root.style.setProperty('--accent-dark', palette.accentDark);
  root.style.setProperty('--accent-tint', palette.accentTint);
  root.style.setProperty('--accent-text-color', palette.accentTextColor);

  // Synonyms for system palettes
  root.style.setProperty('--pine', palette.primary);
  root.style.setProperty('--pine-dark', palette.primaryDark);
  root.style.setProperty('--pine-tint', palette.primaryTint);
  root.style.setProperty('--amber', palette.accent);
  root.style.setProperty('--amber-tint', palette.accentTint);

  // Inject or update the dynamic CSS style sheet
  let styleEl = document.getElementById('app-dynamic-theme-styles') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'app-dynamic-theme-styles';
    document.head.appendChild(styleEl);
  }

  const primaryRgba10 = hexToRgba(palette.primary, 0.10);
  const primaryRgba15 = hexToRgba(palette.primary, 0.15);
  const primaryRgba20 = hexToRgba(palette.primary, 0.20);
  const primaryRgba30 = hexToRgba(palette.primary, 0.30);
  const primaryRgba40 = hexToRgba(palette.primary, 0.40);
  const primaryRgba80 = hexToRgba(palette.primary, 0.80);
  const primaryRgba90 = hexToRgba(palette.primary, 0.90);

  const accentRgba15 = hexToRgba(palette.accent, 0.15);
  const accentRgba20 = hexToRgba(palette.accent, 0.20);

  styleEl.textContent = `
    /* ========================================================= */
    /* DYNAMIC BRAND THEME OVERRIDES                             */
    /* Primary: ${palette.primary} | Accent: ${palette.accent}   */
    /* ========================================================= */

    :root {
      --primary-color: ${palette.primary};
      --primary-dark: ${palette.primaryDark};
      --primary-tint: ${palette.primaryTint};
      --primary-text-color: ${palette.primaryTextColor};
      --accent-color: ${palette.accent};
      --accent-dark: ${palette.accentDark};
      --accent-tint: ${palette.accentTint};
      --accent-text-color: ${palette.accentTextColor};
      --pine: ${palette.primary};
      --pine-dark: ${palette.primaryDark};
      --pine-tint: ${palette.primaryTint};
      --amber: ${palette.accent};
      --amber-tint: ${palette.accentTint};
    }

    /* Primary Backgrounds */
    .bg-\\[\\#1f4d3e\\],
    .bg-pine,
    .brand-primary-bg,
    header.bg-\\[\\#1f4d3e\\],
    button.bg-\\[\\#1f4d3e\\] {
      background-color: ${palette.primary} !important;
      color: ${palette.primaryTextColor} !important;
    }

    /* Primary Opacity Variants */
    .bg-\\[\\#1f4d3e\\]\\/90 { background-color: ${primaryRgba90} !important; }
    .bg-\\[\\#1f4d3e\\]\\/80 { background-color: ${primaryRgba80} !important; }
    .bg-\\[\\#1f4d3e\\]\\/30 { background-color: ${primaryRgba30} !important; }
    .bg-\\[\\#1f4d3e\\]\\/20 { background-color: ${primaryRgba20} !important; }
    .bg-\\[\\#1f4d3e\\]\\/15 { background-color: ${primaryRgba15} !important; }
    .bg-\\[\\#1f4d3e\\]\\/10 { background-color: ${primaryRgba10} !important; }

    /* Primary Dark Backgrounds */
    .bg-\\[\\#143529\\],
    .bg-pine-dark,
    .brand-primary-dark-bg,
    button.bg-\\[\\#143529\\] {
      background-color: ${palette.primaryDark} !important;
      color: ${palette.primaryTextColor} !important;
    }

    /* Primary Tints / Soft Highlights */
    .bg-\\[\\#e3ede8\\],
    .bg-pine-tint {
      background-color: ${palette.primaryTint} !important;
    }

    /* Hover States */
    .hover\\:bg-\\[\\#143529\\]:hover,
    .hover\\:bg-\\[\\#1f4d3e\\]:hover,
    .hover\\:bg-\\[\\#1f4d3e\\]\\/90:hover {
      background-color: ${palette.primaryDark} !important;
      color: ${palette.primaryTextColor} !important;
    }

    /* Text Colors */
    .text-\\[\\#1f4d3e\\],
    .text-pine,
    .brand-primary-text {
      color: ${palette.primary} !important;
    }

    .text-\\[\\#143529\\],
    .text-pine-dark {
      color: ${palette.primaryDark} !important;
    }

    .hover\\:text-\\[\\#1f4d3e\\]:hover {
      color: ${palette.primary} !important;
    }

    /* Border Colors */
    .border-\\[\\#1f4d3e\\],
    .border-pine,
    .brand-primary-border {
      border-color: ${palette.primary} !important;
    }

    .border-\\[\\#1f4d3e\\]\\/40 { border-color: ${primaryRgba40} !important; }
    .border-\\[\\#1f4d3e\\]\\/30 { border-color: ${primaryRgba30} !important; }
    .border-\\[\\#1f4d3e\\]\\/20 { border-color: ${primaryRgba20} !important; }

    .hover\\:border-\\[\\#1f4d3e\\]\\/40:hover,
    .hover\\:border-\\[\\#1f4d3e\\]:hover {
      border-color: ${palette.primary} !important;
    }

    .focus\\:border-\\[\\#1f4d3e\\]:focus {
      border-color: ${palette.primary} !important;
    }

    /* Accent Overrides */
    .bg-amber-600,
    .bg-amber-500,
    .brand-accent-bg {
      background-color: ${palette.accent} !important;
      color: ${palette.accentTextColor} !important;
    }

    .hover\\:bg-amber-700:hover,
    .hover\\:bg-amber-600:hover {
      background-color: ${palette.accentDark} !important;
      color: ${palette.accentTextColor} !important;
    }

    .text-amber-600,
    .text-amber-500,
    .brand-accent-text {
      color: ${palette.accent} !important;
    }

    .border-amber-500,
    .border-amber-600 {
      border-color: ${palette.accent} !important;
    }

    .bg-amber-50,
    .bg-amber-100 {
      background-color: ${palette.accentTint} !important;
    }

    /* Text selection */
    ::selection {
      background-color: ${palette.primary} !important;
      color: ${palette.primaryTextColor} !important;
    }
  `;
};

/**
 * Loads saved colors from localStorage or falls back to defaults.
 */
export const getStoredThemeColors = (): { primary: string; accent: string } => {
  if (typeof window === 'undefined') {
    return { primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT };
  }

  const savedPrimary = localStorage.getItem('app_primary_color');
  const savedAccent = localStorage.getItem('app_accent_color');

  return {
    primary: savedPrimary && isValidHex(savedPrimary) ? normalizeHex(savedPrimary) : DEFAULT_PRIMARY,
    accent: savedAccent && isValidHex(savedAccent) ? normalizeHex(savedAccent) : DEFAULT_ACCENT,
  };
};

/**
 * Initializes theme on application boot
 */
export const initializeThemeColors = (): { primary: string; accent: string } => {
  const { primary, accent } = getStoredThemeColors();
  applyThemeColors(primary, accent);
  return { primary, accent };
};
