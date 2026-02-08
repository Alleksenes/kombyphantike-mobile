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
    background: '#1a1918', // Deep Ink - Global App Background
    onBackground: '#e3dccb', // Warm Parchment
    surface: '#252422', // Slightly lighter Ink - Card Background
    onSurface: '#e3dccb',
    onSurfaceVariant: 'rgba(227, 220, 203, 0.6)',
    elevation: {
      level1: '#252422',
      level2: '#252422',
      level3: '#252422',
      level4: '#252422',
      level5: '#252422',
    },
  },
};
