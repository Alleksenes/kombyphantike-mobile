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

const lightTheme = {
  ...DefaultTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...DefaultTheme.colors,
    primary: '#2A2A2A', // ink
    secondary: '#5D4037', // ancient
    tertiary: '#C5A059', // gold
    background: '#F8F5F2', // paper
    surface: '#FFFFFF',
    onSurface: '#2A2A2A', // ink
    onSurfaceVariant: 'rgba(0,0,0,0.4)',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#E5E5E5', // ink (Dark)
    secondary: '#B39DDB', // ancient (Dark)
    tertiary: '#C5A059', // gold
    background: '#232226', // paper (Dark)
    surface: '#2C2C2C', // slightly lighter than background
    onSurface: '#E5E5E5', // ink (Dark)
    onSurfaceVariant: 'rgba(255,255,255,0.4)',
  },
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
