import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { MD3LightTheme as DefaultTheme, MD3DarkTheme, PaperProvider, configureFonts } from 'react-native-paper';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { initDatabase } from '../src/services/Database';

const baseFont = Platform.select({
  ios: 'Helvetica Neue',
  android: 'sans-serif-medium',
  default: 'sans-serif',
});

const fontConfig = {
  displayLarge: { fontFamily: baseFont },
  displayMedium: { fontFamily: baseFont },
  displaySmall: { fontFamily: baseFont },
  headlineLarge: { fontFamily: baseFont },
  headlineMedium: { fontFamily: baseFont },
  headlineSmall: { fontFamily: baseFont },
  titleLarge: { fontFamily: baseFont },
  titleMedium: { fontFamily: baseFont },
  titleSmall: { fontFamily: baseFont },
  labelLarge: { fontFamily: baseFont },
  labelMedium: { fontFamily: baseFont },
  labelSmall: { fontFamily: baseFont },
  bodyLarge: { fontFamily: baseFont },
  bodyMedium: { fontFamily: baseFont },
  bodySmall: { fontFamily: baseFont },
};

const commonColors = {
  primary: '#C0A062', // accent - Antique Gold
  onPrimary: '#1a1918', // background
  secondary: '#B39DDB', // ancient
  onSecondary: '#1a1918',
  tertiary: '#C0A062', // accent
  onTertiary: '#1a1918',
  background: '#1a1918', // background - Deep Ink
  onBackground: '#e3dccb', // text - Warm Parchment
  surface: '#252422', // card - Slightly lighter Ink
  onSurface: '#e3dccb', // text
  onSurfaceVariant: 'rgba(227, 220, 203, 0.6)',
  elevation: {
    level1: '#252422',
    level2: '#252422',
    level3: '#252422',
    level4: '#252422',
    level5: '#252422',
  }
};

const lightTheme = {
  ...DefaultTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...DefaultTheme.colors,
    ...commonColors,
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    ...commonColors,
  },
};

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Force dark theme logic
  const theme = darkTheme;

  useEffect(() => {
    initDatabase();
    // Force NativeWind to dark mode
    if (colorScheme !== 'dark') {
      setColorScheme('dark');
    }
  }, [colorScheme]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="results" />
      </Stack>
    </PaperProvider>
  );
}
