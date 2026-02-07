import '../global.css';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'nativewind';
import { initDatabase } from '../src/services/Database';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, StyleSheet } from 'react-native';

import { ScriptoriumTheme } from '../src/theme';
import Atmosphere from '../src/components/Atmosphere';
import OmegaLoader from '../components/OmegaLoader';

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.ttf'),
    'NeueHaasGrotesk': require('../assets/fonts/NeueHaasGrotesk.ttf'),
  });

  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    // Force NativeWind to dark mode
    if (colorScheme !== 'dark') {
      setColorScheme('dark');
    }
  }, [colorScheme, setColorScheme]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <OmegaLoader />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={ScriptoriumTheme}>
        <StatusBar style="light" />
        {/* Atmosphere Background */}
        <Atmosphere />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="results" />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0b2e',
  },
});
