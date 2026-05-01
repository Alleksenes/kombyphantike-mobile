// ── ROOT LAYOUT (The Palimpsest Foundation) ──────────────────────────────────
// Boot sequence: Fonts → DB init → OmegaLoader → Cathedral
// Providers: SafeArea → GestureHandler → Paper → ThemeProvider(Dark) → Stack
// Global overlay: PhilologicalInspector (driven by unifiedInspectorStore)
//
// CRITICAL: ThemeProvider(DarkTheme) kills @react-navigation's DefaultTheme
// background of rgb(242, 242, 242). Without it the navigation container paints
// a white/grey hospital ward behind every transparent screen on web.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { IconButton, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GlobalErrorBoundary } from '../components/ErrorBoundary';
import OmegaLoader from '../components/OmegaLoader';
import CosmicBackground from '../components/ui/CosmicBackground';
import PhilologicalInspector from '../components/ui/PhilologicalInspector';
import { API_BASE_URL } from '../src/services/apiConfig';
import { initDatabase } from '../src/services/Database';
import { PhilologicalColors, PhilologicalFonts, ScriptoriumTheme } from '../src/theme';

function DevScriptoriumOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const handlePing = () => {
    fetch(API_BASE_URL)
      .then((res) => {
        Alert.alert('Ping Backend', `Status: ${res.status} OK\nURL: ${API_BASE_URL}`);
      })
      .catch((e) => {
        Alert.alert('Ping Backend Failed', `URL: ${API_BASE_URL}\nError: ${e.message}`);
      });
  };

  const handleClearStorage = () => {
    AsyncStorage.clear()
      .then(() => Alert.alert('AsyncStorage Cleared', 'State has been purged.'))
      .catch((e) => Alert.alert('Error', e.message));
  };

  return (
    <>
      {/* Percentage line / Loading line at the very top */}
      <View style={styles.devTopLine} />

      {/* Floating Sentinel Button */}
      <View style={styles.devSentinelContainer}>
        <TouchableOpacity
          style={styles.devSentinelButton}
          onPress={() => setIsVisible(true)}
        >
          <IconButton icon="orbit" iconColor={PhilologicalColors.GOLD} size={28} />
        </TouchableOpacity>
      </View>

      {/* Dev Scriptorium Modal */}
      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.devModalOverlay}>
          <View style={styles.devModalContent}>
            <Text style={styles.devModalTitle}>GOD-MODE OVERLAY</Text>

            <TouchableOpacity style={styles.devModalButton} onPress={() => {
              Alert.prompt('Jump to Voyage', 'Enter voyage ID:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go', onPress: (id) => { if (id) { setIsVisible(false); router.push(`/voyage/${id}`); } }, style: 'default' },
              ]);
            }}>
              <Text style={styles.devModalButtonText}>Jump to Voyage (enter ID)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.devModalButton} onPress={() => {
              Alert.prompt('Jump to Lapidary', 'Enter sentence ID:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Go', onPress: (id) => { if (id) { setIsVisible(false); router.push(`/lapidary/${id}`); } }, style: 'default' },
              ]);
            }}>
              <Text style={styles.devModalButtonText}>Jump to Lapidary (enter ID)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.devModalButton} onPress={() => { setIsVisible(false); router.push('/orrery'); }}>
              <Text style={styles.devModalButtonText}>Jump to Orrery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.devModalButton} onPress={handlePing}>
              <Text style={styles.devModalButtonText}>Diagnostic Hub (Ping Backend)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.devModalButton, { borderColor: PhilologicalColors.ERROR }]} onPress={handleClearStorage}>
              <Text style={[styles.devModalButtonText, { color: PhilologicalColors.ERROR }]}>Clear AsyncStorage</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.devModalClose} onPress={() => setIsVisible(false)}>
              <Text style={styles.devModalCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function RootLayout() {
  const isDevMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
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
                  <Stack.Screen name="voyage/[id]" />
                  <Stack.Screen name="orrery/index" />
                  <Stack.Screen name="orrery/[lemma]" />
                  <Stack.Screen name="lapidary/[sentenceId]" />
                </Stack>

                {/* LAYER 2: GLOBAL OVERLAY */}
                <PhilologicalInspector />

                {/* LAYER 3: GOD-MODE OVERLAY */}
                {isDevMode && <DevScriptoriumOverlay />}

              </ThemeProvider>
            </PaperProvider>
          </GestureHandlerRootView>

        </View>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}

const styles = StyleSheet.create({
  devTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 2,
    backgroundColor: PhilologicalColors.GOLD,
    zIndex: 9999,
  },
  devSentinelContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 9999,
  },
  devSentinelButton: {
    backgroundColor: 'rgba(15, 5, 24, 0.6)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.4)',
    overflow: 'hidden',
  },
  devModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  devModalContent: {
    width: '80%',
    backgroundColor: PhilologicalColors.VOID,
    borderColor: PhilologicalColors.GOLD,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  devModalTitle: {
    fontFamily: PhilologicalFonts.DISPLAY,
    fontSize: 20,
    color: PhilologicalColors.GOLD,
    textAlign: 'center',
    marginBottom: 12,
  },
  devModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    alignItems: 'center',
  },
  devModalButtonText: {
    fontFamily: PhilologicalFonts.LABEL,
    fontSize: 14,
    color: PhilologicalColors.PARCHMENT,
  },
  devModalClose: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  devModalCloseText: {
    fontFamily: PhilologicalFonts.LABEL,
    fontSize: 12,
    color: PhilologicalColors.GRAY_TEXT,
    letterSpacing: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PhilologicalColors.VOID,
  },
});
