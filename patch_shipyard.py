import re

content = """import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MonolithButton from '../../components/ui/MonolithButton';
import { ApiService } from '../../src/services/ApiService';
import type { CuratedSentenceDTO, Knot } from '../../src/types';
import { usePhilologicalInspectorStore } from '../../src/store/philologicalInspectorStore';
import { Dimensions, Pressable } from 'react-native';

// ── Knot Chip ────────────────────────────────────────────────────────────────
function KnotChip({ knot, isActive, onPress }: { knot: Knot; isActive: boolean; onPress: (k: Knot) => void }) {
  const isHeavy = ['NOUN', 'VERB', 'ADJ', 'PROPN'].includes(knot.pos);

  return (
    <Pressable
      onPress={() => onPress(knot)}
      style={[
        styles.knotChip,
        isActive ? styles.knotChipActive : styles.knotChipNormal,
        !isActive && isHeavy && styles.knotChipHeavy,
      ]}
    >
      <Text style={[styles.knotText, isActive ? styles.knotTextActive : styles.knotTextNormal]}>
        {knot.text}
      </Text>
      {knot.transliteration && (
        <Text style={[styles.knotTranslit, isActive ? styles.knotTranslitActive : styles.knotTranslitNormal]}>
          {knot.transliteration}
        </Text>
      )}
    </Pressable>
  );
}

// ── PhilologyCard (SentenceCard) ──────────────────────────────────────────────
function PhilologyCard({ sentence, activeKnotId, onKnotPress }: {
  sentence: CuratedSentenceDTO;
  activeKnotId: string | null;
  onKnotPress: (knot: Knot) => void;
}) {
  const tokens = sentence.greek_text.split(/\s+/).map((word, idx) => {
    const stripped = word.replace(/[.,;·;:!?()]+$/, '');
    const knot = sentence.knots.find(k => k.text === stripped || k.text === word);
    const trailingPunct = word.slice(stripped.length);
    return { word, stripped, knot, trailingPunct, idx };
  });

  return (
    <View style={styles.sentenceCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderLabel}>Active Node</Text>
        {sentence.source && (
          <Text style={styles.cardSource} numberOfLines={1}>{sentence.source}</Text>
        )}
      </View>

      <View style={styles.knotRow}>
        {tokens.map(({ word, knot, trailingPunct, idx }) => {
          if (knot) {
            return (
              <View key={`${word}-${idx}`} style={styles.knotWrapper}>
                <KnotChip
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
          return (
            <Text key={`${word}-${idx}`} style={styles.plainWord}>{word}</Text>
          );
        })}
      </View>

      <View style={styles.translationContainer}>
        <Text style={styles.translationText}>{sentence.translation}</Text>
      </View>

      {sentence.level && (
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{sentence.level}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ShipyardScreen() {
  const [sentences, setSentences] = useState<CuratedSentenceDTO[]>([]);
  const [isForging, setIsForging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { knot: activeKnot, openInspector } = usePhilologicalInspectorStore();

  const handleKnotPress = useCallback((knot: Knot) => {
    openInspector(knot, 'knot');
  }, [openInspector]);

  const renderItem = useCallback(({ item }: { item: CuratedSentenceDTO }) => (
    <View style={styles.cardContainer}>
      <PhilologyCard
        sentence={item}
        activeKnotId={activeKnot?.id ?? null}
        onKnotPress={handleKnotPress}
      />
    </View>
  ), [activeKnot, handleKnotPress]);

  const handleForge = async () => {
    setIsForging(true);
    setError(null);
    try {
      const sentence = await ApiService.synthesizeIsland();
      setSentences(prev => [sentence, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to forge island.');
    } finally {
      setIsForging(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          The Archipelago
        </Text>
      </View>

      <FlatList
        data={sentences}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || String(index)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <Text style={styles.emptyText}>The void is quiet. Forge a new island.</Text>
            )}
          </View>
        }
      />

      <View style={styles.footer}>
        {isForging ? (
          <ActivityIndicator size="large" color="#C5A059" />
        ) : (
          <MonolithButton
            label="Forge Island"
            onPress={handleForge}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.92;
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.2)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontWeight: 'bold',
    color: '#E3DCCB',
    textAlign: 'center',
    fontSize: 24,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
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
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
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
  },
  knotChipActive: {
    backgroundColor: '#C0A062',
    borderRadius: 8,
  },
  knotChipNormal: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  knotChipHeavy: {
    borderBottomColor: 'rgba(227, 220, 203, 0.2)',
  },
  knotText: {
    fontSize: 20,
    fontFamily: 'GFSDidot',
    textAlign: 'center',
  },
  knotTextActive: {
    color: '#1a1918',
  },
  knotTextNormal: {
    color: PARCHMENT,
  },
  knotTranslit: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: -2,
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
    fontSize: 20,
    color: PARCHMENT,
    fontFamily: 'GFSDidot',
    alignSelf: 'flex-end',
    marginBottom: 8,
    marginRight: 4,
  },
  plainWord: {
    fontSize: 20,
    color: 'rgba(227, 220, 203, 0.5)',
    fontFamily: 'GFSDidot',
    marginRight: 6,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },
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
"""

with open('app/(tabs)/shipyard.tsx', 'w') as f:
    f.write(content)
