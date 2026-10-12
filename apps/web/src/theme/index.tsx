/**
 * The single source of truth for how this app looks. Screens read tokens from `useTheme()`; no component
 * hardcodes a colour, a font size, a spacing value or a shadow. The design foundation task sets the brand here
 * (colours, font family, radius) from the brief's visual direction or the founder's Figma design.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';

/**
 * Colours from the founder's Figma `tokens.json`. Light is the "2.1 Main" frame, dark the "2.1 Main_dark" /
 * "1.1 Start_dark" frames. Every key exists in both palettes.
 */
const palette = {
  light: {
    background: '#dfe2ec', // frame fill
    surface: '#ffffff', // cards, header sheet
    surfaceMuted: 'rgba(203, 209, 222, 0.5)', // cbd1de @ 0.5
    border: '#cbd1de', // the sheet handle line
    text: '#1c1721', // "grey/dark"
    textMuted: '#7f8187', // "grey / medium"
    primary: '#9e6dfb', // "violet": links, active day
    primaryStrong: '#7b61c5', // the pill button fill
    onPrimary: '#ffffff',
    accent: '#ff9c28', // the round icon on the pill button
    success: '#346d63',
    warning: '#ff9c28',
    danger: '#fa4542',
    onDanger: '#ffffff',
    overlay: 'rgba(24, 25, 29, 0.2)',
    dayPast: '#8b7fa3', // a day chip already behind us
    dayFuture: '#a0a0a0', // a day chip still ahead
    glow: 'rgba(207, 112, 213, 0.27)', // decorative bubbles
    glowStrong: 'rgba(207, 112, 213, 0.61)',
    welcomeTop: '#d089ed', // the Start screen's gradient, top and bottom
    welcomeBottom: '#8f72f7',
    welcomeText: '#ffffff', // text on that gradient
    welcomeTextSoft: '#ffffff',
    welcomeDot: 'rgba(255, 255, 255, 0.5)',
  },
  dark: {
    background: '#2b2630',
    surface: '#363843',
    surfaceMuted: '#565656',
    border: '#565656',
    text: '#ffffff',
    textMuted: '#7f8187',
    primary: '#9e6dfb',
    primaryStrong: '#5d4798',
    onPrimary: '#ffffff',
    accent: '#ff9c28',
    success: '#1effd6',
    warning: '#ff9c28',
    danger: '#ff3b62',
    onDanger: '#ffffff',
    overlay: 'rgba(24, 25, 29, 0.88)',
    dayPast: '#363843',
    dayFuture: '#565656',
    glow: 'rgba(207, 112, 213, 0.27)',
    glowStrong: 'rgba(207, 112, 213, 0.61)',
    welcomeTop: '#7d3f96',
    welcomeBottom: '#3f306b',
    welcomeText: '#ffffff',
    welcomeTextSoft: 'rgba(255, 255, 255, 0.5)',
    welcomeDot: 'rgba(255, 255, 255, 0.5)',
  },
};

/**
 * The design's font is Jost (Google Fonts), used at 400, 500 and 600. Native platforms would need the font
 * files bundled; this product is web only.
 */
const FONT = { family: 'Jost', weights: [400, 500, 600] };

export const tokens = {
  /** Gaps and paddings: every one is one of these. `tight` and `cozy` are the design's 6 and 12 px gaps. */
  spacing: { xxs: 2, xs: 4, tight: 6, sm: 8, cozy: 12, md: 16, lg: 24, xl: 32, xxl: 48 },
  /** The design's radii: 8 (small things), 20 (cards), 26 (sheets), 38 (the pill button); 22, 23 and 56 are full circles. */
  radius: { sm: 8, md: 20, lg: 26, xl: 38, pill: 999 },
  /** A card's inner padding in the design: 18 px above and below, 30 px at the sides. */
  cardPadding: { vertical: 18, horizontal: 30 },
  /** The design's font sizes and line heights (Jost). Use the `AppText` variants rather than these where you can. */
  font: { micro: 9, xs: 13, sm: 14, md: 16, lg: 18, xl: 20, xxl: 30, display: 48 },
  lineHeight: { micro: 13.01, xs: 18.78, sm: 20.23, md: 23.12, lg: 26.01, xl: 28.9, xxl: 43.35, display: 69.36 },
  weight: { regular: '400', medium: '500', semibold: '600' } as const,
  fontFamily: Platform.OS === 'web'
    ? `${FONT.family}, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
    : undefined,
  /** The design's one drop shadow (`#7090b0` at 12 %, 18 px down, 40 px blur): cards and sheets. */
  shadow: {
    sm: { shadowColor: '#7090b0', shadowOpacity: 0.12, shadowRadius: 40, shadowOffset: { width: 0, height: 18 }, elevation: 4 },
    md: { shadowColor: '#7090b0', shadowOpacity: 0.12, shadowRadius: 40, shadowOffset: { width: 0, height: 18 }, elevation: 8 },
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
