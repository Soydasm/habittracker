/**
 * The single source of truth for how this app looks. Screens read tokens from `useTheme()`; no component
 * hardcodes a colour, a font size, a spacing value or a shadow. The design foundation task sets the brand here
 * (colours, font family, radius) from the brief's visual direction or the founder's Figma design.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

const palette = {
  light: {
    background: '#f6f7f9',
    surface: '#ffffff',
    surfaceMuted: '#f0f2f5',
    border: '#e3e6ea',
    text: '#1a1d21',
    textMuted: '#6b7682',
    primary: '#2f6df6',
    onPrimary: '#ffffff',
    accent: '#f59e0b',
    success: '#1f9d62',
    warning: '#c98a12',
    danger: '#d34a3a',
    onDanger: '#ffffff',
    overlay: 'rgba(15, 18, 24, 0.45)',
  },
  dark: {
    background: '#12141a',
    surface: '#1b1f27',
    surfaceMuted: '#232833',
    border: '#2a2f3a',
    text: '#e7eaf0',
    textMuted: '#98a1b0',
    primary: '#6f9bff',
    onPrimary: '#0b1020',
    accent: '#fbbf24',
    success: '#4fc78c',
    warning: '#e0ad4b',
    danger: '#ef6f60',
    onDanger: '#1b0d0b',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

/** The web font. Change the family (any Google Fonts family) and the weights it loads, nothing else. */
const FONT = { family: 'Inter', weights: [400, 500, 600, 700] };

export const tokens = {
  /** An 8-point rhythm: every gap and padding is one of these. */
  spacing: { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 },
  /** The type scale. Use the `AppText` variants rather than these numbers where you can. */
  font: { xs: 12, sm: 13, md: 15, lg: 18, xl: 24, xxl: 32 },
  lineHeight: { xs: 16, sm: 18, md: 22, lg: 26, xl: 32, xxl: 40 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' } as const,
  fontFamily: Platform.OS === 'web'
    ? `${FONT.family}, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
    : undefined,
  /** Raised surfaces: cards use `sm`, menus and dialogs `md`. */
  shadow: {
    sm: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
    md: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  },
  /** Content never stretches wider than this on a desktop screen. */
  maxContentWidth: 1120,
  /** Below this width the layout is the phone layout. */
  breakpoint: 768,
};

export type ThemeMode = 'system' | 'light' | 'dark';
export type Theme = { mode: 'light' | 'dark'; colors: typeof palette.light } & typeof tokens;

const ThemeContext = createContext<{ theme: Theme; mode: ThemeMode; setMode: (m: ThemeMode) => void } | null>(null);

/** Loads the web font once; native platforms use the system font. */
function useWebFont() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const id = 'app-font';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${FONT.family.replace(/ /g, '+')}:wght@${FONT.weights.join(';')}&display=swap`;
    document.head.appendChild(link);
  }, []);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useWebFont();
  const system = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState<ThemeMode>('system');
  const resolved = mode === 'system' ? system : mode;
  const value = useMemo(
    () => ({ theme: { mode: resolved, colors: palette[resolved], ...tokens }, mode, setMode }),
    [resolved, mode],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
