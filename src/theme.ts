import { MD3DarkTheme, configureFonts } from 'react-native-paper';

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
  labelLarge: { fontFamily: 'NeueHaasGrotesk' },
  labelMedium: { fontFamily: 'NeueHaasGrotesk' },
  labelSmall: { fontFamily: 'NeueHaasGrotesk' },
  bodyLarge: { fontFamily: 'NeueHaasGrotesk' },
  bodyMedium: { fontFamily: 'NeueHaasGrotesk' },
  bodySmall: { fontFamily: 'NeueHaasGrotesk' },
};

export const ScriptoriumTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#C0A062', // Antique Gold
    onPrimary: '#1a0b2e',
    secondary: '#B39DDB', // Ancient Purple
    onSecondary: '#1a0b2e',
    tertiary: '#C0A062',
    onTertiary: '#1a0b2e',
    background: '#1a0b2e', // Deep Purple (Fallback)
    onBackground: '#e3dccb', // Warm Parchment
    surface: '#0f0518', // Dark Ink
    onSurface: '#e3dccb',
    onSurfaceVariant: 'rgba(227, 220, 203, 0.6)',
    elevation: {
      level1: '#0f0518',
      level2: '#0f0518',
      level3: '#0f0518',
      level4: '#0f0518',
      level5: '#0f0518',
    },
  },
};
