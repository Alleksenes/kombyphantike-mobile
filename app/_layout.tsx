import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { MD3LightTheme as DefaultTheme, PaperProvider, configureFonts } from 'react-native-paper';
import { useEffect } from 'react';
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

const theme = {
  ...DefaultTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...DefaultTheme.colors,
    primary: '#2A2A2A', // Dark aesthetic
    secondary: '#625B71',
    tertiary: '#7D5260',
    background: '#F8F5F2', // Soft paper-like off-white
    surface: '#FFFFFF',
    onSurfaceVariant: 'rgba(0,0,0,0.4)', // Using this for the "Fade" / Ghost text
  },
};

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="results" />
        <Stack.Screen name="history" />
      </Stack>
    </PaperProvider>
  );
}
