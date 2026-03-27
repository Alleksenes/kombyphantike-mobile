import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';

import OmegaLoader from '../components/OmegaLoader';
import CosmicBackground from '../components/ui/CosmicBackground';
import PhilologicalInspector from '../components/ui/PhilologicalInspector';
import { initDatabase } from '../src/services/Database';
import { ScriptoriumTheme } from '../src/theme';

import { GlobalErrorBoundary } from './ErrorBoundary';
// ── The Sentinel: Auth Guard ──────────────────────────────────────────────────
// DevMode: isAuthenticated starts true → guard never redirects to login.
// Production: starts false → restoreSession fires → redirects once authed.
function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'paywall';
    const inDevGroup = segments[0] === 'dev'; // Always accessible — no auth gate
    if (!isAuthenticated && !inAuthGroup && !inDevGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);
}

export default function RootLayout() {
  // STATE: Track readiness
  const [isReady, setIsReady] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // FONTS: Load the assets
  const [fontsLoaded] = useFonts({
    'GFSDidot': require('../assets/fonts/GFSDidot.ttf'),
    'NeueHaasGrotesk': require('../assets/fonts/NeueHaasGrotesk.ttf'),
  });

  useEffect(() => {
    useAuthStore.getState().restoreSession();
    initDatabase();

    // Failsafe Timer (Force entry if fonts hang)
    const timer = setTimeout(() => {
      console.log("--- FAILSAFE TRIGGERED: Forcing Entry ---");
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check Fonts (only gate — no auth gate)
  useEffect(() => {
    if (fontsLoaded) {
      console.log("--- FONTS LOADED ---");
      setIsReady(true);
    }
  }, [fontsLoaded]);

  // SSR GUARD: Prevent rendering on the server before hydration
  if (!hasMounted) {
    return <View style={{ flex: 1, backgroundColor: '#0f0518' }} />;
  }

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
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <CosmicBackground>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
            <PaperProvider theme={ScriptoriumTheme}>
              <StatusBar style="light" />
              <AuthGatedStack />
            </PaperProvider>
          </GestureHandlerRootView>
        </CosmicBackground>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}

// ── Separated so useProtectedRoute has router context from Stack ─────────────
function AuthGatedStack() {
  useProtectedRoute();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dev/gallery" />
        <Stack.Screen name="constellation" />
        <Stack.Screen name="island/[id]" />
        <Stack.Screen name="voyage/[id]" />
      </Stack>

      {/* LAYER 2: GLOBAL OVERLAY — Unified Philological Inspector */}
      <PhilologicalInspector />
    </>
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
