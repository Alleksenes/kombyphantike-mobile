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
