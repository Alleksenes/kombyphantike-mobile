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
import { usePhilologicalInspectorStore } from '../../src/store/philologicalInspectorStore';
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

  return (
    <View style={styles.sentenceCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderLabel}>Active Node</Text>
        {sentence.source && (
          <Text style={styles.cardSource} numberOfLines={1}>
            {sentence.source}
          </Text>
        )}
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
  const { knot: activeKnot, openInspector } = usePhilologicalInspectorStore();

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
