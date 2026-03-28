import { MD3DarkTheme, configureFonts } from 'react-native-paper';

// ── Philological Design Tokens (Aesthetic Sovereignty) ──────────────────────
// Centralized here to eliminate scattered re-declarations across components.
// Every component should import from this file instead of declaring its own.

export const PhilologicalColors = {
  // ── Tactile Void Palette ────────────────────────────────────────────────
  VOID: '#0a0f0d',              // Deep emerald-black (was purple-black)
  VOID_DEEP: '#060a08',        // Near-true black with green undertone
  VOID_WARM: '#0d0907',        // Warm rust-black for gradient mixing
  GOLD: '#C5A059',
  GOLD_DIM: 'rgba(197, 160, 89, 0.15)',
  GOLD_GLOW: 'rgba(197, 160, 89, 0.35)',
  PARCHMENT: '#E3DCCB',
  INK: '#111413',              // Deep ink with green-charcoal undertone
  SURFACE: 'rgba(10, 15, 13, 0.4)',
  SURFACE_HEAVY: 'rgba(10, 15, 13, 0.65)',
  GRAY_TEXT: '#9CA3AF',
  GRAY_BORDER: 'rgba(55, 65, 81, 0.6)',
  MORPH_BG: 'rgba(120, 53, 15, 0.3)',
  MORPH_BORDER: 'rgba(180, 83, 9, 0.6)',
  MORPH_TEXT: '#FCD34D',
  SCHOLIA_BG: '#f4f1ea',
  SCHOLIA_BORDER: '#d6cfc0',
  SCHOLIA_TEXT: '#5D4037',
  ERROR: '#EF4444',
  SUCCESS: '#34D399',

  // ── Orrery Jewel Tones ──────────────────────────────────────────────────
  JEWEL_TEAL: '#4A8C82',       // Muted teal — synonyms
  JEWEL_RUST: '#A0644B',       // Muted rust — idioms, MWE
  JEWEL_GOLD: '#B89B5E',       // Antique gold — root/ancestor
  JEWEL_SLATE: '#6B7B8D',      // Cool slate — derived
  EDGE_MUTED: 'rgba(255, 255, 255, 0.12)',
} as const;

export const PhilologicalFonts = {
  DISPLAY: 'GFSDidot',
  BODY: 'NeueHaasGrotesk-Text',
  LABEL: 'NeueHaasGrotesk-Display',
} as const;

const fontConfig = {
  displayLarge: { fontFamily: 'GFSDidot' },
  displayMedium: { fontFamily: 'GFSDidot' },
  displaySmall: { fontFamily: 'GFSDidot' },
  headlineLarge: { fontFamily: 'GFSDidot' },
  headlineMedium: { fontFamily: 'GFSDidot' },
  headlineSmall: { fontFamily: 'GFSDidot' },
  titleLarge: { fontFamily: 'GFSDidot' },
  titleMedium: { fontFamily: 'GFSDidot' },
  titleSmall: { fontFamily: 'GFSDidot' },
  labelLarge: { fontFamily: 'NeueHaasGrotesk-Text' },
  labelMedium: { fontFamily: 'NeueHaasGrotesk-Text' },
  labelSmall: { fontFamily: 'NeueHaasGrotesk-Text' },
  bodyLarge: { fontFamily: 'NeueHaasGrotesk-Text' },
  bodyMedium: { fontFamily: 'NeueHaasGrotesk-Text' },
  bodySmall: { fontFamily: 'NeueHaasGrotesk-Text' },
};

export const ScriptoriumTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#C0A062', // Antique Gold
    onPrimary: '#1a1918',
    secondary: '#B39DDB', // Ancient Purple
    onSecondary: '#1a1918',
    tertiary: '#C0A062',
    onTertiary: '#1a1918',
    background: '#111413', // Deep Ink - Global App Background
    onBackground: '#e3dccb', // Warm Parchment
    surface: '#181c1a', // Slightly lighter Ink with emerald undertone
    onSurface: '#e3dccb',
    onSurfaceVariant: 'rgba(227, 220, 203, 0.6)',
    elevation: {
      level1: '#181c1a',
      level2: '#181c1a',
      level3: '#181c1a',
      level4: '#181c1a',
      level5: '#181c1a',
    },
  },
};

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
