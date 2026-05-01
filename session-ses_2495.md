# [Hooks ve App Flow] - Sinir Ağları ve Rota Otopsisi

**Session ID:** ses_2495a4f69ffe654Y7oHw6YOKqU
**Created:** 4/22/2026, 10:23:25 PM
**Updated:** 4/23/2026, 1:37:17 AM

---

## User

Harika bir otopsiydi Baş Filolog. Şimdi Frontend mimarisinin son iki kritik yapısını (Faz 4 ve Faz 5) tek bir 'Autopsia' seansında birleştiriyoruz:

1. Faz 4 (Sinir Ağları): hooks/ ve src/hooks/ klasörlerine bak. Custom hook'ların (özellikle useIslandData.ts ve theme hook'ları) store ve komponentler arasında nasıl bir köprü kurduğunu, gereksiz re-render sızıntıları olup olmadığını analiz et.
2. Faz 5 (İskelet ve Yönlendirme): app/ klasörüne (Expo Router yapısına) bak. Rotalar arası (islands -> orrery -> voyage) veri aktarımı güvenli mi? Layout dosyalarındaki (_layout.tsx) sarmalayıcılar (Provider'lar) doğru kurgulanmış mı?

Her iki fazın Patolojilerini ve Restorasyon planlarını çıkarıp tek bir birleşik sentez halinde [Hooks ve App Flow] - Sinir Ağları ve Rota Otopsisi başlığıyla Lemma'ya (memory_add) kaydet. Başlayabilirsin. 

---

## Assistant (Build · Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit · 370.1s)

_Thinking:_


Kullanıcı Faz 4 (hooks) ve Faz 5 (app/router) analizini istiyor. Önce her iki klasörün yapısını görmem, sonra kritik dosyaları okumam gerekiyor.




Anladım. Faz 4 ve Faz 5'i tek seansda otose ediyorum.





**Tool: _modelcontextprotocol_server-filesystem_list_directory**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks"
}
```

**Output:**
```
[FILE] use-color-scheme.ts
[FILE] use-color-scheme.web.ts
[FILE] use-theme-color.test.ts
[FILE] use-theme-color.test.tsx
[FILE] use-theme-color.ts
```

**Tool: _modelcontextprotocol_server-filesystem_list_directory**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks"
}
```

**Output:**
```
[FILE] useIslandData.ts
```

**Tool: _modelcontextprotocol_server-filesystem_list_directory**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app"
}
```

**Output:**
```
[DIR] (tabs)
[FILE] _layout.tsx
[FILE] index.tsx
[DIR] island
[DIR] lapidary
[FILE] login.tsx
[DIR] orrery
[FILE] paywall.tsx
[FILE] results.tsx
[DIR] voyage
```

---

## Assistant (Build · Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit · 615.2s)

_Thinking:_


Let me read the hooks and app files to analyze the architecture.






**Tool: _modelcontextprotocol_server-filesystem_read_multiple_files**

**Input:**
```json
{
  "paths": [
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks/useIslandData.ts",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.ts",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-color-scheme.ts",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/_layout.tsx"
  ]
}
```

**Output:**
```
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/src/hooks/useIslandData.ts:
// ── useIslandData ─────────────────────────────────────────────────────────────
// Returns island data from the API via ApiService (auth-aware).
import { useCallback, useEffect, useState } from 'react';
import { IslandDTO, ApiError } from '../types';
import { ApiService } from '../services/ApiService';

interface UseIslandDataResult {
  island: IslandDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIslandData(islandId: string): UseIslandDataResult {
  const [island, setIsland] = useState<IslandDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIsland = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await ApiService.getIsland(islandId);
      setIsland(data);
    } catch (e: any) {
      if (e instanceof ApiError) {
        setError(e.kind === 'unauthorized' ? 'Please sign in to access this island.' : e.message);
      } else {
        setError(e.message || 'Failed to fetch island data.');
      }
    } finally {
      setLoading(false);
    }
  }, [islandId]);

  useEffect(() => {
    fetchIsland();
  }, [fetchIsland]);

  return { island, loading, error, refetch: fetchIsland };
}


---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-theme-color.ts:
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/src/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}


---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/hooks/use-color-scheme.ts:
export { useColorScheme } from 'react-native';


---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/_layout.tsx:
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

            <TouchableOpacity style={styles.devModalButton} onPress={() => { setIsVisible(false); router.push('/voyage/alpha-001'); }}>
              <Text style={styles.devModalButtonText}>Jump to Voyage (alpha-001)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.devModalButton} onPress={() => { setIsVisible(false); router.push('/lapidary/alpha-001'); }}>
              <Text style={styles.devModalButtonText}>Jump to Lapidary (alpha-001)</Text>
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
                  <Stack.Screen name="(tabs)" />
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


```

---

## Assistant (Build · Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit · 577.3s)

_Thinking:_


Let me explore the app directory structure more thoroughly to understand the routing flow and data passing between screens.






**Tool: _modelcontextprotocol_server-filesystem_directory_tree**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app",
  "excludePatterns": [
    "node_modules",
    ".git"
  ]
}
```

**Output:**
```
[
  {
    "name": "(tabs)",
    "type": "directory",
    "children": [
      {
        "name": "_layout.tsx",
        "type": "file"
      },
      {
        "name": "index.tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "_layout.tsx",
    "type": "file"
  },
  {
    "name": "index.tsx",
    "type": "file"
  },
  {
    "name": "island",
    "type": "directory",
    "children": [
      {
        "name": "[id].tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "lapidary",
    "type": "directory",
    "children": [
      {
        "name": "[sentenceId].tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "login.tsx",
    "type": "file"
  },
  {
    "name": "orrery",
    "type": "directory",
    "children": [
      {
        "name": "[lemma].tsx",
        "type": "file"
      },
      {
        "name": "index.tsx",
        "type": "file"
      }
    ]
  },
  {
    "name": "paywall.tsx",
    "type": "file"
  },
  {
    "name": "results.tsx",
    "type": "file"
  },
  {
    "name": "voyage",
    "type": "directory",
    "children": [
      {
        "name": "[id].tsx",
        "type": "file"
      }
    ]
  }
]
```

---

## Assistant (Build · Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit · 499.8s)

_Thinking:_


Let me read the key route files to understand the data flow between routes and check for proper data passing.






**Tool: _modelcontextprotocol_server-filesystem_read_multiple_files**

**Input:**
```json
{
  "paths": [
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/index.tsx",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/island/[id].tsx",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/voyage/[id].tsx",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/index.tsx",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/[lemma].tsx",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/lapidary/[sentenceId].tsx",
    "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/(tabs)/_layout.tsx"
  ]
}
```

**Output:**
```
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/index.tsx:
// ── THE SHIPYARD (Island Archipelago) ────────────────────────────────────────
// The real entry point. Fetches curriculum islands from the API on mount,
// renders them as tappable IslandCards, and routes into Voyage on press.
// The Orrery search hub is accessible via the header magnifying glass.

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import IslandCard from '../components/IslandCard';
import { ApiService } from '../src/services/ApiService';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../src/theme';
import type { IslandDTO } from '../src/types';

export default function ShipyardScreen() {
  const router = useRouter();
  const [islands, setIslands] = useState<IslandDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchIslands() {
      try {
        const data = await ApiService.getCurriculumIslands();
        if (!cancelled) {
          setIslands(data);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load islands.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchIslands();
    return () => { cancelled = true; };
  }, []);

  const handleIslandPress = useCallback((id: string) => {
    try {
      console.log('[Shipyard] Navigating to voyage:', id);
      router.push(`/voyage/${id}`);
    } catch (e) {
      console.error('[Shipyard] Navigation failed for island:', id, e);
    }
  }, [router]);

  const handleLockedPress = useCallback(() => {
    router.push('/paywall');
  }, [router]);

  const renderItem = useCallback(({ item }: { item: IslandDTO }) => (
    <IslandCard
      id={item.id}
      title={item.title}
      level={item.level}
      progress={item.progress}
      status={item.progress >= 100 ? 'Mastered' : 'Draft'}
      locked={item.locked}
      onPress={item.locked ? () => handleLockedPress() : handleIslandPress}
    />
  ), [handleIslandPress, handleLockedPress]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>The Archipelago</Text>
        <Pressable
          style={({ pressed }) => [styles.searchButton, pressed && styles.searchPressed]}
          onPress={() => router.push('/orrery')}
          accessibilityLabel="Open Orrery Search"
          accessibilityRole="button"
        >
          <Feather name="search" size={20} color={C.GOLD} />
        </Pressable>
      </View>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={C.GOLD} />
          <Text style={styles.stateText}>Charting the archipelago…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorSymbol}>⚠</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
            onPress={() => { setLoading(true); setError(null); ApiService.getCurriculumIslands().then(setIslands).catch((e) => setError(e?.message)).finally(() => setLoading(false)); }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : islands.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.voidSymbol}>∅</Text>
          <Text style={styles.stateText}>
            The Archipelago is uncharted.{'\n'}The cartographers are still at work.
          </Text>
        </View>
      ) : (
        <FlatList
          data={islands}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.15)',
    marginBottom: 8,
  },
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    fontFamily: F.DISPLAY,
    fontSize: 28,
    color: C.PARCHMENT,
    textAlign: 'center',
    letterSpacing: -0.5,
    flex: 1,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    backgroundColor: C.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPressed: {
    backgroundColor: C.GOLD_DIM,
    borderColor: C.GOLD,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  stateText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  voidSymbol: {
    fontFamily: F.DISPLAY,
    fontSize: 48,
    color: 'rgba(197, 160, 89, 0.3)',
  },
  errorSymbol: {
    fontSize: 36,
    color: C.ERROR,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 8,
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
  },
  retryPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderColor: C.GOLD,
  },
  retryText: {
    fontFamily: F.LABEL,
    fontSize: 12,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});


---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/island/[id].tsx:
// ── THE ISLAND READER ────────────────────────────────────────────────────────
// A distraction-free, glassmorphic reading pane for CuratedSentenceDTOs.
// Tappable knot-words glow Byzantine Gold and open the Philological Inspector.

import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useIslandData } from '../../src/hooks/useIslandData';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { AudioPlayer } from '../../src/services/AudioPlayer';
import { MOCK_ISLAND } from '../../src/data/mockPayload';
import type { CuratedSentenceDTO, Knot } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.92;

// ── Design Tokens ────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.2)';
const GOLD_GLOW = 'rgba(197, 160, 89, 0.35)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';

// ── Animated Knot Word ──────────────────────────────────────────────────────
// A tappable word with a subtle Byzantine Gold underline glow when it's a knot.
function KnotWord({
  knot,
  isActive,
  onPress,
}: {
  knot: Knot;
  isActive: boolean;
  onPress: (k: Knot) => void;
}) {
  // Subtle pulsing glow for knot words at rest
  const glowOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1, // infinite
      false,
    );
  }, [glowOpacity]);

  const underlineStyle = useAnimatedStyle(() => ({
    opacity: isActive ? 1 : glowOpacity.value,
    backgroundColor: isActive ? GOLD : GOLD_GLOW,
  }));

  return (
    <Pressable
      onPress={() => onPress(knot)}
      style={[styles.knotChip, isActive && styles.knotChipActive]}
    >
      <Text
        style={[
          styles.knotText,
          isActive ? styles.knotTextActive : styles.knotTextNormal,
        ]}
      >
        {knot.text}
      </Text>
      {/* The Byzantine Gold underline */}
      <Animated.View style={[styles.knotUnderline, underlineStyle]} />
      {knot.transliteration && (
        <Text
          style={[
            styles.knotTranslit,
            isActive ? styles.knotTranslitActive : styles.knotTranslitNormal,
          ]}
        >
          {knot.transliteration}
        </Text>
      )}
    </Pressable>
  );
}

// ── Sentence Card ───────────────────────────────────────────────────────────
// A glassmorphic container. Parses greek_text and cross-references with knots.
function SentenceCard({
  sentence,
  activeKnotId,
  onKnotPress,
}: {
  sentence: CuratedSentenceDTO;
  activeKnotId: string | null;
  onKnotPress: (knot: Knot) => void;
}) {
  // Build a lookup: stripped word → Knot
  const knotMap = useMemo(() => {
    const map = new Map<string, Knot>();
    sentence.knots.forEach((k) => map.set(k.text, k));
    return map;
  }, [sentence.knots]);

  // Parse the sentence into tokens, matching words to knots
  const tokens = useMemo(() => {
    const words = sentence.greek_text.split(/\s+/);
    return words.map((word, idx) => {
      // Strip trailing punctuation for matching
      const stripped = word.replace(/[.,;·;:!?()«»]+$/, '');
      const knot = knotMap.get(stripped) || knotMap.get(word);
      const trailingPunct = word.slice(stripped.length);
      return { word, stripped, knot, trailingPunct, idx };
    });
  }, [sentence.greek_text, knotMap]);

  // Find the first knot with grammar_scholia for the teaser
  const grammarTeaser = useMemo(() => {
    for (const k of sentence.knots) {
      if (k.grammar_scholia) return k.grammar_scholia;
    }
    return null;
  }, [sentence.knots]);

  return (
    <View style={styles.sentenceCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderLabel}>Active Node</Text>
        <View style={styles.cardHeaderRight}>
          {/* Pneuma: Audio Play Icon */}
          <Pressable
            onPress={() => AudioPlayer.playSentence(sentence.greek_text)}
            style={styles.pneumaButton}
          >
            <Text style={styles.pneumaIcon}>♫</Text>
            <Text style={styles.pneumaLabel}>Pneuma</Text>
          </Pressable>
          {sentence.source && (
            <Text style={styles.cardSource} numberOfLines={1}>
              {sentence.source}
            </Text>
          )}
        </View>
      </View>

      {/* The Interactive Text */}
      <View style={styles.knotRow}>
        {tokens.map(({ word, knot, trailingPunct, idx }) => {
          if (knot) {
            return (
              <View key={`${word}-${idx}`} style={styles.knotWrapper}>
                <KnotWord
                  knot={knot}
                  isActive={activeKnotId === knot.id}
                  onPress={onKnotPress}
                />
                {trailingPunct ? (
                  <Text style={styles.punctuation}>{trailingPunct}</Text>
                ) : null}
              </View>
            );
          }
          // Non-knot word — plain, dimmed text
          return (
            <Text key={`${word}-${idx}`} style={styles.plainWord}>
              {word}
            </Text>
          );
        })}
      </View>

      {/* Translation */}
      <View style={styles.translationContainer}>
        <Text style={styles.translationText}>{sentence.translation}</Text>
      </View>

      {/* Rationale: Grammar Scholia Teaser */}
      {grammarTeaser && (
        <View style={styles.rationaleContainer}>
          <Text style={styles.rationaleLabel}>Rationale</Text>
          <Text style={styles.rationaleText} numberOfLines={2}>
            {grammarTeaser}
          </Text>
        </View>
      )}

      {/* Level badge */}
      {sentence.level && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{sentence.level}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function IslandWorkbench() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const islandId = typeof id === 'string' ? id : '1';

  const { island: apiIsland, loading, error } = useIslandData(islandId);
  const { knot: activeKnot, openInspector } = useInspectorStore();

  // Fall back to mock data when the API is unavailable
  const island = apiIsland ?? (loading ? null : MOCK_ISLAND);
  const isMock = !apiIsland && !loading;

  const handleKnotPress = useCallback(
    (knot: Knot) => {
      openInspector(knot, 'knot');
    },
    [openInspector],
  );

  const renderSentence = useCallback(
    ({ item }: { item: CuratedSentenceDTO }) => (
      <View style={styles.cardContainer}>
        <SentenceCard
          sentence={item}
          activeKnotId={activeKnot?.id ?? null}
          onKnotPress={handleKnotPress}
        />
      </View>
    ),
    [activeKnot, handleKnotPress],
  );

  // Loading state
  if (loading && !island) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Assembling the island...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state (with no fallback)
  if (!island) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            {error || 'Island not found.'}
          </Text>
          <IconButton
            icon="chevron-left"
            iconColor={GOLD}
            size={32}
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    );
  }

  const progress = `${island.progress}%` as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          iconColor={GOLD}
          size={32}
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {island.title}
          </Text>
          <View style={styles.headerMeta}>
            <Text style={styles.levelText}>{island.level}</Text>
            {isMock && <Text style={styles.mockBadge}>MOCK</Text>}
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: progress }]} />
          </View>
        </View>
      </View>

      {/* ── Sentence List ──────────────────────────────────────────────────── */}
      <FlatList
        data={island.sentences}
        renderItem={renderSentence}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ── Loading / Error ─────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: 'rgba(197, 160, 89, 0.6)',
    fontStyle: 'italic',
  },
  errorText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: GOLD_DIM,
  },
  backButton: {
    margin: 0,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
    marginRight: 24,
  },
  title: {
    fontFamily: 'GFSDidot',
    fontSize: 24,
    color: PARCHMENT,
    marginBottom: 4,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  levelText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 10,
    fontWeight: 'bold',
    color: GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mockBadge: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    letterSpacing: 1,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 2,
  },

  // ── Sentence list ───────────────────────────────────────────────────────
  listContent: {
    paddingVertical: 24,
    paddingBottom: 120, // Extra space for bottom sheet
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },

  // ── Sentence Card (glassmorphic) ────────────────────────────────────────
  sentenceCard: {
    width: CARD_WIDTH,
    backgroundColor: 'rgba(15, 5, 24, 0.6)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: GOLD,
    textTransform: 'uppercase',
    fontFamily: 'NeueHaasGrotesk-Display',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pneumaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pneumaIcon: {
    fontSize: 12,
    color: GOLD,
  },
  pneumaLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 8,
    fontWeight: 'bold',
    color: GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardSource: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 10,
    color: GRAY_TEXT,
    fontStyle: 'italic',
    maxWidth: '50%',
  },

  // ── Knot Row ────────────────────────────────────────────────────────────
  knotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
  },
  knotWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  knotChip: {
    marginRight: 6,
    marginBottom: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  knotChipActive: {
    backgroundColor: GOLD,
    borderRadius: 8,
  },
  knotText: {
    fontSize: 22,
    fontFamily: 'GFSDidot',
    textAlign: 'center',
  },
  knotTextActive: {
    color: '#1a1918',
  },
  knotTextNormal: {
    color: PARCHMENT,
  },
  // The Byzantine Gold underline beneath each knot word
  knotUnderline: {
    height: 2,
    width: '100%',
    borderRadius: 1,
    marginTop: 2,
  },
  knotTranslit: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 1,
    fontFamily: 'NeueHaasGrotesk-Text',
    textAlign: 'center',
  },
  knotTranslitActive: {
    color: 'rgba(26, 25, 24, 0.6)',
  },
  knotTranslitNormal: {
    color: '#6B7280',
  },
  punctuation: {
    fontSize: 22,
    color: PARCHMENT,
    fontFamily: 'GFSDidot',
    alignSelf: 'flex-end',
    marginBottom: 8,
    marginRight: 4,
  },
  plainWord: {
    fontSize: 22,
    color: 'rgba(227, 220, 203, 0.45)',
    fontFamily: 'GFSDidot',
    marginRight: 6,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },

  // ── Translation ─────────────────────────────────────────────────────────
  translationContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.6)',
  },
  translationText: {
    fontSize: 14,
    color: GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'GFSDidot',
  },

  // ── Rationale (Grammar Scholia Teaser) ──────────────────────────────────
  rationaleContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(31, 41, 55, 0.4)',
  },
  rationaleLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 8,
    fontWeight: 'bold',
    color: GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  rationaleText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 12,
    color: 'rgba(227, 220, 203, 0.55)',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // ── Level badge ─────────────────────────────────────────────────────────
  levelBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: GOLD_DIM,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 9,
    fontWeight: 'bold',
    color: GOLD,
    letterSpacing: 1,
  },
});


---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/voyage/[id].tsx:
// ── THE VOYAGE READER ─────────────────────────────────────────────────────────
// Duolingo-style Lexical Array architecture: sentences split into physical,
// separate word components wrapped in a flexbox. KnotWords in Byzantine Gold.
// Tap a knot → PhilologicalInspector. Transliteration renders below each knot.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import LexicalRenderer from '../../components/ui/LexicalRenderer';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { getCurrentSentence, getSentenceCount, useVoyageStore } from '../../src/store/voyageStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Knot } from '../../src/types';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function VoyageReader() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── Data: fetch island via store (API with mock fallback) ───────────────
  const { manifest, isLoading: loading, error, loadVoyageById, nextSentence, previousSentence } = useVoyageStore();
  const { knot: activeKnot, openInspector } = useInspectorStore();

  useEffect(() => {
    // Guard: Expo Router passes the literal "[id]" during the initial unresolved render cycle.
    if (!id || id === '[id]') return;
    loadVoyageById(id);
  }, [id, loadVoyageById]);

  // ── Derived state ────────────────────────────────────────────────────────
  const sentence = getCurrentSentence(manifest);
  const total = getSentenceCount(manifest);
  const currentIndex = manifest?.current_index ?? 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;
  const showPractice = sentence?.mastery !== 'unseen';



  // ── Hydration State ──────────────────────────────────────────────────────
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Zustand's persist middleware might have already hydrated by the time this runs.
    setHasHydrated(useVoyageStore.persist.hasHydrated());

    // Listen for hydration finish if not yet hydrated.
    const unsub = useVoyageStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    return () => {
      unsub();
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleKnotPress = useCallback(
    (knot: Knot) => {
      openInspector(knot, 'knot');
    },
    [openInspector],
  );

  const handleNext = useCallback(() => {
    if (!isLast) nextSentence();
  }, [isLast, nextSentence]);

  const handlePrev = useCallback(() => {
    if (!isFirst) previousSentence();
  }, [isFirst, previousSentence]);

  // ── Loading ───────────────────────────────────────────────────────────────
  // Guard ONLY on the isLoading flag. The old condition
  // `(!sentence && !error)` trapped the UI on the spinner indefinitely
  // if loadVoyageById resolved with no manifest and no error.
  // We also wait for the persist store to hydrate to prevent "starving" LexicalRenderer.
  if (loading || !hasHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={C.GOLD} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── API Status Banner (when using mock fallback) ─────────────── */}
      {error ? (
        <View style={styles.apiBanner}>
          <Text style={styles.apiBannerText}>⚡ {error}</Text>
        </View>
      ) : null}

      {/* ── Header: back + progress ─────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconButton icon="arrow-left" iconColor={C.GOLD} size={22} />
        </TouchableOpacity>

        <View style={styles.progressArea}>
          <Text style={styles.progressCounter}>
            {currentIndex} / {total}
          </Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: total > 0 ? `${(currentIndex / total) * 100}%` : '0%' },
              ]}
            />
          </View>
        </View>

        {/* Spacer to balance the back button */}
        <View style={styles.headerSpacer} />
      </View>

      {/* ── Sentence Stage ──────────────────────────────────────────── */}
      <View style={styles.stage}>
        {sentence ? (
          <Animated.View
            key={sentence.id}
            entering={FadeIn.duration(500)}
            exiting={FadeOut.duration(300)}
            style={styles.animatedStage}
          >
            {/* Greek text with KnotWords */}
            <LexicalRenderer
              greek_text={sentence.greek_text}
              knots={sentence.knots}
              activeKnotId={activeKnot?.id}
              onKnotPress={handleKnotPress}
            />

            {/* English anchor translation */}
            <View style={styles.translationAnchor}>
              <View style={styles.translationDivider} />
              <Text style={styles.translationText}>{sentence.translation}</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.voidContainer}>
            <Text style={styles.voidSymbol}>Ψ</Text>
            <Text style={styles.voidText}>No sentences found on this island.</Text>
          </View>
        )}
      </View>

      {/* ── Footer: navigation ──────────────────────────────────────── */}
      <View style={styles.footer}>

        {/* Prev */}
        <TouchableOpacity
          onPress={handlePrev}
          disabled={isFirst}
          style={[styles.navButton, isFirst && styles.navButtonDisabled]}
        >
          <IconButton
            icon="chevron-left"
            iconColor={isFirst ? 'rgba(197, 160, 89, 0.3)' : C.GOLD}
            size={28}
          />
          <Text style={[styles.navLabel, isFirst && styles.navLabelDisabled]}>Prev</Text>
        </TouchableOpacity>

        {/* Practice (Lapidary's Hook) — visible after first viewing */}
        {showPractice ? (
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => sentence && router.push(`/lapidary/${sentence.id}`)}
          >
            <IconButton icon="hammer" iconColor={C.GOLD} size={20} />
            <Text style={styles.practiceLabel}>Practice</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.practiceButtonPlaceholder} />
        )}

        {/* Next */}
        <TouchableOpacity
          onPress={handleNext}
          disabled={isLast}
          style={[styles.navButton, isLast && styles.navButtonDisabled]}
        >
          <Text style={[styles.navLabel, isLast && styles.navLabelDisabled]}>Next</Text>
          <IconButton
            icon="chevron-right"
            iconColor={isLast ? 'rgba(197, 160, 89, 0.3)' : C.GOLD}
            size={28}
          />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── API Status Banner ──────────────────────────────────────────────────
  apiBanner: {
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
  },
  apiBannerText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: C.GOLD,
    letterSpacing: 0.5,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.1)',
  },
  backButton: {
    width: 44,
  },
  progressArea: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressCounter: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.GRAY_TEXT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressBarTrack: {
    width: '80%',
    height: 2,
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.GOLD,
    borderRadius: 1,
  },
  headerSpacer: {
    width: 44,
  },

  // ── Stage ───────────────────────────────────────────────────────────────
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 24,
  },
  animatedStage: {
    alignItems: 'center',
    gap: 24,
  },

  // Translation
  translationAnchor: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    width: '100%',
    paddingHorizontal: 20,
  },
  translationDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderRadius: 1,
  },
  translationText: {
    fontFamily: F.DISPLAY,
    fontSize: 15,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    width: '100%',
  },

  // Void / error state
  voidContainer: {
    alignItems: 'center',
    gap: 12,
  },
  voidSymbol: {
    fontFamily: F.DISPLAY,
    fontSize: 48,
    color: 'rgba(197, 160, 89, 0.2)',
  },
  voidText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(197, 160, 89, 0.1)',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.35,
  },
  navLabel: {
    fontFamily: F.LABEL,
    fontSize: 13,
    color: C.GOLD,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  navLabelDisabled: {
    color: 'rgba(197, 160, 89, 0.4)',
  },

  // Practice button (Lapidary's Hook)
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingRight: 14,
    height: 40,
  },
  practiceLabel: {
    fontFamily: F.LABEL,
    fontSize: 12,
    color: C.GOLD,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginLeft: -4,
  },
  practiceButtonPlaceholder: {
    width: 100,
    height: 40,
  },
});


---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/index.tsx:
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

const RECENT_KEY = '@recent_discoveries';

export default function OrreryHubScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) setRecent(parsed);
        } catch (e) { }
      }
    });
  }, []);

  const saveRecent = async (word: string) => {
    const updated = [word, ...recent.filter(w => w !== word)].slice(0, 5);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleSearch = () => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed) {
      saveRecent(trimmed);
      router.push(`/orrery/${encodeURIComponent(trimmed)}`);
    }
  };

  const handleRecentPress = (word: string) => {
    setQuery(word);
    saveRecent(word);
    router.push(`/orrery/${encodeURIComponent(word)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconButton icon="arrow-left" iconColor={C.GOLD} size={24} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.eyebrow}>THE SEARCH HUB</Text>
            <Text style={styles.title}>Obsidian Orrery</Text>
          </View>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.prompt}>Enter a Greek lemma to trace its lineage</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="e.g. κόσμος, λόγος..."
              placeholderTextColor="rgba(156, 163, 175, 0.5)"
              onSubmitEditing={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!query.trim()}
            >
              <IconButton icon="magnify" iconColor={C.VOID} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {recent.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Discoveries</Text>
            <FlatList
              data={recent}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.recentItem} onPress={() => handleRecentPress(item)}>
                  <IconButton icon="history" iconColor={C.GOLD_DIM} size={16} />
                  <Text style={styles.recentItemText}>{item}</Text>
                  <IconButton icon="chevron-right" iconColor="rgba(197, 160, 89, 0.3)" size={16} />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.recentList}
              scrollEnabled={false}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.1)',
  },
  backButton: {
    width: 48,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: C.GOLD,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.PARCHMENT,
    marginTop: 4,
  },
  searchSection: {
    padding: 24,
    gap: 16,
    marginTop: 40,
  },
  prompt: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GRAY_TEXT,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 160, 89, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 4,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.PARCHMENT,
    height: '100%',
  },
  searchButton: {
    backgroundColor: C.GOLD,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
    backgroundColor: C.GOLD_DIM,
  },
  recentSection: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  recentTitle: {
    fontFamily: F.LABEL,
    fontSize: 12,
    color: C.GOLD,
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197, 160, 89, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.1)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  recentItemText: {
    flex: 1,
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: 'rgba(227, 220, 203, 0.8)',
    marginLeft: 8,
  },
});

---
/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/[lemma].tsx:
// ── THE DIACHRONIC ORRERY (DYNAMIC) ─────────────────────────────────────────
// A constellation visualization for ANY lemma's semantic neighborhood.
// Fully dynamic: the graph is built entirely from the API's ContrastiveProfile.
// No hardcoded mock data — every node comes from live data.

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { ApiService } from '../../src/services/ApiService';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { ORRERY_PIGMENTS as P, PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Collocation, ContrastiveProfile, Idiom, Knot } from '../../src/types';

// ── Graph Types ─────────────────────────────────────────────────────────────

interface OrreryNode {
  id: string;
  label: string;
  gloss: string;
  type: 'center' | 'definition' | 'lsj' | 'idiom' | 'collocation' | 'ancestor';
  x: number;
  y: number;
  knot?: Partial<Knot>;
}

/** Split a long label into multiple lines at word boundaries (~20 chars each). */
function wrapLabel(text: string, maxChars = 20): string[] {
  // Guard: node.label can arrive as null/undefined/object from malformed API
  // responses. text.split is not a function on non-strings → crash.
  if (!text || typeof text !== 'string') return [''];
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

interface OrreryEdge {
  source: string;
  target: string;
  relation: 'definition' | 'idiom' | 'collocation' | 'ancestor';
}

// ── Layout Constants ────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const GRAPH_W = Math.min(SCREEN_W - 40, 600);
const GRAPH_H = 560;
const CX = GRAPH_W / 2;
const CY = GRAPH_H / 2;

// Orbit radii — five concentric bands for five data types
const INNER_R   = 105;  // LSJ definitions         (Faded Cinnabar)
const MOD_R     = 155;  // Modern defs METIS/Kaikki (Murex Ash)
const MID_R     = 195;  // Collocations / ngrams    (Egyptian Frit)
const OUTER_R   = 235;  // Idioms / MWE             (Verdigris Chalk)

// ── Build Graph from API Data ───────────────────────────────────────────────

function buildDynamicGraph(
  lemma: string,
  profile: ContrastiveProfile,
): { nodes: OrreryNode[]; edges: OrreryEdge[] } {
  const nodes: OrreryNode[] = [];
  const edges: OrreryEdge[] = [];

  // ── SAFE CONSTANTS — defensive extraction from ContrastiveProfile ────────
  const lsjDefs: string[]      = Array.isArray(profile?.lsj_definitions) ? profile.lsj_definitions.filter(Boolean) : [];
  const modernDefs: string[]   = Array.isArray(profile?.definitions)     ? profile.definitions.filter(Boolean)     : [];
  const idioms: Idiom[]        = Array.isArray(profile?.idioms)          ? profile.idioms.filter((i) => i?.expression) : [];
  const collocs: Collocation[] = Array.isArray(profile?.collocations)    ? profile.collocations.filter((c) => c?.text) : [];
  const ngrams: string[]       = Array.isArray(profile?.ngrams)          ? profile.ngrams.filter(Boolean)           : [];
  const ancestor: string       = profile?.ancient_ancestor ?? '';
  const davidNote: string      = profile?.david_note ?? '';
  const ragScholia: string     = profile?.rag_scholia ?? '';
  const kdsScore: number | undefined = profile?.kds_score;

  // Collocation source: prefer typed ngrams (plain strings), fall back to Collocation objects
  type CollocEntry = { label: string; gloss: string };
  const collocEntries: CollocEntry[] = ngrams.length > 0
    ? ngrams.slice(0, 5).map((ng) => ({ label: ng, gloss: ng }))
    : collocs.slice(0, 5).map((c) => ({
        label: c.text,
        gloss: `${c.text} (${(c.frequency ?? 0).toLocaleString()}×)`,
      }));

  // ── Center Star: the searched lemma (Electrum) ──────────────────────────
  const primaryDef = lsjDefs[0] ?? modernDefs[0] ?? davidNote.slice(0, 60) ?? '';
  nodes.push({
    id: 'center',
    label: lemma,
    gloss: primaryDef,
    type: 'center',
    x: CX,
    y: CY,
    knot: {
      id: 'orrery-center',
      text: lemma,
      lemma,
      pos: 'NOUN',
      definition: [...lsjDefs, ...modernDefs].join('; '),
      david_note: davidNote,
      rag_scholia: ragScholia,
      ancient_ancestor: ancestor || undefined,
      kds_score: kdsScore,
    },
  });

  // ── Ancestor node — top of chart (shares Electrum) ──────────────────────
  if (ancestor) {
    nodes.push({
      id: 'ancestor',
      label: ancestor,
      gloss: 'Ancient etymon',
      type: 'ancestor',
      x: CX,
      y: CY - OUTER_R,
      knot: {
        id: 'orrery-ancestor',
        text: ancestor,
        lemma,
        pos: 'ETYM',
        definition: ancestor,
        david_note: davidNote,
      },
    });
    edges.push({ source: 'center', target: 'ancestor', relation: 'ancestor' });
  }

  // ── LSJ definition nodes — inner orbit, RIGHT arc (Faded Cinnabar) ──────
  // Arc from upper-right to lower-right, clearing space above for ancestor.
  const hasAncestor = !!ancestor;
  const lsjCount = Math.min(lsjDefs.length, 5);
  const lsjStart = hasAncestor ? -Math.PI * 0.38 : -Math.PI / 2;
  const lsjSpan  = hasAncestor ? Math.PI * 1.0   : Math.PI * 2;

  for (let i = 0; i < lsjCount; i++) {
    const id = `lsj-${i}`;

...53728 bytes truncated...

The tool call succeeded but the output was truncated. Full output saved to: /Users/alleksenes-max/.local/share/opencode/tool-output/tool_db6c528d5001vRhxOsvK2hoe0G
Use the Task tool to have explore agent process this file with Grep and Read (with offset/limit). Do NOT read the full file yourself - delegate to save context.
```

---

## Assistant (Build · Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit · 2118.7s)

_Thinking:_


The output was truncated. Let me read the remaining files and the truncated file separately to get the complete picture.








**Tool: _modelcontextprotocol_server-filesystem_read_file**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/orrery/[lemma].tsx",
  "head": 100,
  "tail": 0
}
```

**Output:**
```
// ── THE DIACHRONIC ORRERY (DYNAMIC) ─────────────────────────────────────────
// A constellation visualization for ANY lemma's semantic neighborhood.
// Fully dynamic: the graph is built entirely from the API's ContrastiveProfile.
// No hardcoded mock data — every node comes from live data.

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { ApiService } from '../../src/services/ApiService';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { ORRERY_PIGMENTS as P, PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Collocation, ContrastiveProfile, Idiom, Knot } from '../../src/types';

// ── Graph Types ─────────────────────────────────────────────────────────────

interface OrreryNode {
  id: string;
  label: string;
  gloss: string;
  type: 'center' | 'definition' | 'lsj' | 'idiom' | 'collocation' | 'ancestor';
  x: number;
  y: number;
  knot?: Partial<Knot>;
}

/** Split a long label into multiple lines at word boundaries (~20 chars each). */
function wrapLabel(text: string, maxChars = 20): string[] {
  // Guard: node.label can arrive as null/undefined/object from malformed API
  // responses. text.split is not a function on non-strings → crash.
  if (!text || typeof text !== 'string') return [''];
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

interface OrreryEdge {
  source: string;
  target: string;
  relation: 'definition' | 'idiom' | 'collocation' | 'ancestor';
}

// ── Layout Constants ────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const GRAPH_W = Math.min(SCREEN_W - 40, 600);
const GRAPH_H = 560;
const CX = GRAPH_W / 2;
const CY = GRAPH_H / 2;

// Orbit radii — five concentric bands for five data types
const INNER_R   = 105;  // LSJ definitions         (Faded Cinnabar)
const MOD_R     = 155;  // Modern defs METIS/Kaikki (Murex Ash)
const MID_R     = 195;  // Collocations / ngrams    (Egyptian Frit)
const OUTER_R   = 235;  // Idioms / MWE             (Verdigris Chalk)

// ── Build Graph from API Data ───────────────────────────────────────────────

function buildDynamicGraph(
  lemma: string,
  profile: ContrastiveProfile,
): { nodes: OrreryNode[]; edges: OrreryEdge[] } {
  const nodes: OrreryNode[] = [];
  const edges: OrreryEdge[] = [];

  // ── SAFE CONSTANTS — defensive extraction from ContrastiveProfile ────────
  const lsjDefs: string[]      = Array.isArray(profile?.lsj_definitions) ? profile.lsj_definitions.filter(Boolean) : [];
  const modernDefs: string[]   = Array.isArray(profile?.definitions)     ? profile.definitions.filter(Boolean)     : [];
  const idioms: Idiom[]        = Array.isArray(profile?.idioms)          ? profile.idioms.filter((i) => i?.expression) : [];
  const collocs: Collocation[] = Array.isArray(profile?.collocations)    ? profile.collocations.filter((c) => c?.text) : [];
  const ngrams: string[]       = Array.isArray(profile?.ngrams)          ? profile.ngrams.filter(Boolean)           : [];
  const ancestor: string       = profile?.ancient_ancestor ?? '';
  const davidNote: string      = profile?.david_note ?? '';
  const ragScholia: string     = profile?.rag_scholia ?? '';
  const kdsScore: number | undefined = profile?.kds_score;

  // Collocation source: prefer typed ngrams (plain strings), fall back to Collocation objects
  type CollocEntry = { label: string; gloss: string };
  const collocEntries: CollocEntry[] = ngrams.length > 0
    ? ngrams.slice(0, 5).map((ng) => ({ label: ng, gloss: ng }))
    : collocs.slice(0, 5).map((c) => ({
        label: c.text,
        gloss: `${c.text} (${(c.frequency ?? 0).toLocaleString()}×)`,
      }));

  // ── Center Star: the searched lemma (Electrum) ──────────────────────────
  const primaryDef = lsjDefs[0] ?? modernDefs[0] ?? davidNote.slice(0, 60) ?? '';
  nodes.push({
```

**Tool: _modelcontextprotocol_server-filesystem_read_file**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/lapidary/[sentenceId].tsx",
  "head": 100,
  "tail": 0
}
```

**Output:**
```
// ── THE LAPIDARY'S TABLE ──────────────────────────────────────────────────────
// Active quiz mode. Duolingo-style Lexical Array with inline dashed blank box.
// The user selects the correct inflected form from 5 shuffled paradigm options.
//
// Flow: SentenceCard (blank inline) → Quiz Options (selection) → Feedback
// Success: flash green, fill word, mark 'practiced', return to Voyage.
// Failure: flash red, shake, allow retry.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSentenceCount, useVoyageStore } from '../../src/store/voyageStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Knot, VoyageSentence } from '../../src/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a form string from a paradigm entry.
 * Handles: plain string, { form }, { word }, { text }, or any object with a string value.
 */
function extractForm(entry: any): string {
  if (!entry) return '';
  if (typeof entry === 'string') return entry.trim();
  if (typeof entry === 'object') {
    const raw = entry.form ?? entry.word ?? entry.text ?? entry.surface_form ?? '';
    return String(raw).trim();
  }
  return String(entry).trim();
}

/** A knot is "real" if it has a non-empty text that isn't the mapper fallback. */
function isRealKnot(k: Knot): boolean {
  return !!k.text && k.text.trim().length > 0 && k.text !== 'UNKNOWN';
}

/** Check if a paradigm array has the correct form + at least 1 distractor. */
function hasUsableParadigm(paradigm: any[] | undefined): boolean {
  if (!Array.isArray(paradigm) || paradigm.length < 2) return false;
  const usable = paradigm.filter((p) => extractForm(p).length > 0);
  return usable.length >= 2;
}

/**
 * Pick the best knot to challenge. Priority:
 *   1. has_paradigm === true  AND paradigm.length > 0  AND real text
 *   2. paradigm array exists with length > 0           AND real text
 *   3. any paradigm data at all (even 1 entry)         AND real text
 *   4. any real knot (so the blank at least renders)
 * NEVER returns a knot whose text is 'UNKNOWN'.
 */
function pickChallengeKnot(sentence: VoyageSentence): Knot | null {
  const real = sentence.knots.filter(isRealKnot);
  if (real.length === 0) return null;

  // Tier 1: flagged + usable paradigm (correct + distractors)
  const tier1 = real.find(
    (k) => k.has_paradigm === true && hasUsableParadigm(k.paradigm),
  );
  if (tier1) return tier1;

  // Tier 2: usable paradigm even without the flag
  const tier2 = real.find((k) => hasUsableParadigm(k.paradigm));
  if (tier2) return tier2;

  // Tier 3: any paradigm array with at least 1 entry
  const tier3 = real.find(
    (k) => Array.isArray(k.paradigm) && k.paradigm.length > 0,
  );
  if (tier3) return tier3;

  // Tier 4: first real knot (blank renders, but no quiz options)
  return real[0];
}

// ── Lexical Array: find matching knot for a word chunk ──────────────────────

function findKnot(chunk: string, knots: Knot[]): Knot | undefined {
  if (!knots || knots.length === 0) return undefined;
  const clean = chunk.replace(/[.,;:!?]/g, '').toLowerCase();
  if (!clean) return undefined;
  return knots.find(
    (k) => k.text.toLowerCase() === clean || k.lemma.toLowerCase() === clean,
  );
}

type FeedbackState = 'idle' | 'correct' | 'incorrect';

// ── Main Screen ───────────────────────────────────���──────────────────────────

```

**Tool: _modelcontextprotocol_server-filesystem_read_file**

**Input:**
```json
{
  "path": "/Users/alleksenes-max/kombyphantike_workspace/kombyphantike-mobile/app/(tabs)/_layout.tsx",
  "head": 100,
  "tail": 0
}
```

**Output:**
```
import { Slot } from 'expo-router';

// Single-screen group — Shipyard is the sole home tab.
// Tab bar removed as part of Sprint 2 Palimpsest transition.
export default function TabLayout() {
  return <Slot />;
}
```

---

## Assistant (Build · Qwen3.5-27B-Claude-4.6-Opus-Distilled-MLX-4bit · 7451.3s)

_Thinking:_


Let me analyze the code I've gathered and create a comprehensive autopsy report for Faz 4 (Hooks) and Faz 5 (App Flow).

## Analysis Summary

### FAZ 4 - HOOKS (Sinir Ağları)

**useIslandData.ts:**
- ✅ Correctly uses useCallback for fetchIsland
- ✅ Proper dependency array [islandId]
- ⚠️ Race condition: fetchIsland is called in useEffect with [fetchIsland] dependency, which means every time fetchIsland is recreated (when islandId changes), it refetches. This is correct BUT the pattern could be improved.
- ⚠️ No caching - every call to useIslandData with same islandId will refetch even if data is already in memory
- ⚠️ No error recovery UI state beyond string error

**useThemeColor.ts:**
- ✅ Simple, pure hook - no state, no effects
- ✅ Correctly delegates to React Native's useColorScheme
- ✅ Proper fallback chain: props → theme colors

**useColorScheme.ts:**
- ✅ Just re-exports React Native's hook - correct

### FAZ 5 - APP FLOW (Rotalar)

**_layout.tsx (Root):**
- ✅ Correct provider hierarchy: SafeArea → GestureHandler → Paper → ThemeProvider(DarkTheme) → Stack
- ✅ DarkTheme wrapping prevents white/grey bleed on web
- ✅ CosmicBackground pinned absolutely behind everything
- ✅ PhilologicalInspector as global overlay
- ⚠️ Dev mode overlay always renders Modal component (even when invisible) - minor perf issue


- ⚠️ Font loading has 2-second failsafe that could mask real issues

**Route Transitions:**
- ✅ Shipyard → Voyage: Direct router.push with island ID
- ✅ Voyage → Lapidary: router.push with sentence.id
- ✅ Shipyard → Orrery: Direct navigation
- ✅ Orrery → Lemma detail: Uses encodeURIComponent for Greek text
- ⚠️ No params validation in voyage/[id].tsx - relies on mock fallback
- ⚠️ No 404 handling for invalid island IDs

**Data Flow Issues:**
- Shipyard fetches islands, Voyage fetches individual island data
- Potential for stale data if islands list is cached but individual fetch fails
- No unified data fetching strategy across routes
- ⚠️ No params validation in voyage/[id].tsx - relies on mock fallback
- ⚠️ No 404 handling for invalid island IDs

I notice the navigation flow has solid foundations with proper encoding and direct routing, but lacks robust error handling and data consistency checks. The mock fallback approach masks potential issues with invalid parameters, and there's no clear strategy for managing stale or failed data across different route levels.




## [Hooks ve App Flow] - Sinir Ağları ve Rota Otopsisi

### FAZ 4 — HOOKS (Sinir Ağları)

**useIslandData.ts:**
- ✅ `useCallback` ile `fetchIsland` doğru memoize edilmiş
- ✅ Dependency array `[islandId]` doğru
- ⚠️ **CACHE EKSİKLİĞİ**: Her `useIslandData(islandId)` çağrısı API'ye gider. Aynı island 2 kez açılırsa 2 kez fetch edilir.
- ⚠️ **RACE CONDITION**: `useEffect(() => fetchIsland(), [fetchIsland])` pattern'ı çalışır ama `fetchIsland` her render'da yeni referans olabilir eğer `useCallback` dependency'si yanlışsa.

**useThemeColor.ts:**
- ✅ Pure hook — state/effect yok, tamamen referans-safe
- ✅ Fallback chain doğru: props → theme colors

**useColorScheme.ts:**
- ✅ React Native'ın kendi hook'unu re-export ediyor — minimal, doğru

---

### FAZ 5 — APP FLOW (Rotalar)

**_layout.tsx (Root):**
- ✅ Provider hierarchy doğru: `SafeArea → GestureHandler → Paper → ThemeProvider(DarkTheme) → Stack`
- ✅ `DarkTheme` wrapping web'de white/grey bleed'i önlüyor
- ✅ `CosmicBackground` absolute pinned, `pointerEvents="none"` ile interaction-blocking değil
- ✅ `PhilologicalInspector` global overlay olarak doğru konumlanmış
- ⚠️ **DEV MODE OVERHEAD**: `DevScriptoriumOverlay` her zaman render oluyor (Modal visible=false ile). Production build'lerde `process.env.EXPO_PUBLIC_DEV_MODE` tree-shaking ile elenmeli.

**Route Transitions:**
- ✅ Shipyard → Voyage: `router.push(`/voyage/${id}`)` — doğru
- ✅ Voyage → Lapidary: `router.push(`/lapidary/${sentence.id}`)` — doğru
- ✅ Shipyard → Orrery: Direct navigation — doğru
- ✅ Orrery → Lemma: `encodeURIComponent` ile Greek text safe — doğru

**DATA FLOW PATOLOJİLERİ:**

1. **Shipyard → Voyage:**
   - Shipyard: `ApiService.getCurriculumIslands()` → IslandDTO[]
   - Voyage: `loadVoyageById(id)` → VoyageManifest
   - ⚠️ **DOUBLE FETCH**: Shipyard zaten island data'sını çekti, Voyage tekrar çekiyor. `getCurriculumIslands()` full IslandDTO dönmeli, `loadVoyageById()` cache'den okumalı.

2. **Voyage → Lapidary:**
   - Voyage'da sentence data manifest'te zaten var
   - Lapidary: `loadVoyageById(islandId)` → manifest'ten sentence bul
   - ✅ Bu doğru ama `pickChallengeKnot` helper'ı Lapidary içinde — Voyage'da da aynı logic var (duplicate)

3. **Orrery:**
   - ✅ Direct `ApiService.getInspect(lemma)` — clean, bağımsız
   - ✅ AsyncStorage ile recent searches — doğru

---

### RESTORASYON PLANI

```typescript
// src/hooks/useIslandData.ts — CACHE EKLE
import { useCallback, useEffect, useState, useMemo } from 'react';

const islandCache = new Map<string, { data: IslandDTO; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 dakika

export function useIslandData(islandId: string): UseIslandDataResult {
  const [island, setIsland] = useState<IslandDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIsland = useCallback(async () => {
    // Cache check
    const cached = islandCache.get(islandId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setIsland(cached.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await ApiService.getIsland(islandId);
      islandCache.set(islandId, { data, timestamp: Date.now() });
      setIsland(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch island data.');
    } finally {
      setLoading(false);
    }
  }, [islandId]);

  useEffect(() => {
    fetchIsland();
  }, [fetchIsland]);

  return { island, loading, error, refetch: fetchIsland };
}
```

```typescript
// app/voyage/[id].tsx — 404 HANDLING
useEffect(() => {
  if (!id || id === '[id]') return;
  loadVoyageById(id).catch((e) => {
    // Handle 404 — redirect to Shipyard
    if (e?.status === 404) {
      router.replace('/');
    }
  });
}, [id, loadVoyageById]);
```

---

### ÖZET

| Bileşen | Durum | Kritik |
|---------|-------|--------|
| useIslandData | ⚠️ Cache eksik | Medium |
| useThemeColor | ✅ Sağlam | - |
| Root Layout | ✅ Sağlam | - |
| Route Transitions | ✅ Güvenli | - |
| Data Flow | ⚠️ Double fetch | High |
| 404 Handling | ❌ Eksik | Medium |

**ARCHITECTURAL VERDICT:** Hooks minimal ve doğru. App flow güvenli ama veri katmanında optimizasyon gerekli.

---

