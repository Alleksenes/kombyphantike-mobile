import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OmegaLoader from '../components/OmegaLoader';
import CosmicBackground from '../components/ui/CosmicBackground';
import PhilologicalInspector from '../components/ui/PhilologicalInspector';
import TheInspector from '../components/ui/TheInspector';
import { initDatabase } from '../src/services/Database';
import { ScriptoriumTheme } from '../src/theme';

export default function RootLayout() {
  // STATE: Track readiness
  const [isReady, setIsReady] = useState(false);

  // FONTS: Load the assets
  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.ttf'), // Ensure extensions match disk!
    'NeueHaasGrotesk-Display': require('../assets/fonts/NeueHaasGrotesk.ttf'),
    'NeueHaasGrotesk-Text': require('../assets/fonts/NeueHaasGrotesk.ttf'),
  });

  useEffect(() => {
    // 1. Init Database
    initDatabase();

    // 2. Failsafe Timer (Force entry if fonts hang)
    const timer = setTimeout(() => {
      console.log("--- FAILSAFE TRIGGERED: Forcing Entry ---");
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 3. Check Fonts
  useEffect(() => {
    if (fontsLoaded) {
      console.log("--- FONTS LOADED ---");
      setIsReady(true);
    }
  }, [fontsLoaded]);

  // LOADING SCREEN
  if (!isReady) {
    return (
      <View style={styles.loaderContainer}>
        <OmegaLoader />
      </View>
    );
  }

  // THE TEMPLE
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0f0518' }}>

        {/* LAYER 0: THE COSMOS (Pinned to Back) */}
        {/* We wrap this to ensure it sits behind everything else */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <CosmicBackground />
        </View>

        {/* LAYER 1: THE APP (Transparent) */}
        <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <PaperProvider theme={ScriptoriumTheme}>
            <StatusBar style="light" />

            {/* The Navigation Stack */}
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="constellation" />
              <Stack.Screen name="island/[id]" />
            </Stack>

            {/* LAYER 2: GLOBAL OVERLAYS */}
            <TheInspector />
            <PhilologicalInspector />

          </PaperProvider>
        </GestureHandlerRootView>
      </View>
    </SafeAreaProvider>
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