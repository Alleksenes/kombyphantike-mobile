import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AudioPlayer } from '../../src/services/AudioPlayer';
import { useInspectorStore } from '../../src/store/inspectorStore';
import { AncientContext, EtymologyJewel } from '../WordChip';
import ParadigmGrid from '../ParadigmGrid';

type TabType = 'grammar' | 'context' | 'family';

// ── Custom frosted-glass background ──────────────────────────────────────────
const SheetBackground = ({ style }: { style?: any }) => (
  <View style={[style, styles.sheetBg]}>
    <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
    <View style={styles.sheetBgOverlay} />
  </View>
);

// ── Badge chip used for POS / morphology tags ─────────────────────────────────
const Badge = ({ label, isMorph = false }: { label: string; isMorph?: boolean }) => (
  <View style={[styles.badge, isMorph ? styles.badgeMorph : styles.badgeDefault]}>
    <Text style={[styles.badgeText, isMorph ? styles.badgeTextMorph : styles.badgeTextDefault]}>
      {label}
    </Text>
  </View>
);

// ── Museum Placard for ancient context ────────────────────────────────────────
const MuseumPlacard = ({ context }: { context: string | AncientContext | EtymologyJewel }) => {
  let author = 'Unknown Source';
  let greek = 'Greek text unavailable';
  let translation = 'Translation unavailable';
  let citations: string[] = [];

  if (typeof context === 'object' && context !== null) {
    author = context.author || author;
    greek = context.greek || greek;
    translation = context.translation || translation;
    if ('citations' in context && Array.isArray(context.citations)) {
      citations = context.citations;
    }
  } else if (context) {
    author = 'Context';
    translation = context;
  }

  return (
    <View style={styles.placard}>
      <Text style={styles.placardAuthor}>{author}</Text>
      <Text style={styles.placardGreek}>{greek}</Text>
      <View style={styles.placardDivider} />
      <Text style={styles.placardTranslation}>{translation}</Text>
      {citations.length > 0 && (
        <View style={styles.placardCitations}>
          <Text style={styles.placardCitationsLabel}>Citations</Text>
          {citations.map((cite, i) => (
            <Text key={i} style={styles.placardCiteText}>{cite}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function TheInspector() {
  const sheetRef = useRef<BottomSheet>(null);
  const { token, isOpen, closeInspector } = useInspectorStore();
  const [activeTab, setActiveTab] = useState<TabType>('grammar');

  const snapPoints = useMemo(() => ['50%', '85%'], []);

  useEffect(() => {
    if (isOpen && token) {
      sheetRef.current?.snapToIndex(0);
    } else if (!isOpen) {
      sheetRef.current?.close();
    }
  }, [isOpen, token]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) closeInspector();
  }, [closeInspector]);

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {(['grammar', 'context', 'family'] as TabType[]).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderGrammarTab = () => {
    if (!token) return null;
    return (
      <View style={styles.tabContent}>
        {/* Word + audio */}
        <View style={styles.wordRow}>
          <Text style={styles.wordText} numberOfLines={2}>{token.text}</Text>
          <IconButton
            icon="volume-high"
            iconColor="#C0A062"
            size={28}
            onPress={() => AudioPlayer.playSentence(token.text)}
          />
        </View>

        {/* POS + morphology badges */}
        <View style={styles.badgeRow}>
          {token.pos && <Badge label={token.pos} />}
          {token.tag && token.tag.split('|').filter(t => t !== '_').map((t) => (
            <Badge key={t} label={t} isMorph />
          ))}
        </View>

        {/* The Rule */}
        {token.knot_definition ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>The Rule</Text>
            <Text style={styles.infoCardBody}>{token.knot_definition}</Text>
          </View>
        ) : null}

        {/* The Logic */}
        {token.knot_context ? (
          <View style={[styles.infoCard, styles.infoCardGold]}>
            <Text style={[styles.infoCardLabel, styles.infoCardLabelGold]}>The Logic</Text>
            <Text style={[styles.infoCardBody, styles.infoCardBodyGold]}>{token.knot_context}</Text>
          </View>
        ) : null}

        {/* Morphology */}
        {token.morphology ? (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Morphology</Text>
            <Text style={styles.infoCardBody}>{token.morphology}</Text>
          </View>
        ) : null}

        {/* Lemma */}
        <View style={styles.lemmaRow}>
          <Text style={styles.lemmaLabel}>Lemma</Text>
          <View style={styles.lemmaRight}>
            <Text style={styles.lemmaText}>{token.lemma}</Text>
            <IconButton
              icon="volume-high"
              iconColor="#C0A062"
              size={20}
              onPress={() => AudioPlayer.playSentence(token.lemma)}
              style={{ margin: 0 }}
            />
          </View>
        </View>

        {/* Paradigm Grid */}
        <View style={styles.paradigmSection}>
          <Text style={styles.paradigmLabel}>Paradigm</Text>
          {token.has_paradigm && token.paradigm ? (
            <ParadigmGrid
              paradigm={token.paradigm}
              highlightForm={token.text}
              pos={token.pos}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No paradigm available.</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderContextTab = () => {
    if (!token) return null;
    const contextSource = token.etymology_json || token.ancient_context;
    return (
      <View style={styles.tabContent}>
        {token.definition && (
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Definition</Text>
            <Text style={[styles.infoCardBody, styles.infoCardBodyLarge]}>{token.definition}</Text>
          </View>
        )}
        {contextSource ? (
          <MuseumPlacard context={contextSource} />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No ancient context available.</Text>
          </View>
        )}
      </View>
    );
  };

  const renderFamilyTab = () => {
    if (!token) return null;
    return (
      <View style={styles.tabContent}>
        <View style={styles.familyCard}>
          <Text style={styles.infoCardLabel}>Related Forms</Text>
          <Text style={styles.familyBody}>
            Family relations for{' '}
            <Text style={styles.familyHighlight}>{token.text}</Text>
          </Text>
          <Text style={styles.familyFootnote}>
            (Etymological data and cognates are not yet charted in the stars)
          </Text>
        </View>
      </View>
    );
  };

  if (!token) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundComponent={SheetBackground}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.container}>
        {renderTabBar()}
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {activeTab === 'grammar' && renderGrammarTab()}
          {activeTab === 'context' && renderContextTab()}
          {activeTab === 'family' && renderFamilyTab()}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';
const GRAY_BORDER = 'rgba(55, 65, 81, 0.6)';
const SURFACE = 'rgba(15, 5, 24, 0.4)';

const styles = StyleSheet.create({
  // Sheet background
  sheetBg: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    backgroundColor: 'transparent',
  },
  sheetBgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 5, 24, 0.75)',
  },
  handle: {
    backgroundColor: GOLD,
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: GOLD,
  },
  tabText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: GRAY_TEXT,
  },
  tabTextActive: {
    color: GOLD,
  },

  // Tab content wrapper
  tabContent: {
    paddingBottom: 40,
    gap: 12,
  },

  // Word header row
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  wordText: {
    flex: 1,
    fontFamily: 'GFSDidot',
    fontSize: 36,
    color: PARCHMENT,
    fontWeight: 'bold',
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  badgeDefault: {
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderColor: 'rgba(55, 65, 81, 0.8)',
  },
  badgeMorph: {
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderColor: 'rgba(180, 83, 9, 0.6)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'NeueHaasGrotesk-Display',
  },
  badgeTextDefault: {
    color: GRAY_TEXT,
  },
  badgeTextMorph: {
    color: '#FCD34D',
  },

  // Info cards (Rule / Logic / Morphology)
  infoCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 10,
    padding: 12,
  },
  infoCardGold: {
    borderColor: GOLD_DIM,
  },
  infoCardLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: GRAY_TEXT,
    marginBottom: 6,
  },
  infoCardLabelGold: {
    color: GOLD,
  },
  infoCardBody: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: GRAY_TEXT,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  infoCardBodyGold: {
    color: GOLD,
    fontStyle: 'normal',
  },
  infoCardBodyLarge: {
    fontSize: 16,
    color: PARCHMENT,
    fontStyle: 'normal',
    lineHeight: 24,
  },

  // Lemma row
  lemmaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 10,
    padding: 12,
  },
  lemmaLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: GRAY_TEXT,
  },
  lemmaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lemmaText: {
    fontFamily: 'GFSDidot',
    fontSize: 18,
    color: PARCHMENT,
    fontStyle: 'italic',
    marginRight: 4,
  },

  // Paradigm section
  paradigmSection: {
    marginTop: 4,
  },
  paradigmLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: GOLD,
    marginBottom: 8,
  },

  // Empty state
  emptyCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: GRAY_TEXT,
    fontStyle: 'italic',
  },

  // Museum Placard
  placard: {
    backgroundColor: '#f4f1ea',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d6cfc0',
    padding: 24,
    marginTop: 4,
    alignItems: 'center',
  },
  placardAuthor: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C0A062',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  placardGreek: {
    fontFamily: 'GFSDidot',
    fontSize: 22,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  placardDivider: {
    height: 1,
    width: '30%',
    backgroundColor: '#ccc',
    marginBottom: 12,
  },
  placardTranslation: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: '#6D6D6D',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  placardCitations: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  placardCitationsLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  placardCiteText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 11,
    color: '#6D6D6D',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },

  // Family tab
  familyCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  familyBody: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  familyHighlight: {
    color: GOLD,
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
  familyFootnote: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 11,
    color: 'rgba(156, 163, 175, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
});
