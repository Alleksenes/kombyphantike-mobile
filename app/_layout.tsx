// ── ROOT LAYOUT (The Palimpsest Foundation) ──────────────────────────────────
// Boot sequence: Fonts → DB init → OmegaLoader → Cathedral
// Providers: SafeArea → GestureHandler → Paper → ThemeProvider(Dark) → Stack
// Global overlay: PhilologicalInspector (driven by unifiedInspectorStore)
//
// CRITICAL: ThemeProvider(DarkTheme) kills @react-navigation's DefaultTheme
// background of rgb(242, 242, 242). Without it the navigation container paints
// a white/grey hospital ward behind every transparent screen on web.

import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalErrorBoundary } from '../components/ErrorBoundary';
import OmegaLoader from '../components/OmegaLoader';
import CosmicBackground from '../components/ui/CosmicBackground';
import PhilologicalInspector from '../components/ui/PhilologicalInspector';
import { initDatabase } from '../src/services/Database';
import { PhilologicalColors, ScriptoriumTheme } from '../src/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.otf'),
    'NeueHaasGrotesk-Display': require('../assets/fonts/NeueHaasGrotesk.otf'),
    'NeueHaasGrotesk-Text': require('../assets/fonts/NeueHaasGrotesk.otf'),
  });

  // ── Web: inject global CSS foundation ───────────────────────────────────────
  // html/body/root must be 100% height or absoluteFill collapses to 0px on web.
  // background-color:#0a0f0d seals any remaining white bleed outside React tree.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    if (document.getElementById('cosmic-foundation')) return;
    const style = document.createElement('style');
    style.id = 'cosmic-foundation';
    style.textContent = [
      'html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; background: #0a0f0d; }',
      '#root { height: 100%; background: #0a0f0d; }',
    ].join('\n');
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    initDatabase();
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

  // ── Boot Sequence: OmegaLoader ──────────────────────────────────────────────
  if (!isReady) {
    return (
      <View style={styles.loaderContainer}>
        <OmegaLoader />
      </View>
    );
  }

  // ── The Cathedral ────────────────────────────────────────────────────────────
  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: PhilologicalColors.VOID }}>

          {/* LAYER 0: THE COSMOS — pinned absolutely behind everything */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <CosmicBackground />
          </View>

          {/* LAYER 1: THE APP */}
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <PaperProvider theme={ScriptoriumTheme}>
              {/*
               * ThemeProvider(DarkTheme) MUST wrap the Stack.
               * It overrides @react-navigation's DefaultTheme (rgb(242,242,242))
               * with DarkTheme.colors.background = 'rgb(1, 1, 1)', keeping every
               * transparent screen from revealing a blinding grey canvas.
               */}
              <ThemeProvider value={DarkTheme}>
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
                  <Stack.Screen name="orrery/[lemma]" />
                  <Stack.Screen name="lapidary/[sentenceId]" />
                </Stack>

                {/* LAYER 2: GLOBAL OVERLAY */}
                <PhilologicalInspector />

              </ThemeProvider>
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
    backgroundColor: PhilologicalColors.VOID,
  },
});
