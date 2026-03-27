// ── THE SHIPYARD (The Archipelago) ────────────────────────────────────────────
// Pure display component — renders island data from the store.
// No API calls on boot. Data is injected via curriculumStore in a future sprint.
// Boot state is the Void — the cartographers are still at work.

import { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import IslandCard from '../../components/IslandCard';
import type { IslandDTO } from '../../src/types';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

// Static placeholder — replaced by curriculumStore.islands in Sprint 2.
const ISLANDS: IslandDTO[] = [];

export default function ShipyardScreen() {
  const router = useRouter();

  const handleIslandPress = useCallback((id: string) => {
    router.push({ pathname: '/voyage/[id]', params: { id } });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Archipelago</Text>
      </View>

      {ISLANDS.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.voidSymbol}>∅</Text>
          <Text style={styles.voidText}>
            The Archipelago is uncharted.{'\n'}The cartographers are still at work.
          </Text>
        </View>
      ) : (
        <FlatList
          data={ISLANDS}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 160, 89, 0.15)',
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: F.DISPLAY,
    fontSize: 28,
    color: C.PARCHMENT,
    textAlign: 'center',
    letterSpacing: -0.5,
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
  voidSymbol: {
    fontFamily: F.DISPLAY,
    fontSize: 48,
    color: 'rgba(197, 160, 89, 0.3)',
  },
  voidText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
});
