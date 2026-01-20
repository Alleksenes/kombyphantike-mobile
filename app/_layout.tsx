import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6750A4', // Modern purple
    secondary: '#625B71',
    tertiary: '#7D5260',
    background: '#FDFCF4', // Slightly warm/parchment background for "Scroll" feel
    surface: '#FFFFFF',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false, // We use custom headers in screens
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade', // Smooth transition
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="results" />
      </Stack>
    </PaperProvider>
  );
}
