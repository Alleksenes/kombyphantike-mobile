// ── ROOT LAYOUT (The Palimpsest Foundation) ──────────────────────────────────
// Boot sequence: Fonts → DB init → OmegaLoader → Cathedral
// Providers: SafeArea → GestureHandler → Paper → CosmicBackground → Stack
// Global overlay: PhilologicalInspector (driven by unifiedInspectorStore)

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalErrorBoundary } from '../components/ErrorBoundary';
import OmegaLoader from '../components/OmegaLoader';
import CosmicBackground from '../components/ui/CosmicBackground';
import PhilologicalInspector from '../components/ui/PhilologicalInspector';
import { initDatabase } from '../src/services/Database';
import { ScriptoriumTheme } from '../src/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.otf'),
    'NeueHaasGrotesk-Display': require('../assets/fonts/NeueHaasGrotesk.otf'),
    'NeueHaasGrotesk-Text': require('../assets/fonts/NeueHaasGrotesk.otf'),
  });

  useEffect(() => {
    initDatabase();

    // Failsafe: force entry if fonts hang beyond 2s
    const timer = setTimeout(() => {
      console.log('--- FAILSAFE TRIGGERED: Forcing Entry ---');
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      console.log('--- FONTS LOADED ---');
      setIsReady(true);
    }
  }, [fontsLoaded]);

  // ── Boot Sequence: OmegaLoader ──────────────────────────────────────────
  if (!isReady) {
    return (
      <View style={styles.loaderContainer}>
        <OmegaLoader />
      </View>
    );
  }

  // ── The Cathedral ───────────────────────────────────────────────────────
  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#0f0518' }}>

          {/* LAYER 0: THE COSMOS (pinned behind everything) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <CosmicBackground />
          </View>

          {/* LAYER 1: THE APP */}
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <PaperProvider theme={ScriptoriumTheme}>
              <StatusBar style="light" />

              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="dev/gallery" />
                <Stack.Screen name="voyage/[id]" />
                <Stack.Screen name="orrery/index" />
                <Stack.Screen name="orrery/[lemma]" />
                <Stack.Screen name="lapidary/[sentenceId]" />
                <Stack.Screen name="constellation" />
              </Stack>

              {/* LAYER 2: GLOBAL OVERLAY */}
              <PhilologicalInspector />

            </PaperProvider>
          </GestureHandlerRootView>
        </View>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
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
