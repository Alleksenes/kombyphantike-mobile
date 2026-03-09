// ── THE PHILOLOGICAL INSPECTOR ────────────────────────────────────────────────
// A bottom sheet with three tabs for deep word inspection on the Island Workbench.
//   THE KNOT    — Davidian Note (AI-compiled evolutionary note)
//   THE SCHOLIA — RAG (raw academic citation from Holton)
//   THE PARADIGM — Declension/conjugation table

import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AudioPlayer } from '../../src/services/AudioPlayer';
import { usePhilologicalInspectorStore } from '../../src/store/philologicalInspectorStore';
import ParadigmGrid from '../ParadigmGrid';

type TabType = 'knot' | 'scholia' | 'paradigm';

const TAB_LABELS: Record<TabType, string> = {
  knot: 'The Knot',
  scholia: 'The Scholia',
  paradigm: 'The Paradigm',
};

// ── Custom frosted-glass background ──────────────────────────────────────────
const SheetBackground = ({ style }: { style?: any }) => (
  <View style={[style, styles.sheetBg]}>
    <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
    <View style={styles.sheetBgOverlay} />
  </View>
);

// ── Badge chip ───────────────────────────────────────────────────────────────
const Badge = ({ label, variant = 'default' }: { label: string; variant?: 'default' | 'morph' | 'gold' }) => (
  <View style={[styles.badge, styles[`badge_${variant}`]]}>
    <Text style={[styles.badgeText, styles[`badgeText_${variant}`]]}>
      {label}
    </Text>
  </View>
);

// ── Main component ───────────────────────────────────────────────────────────
export default function PhilologicalInspector() {
  const sheetRef = useRef<BottomSheet>(null);
  const { knot, isOpen, isLoading, activeTab, closeInspector, setActiveTab } = usePhilologicalInspectorStore();

  const snapPoints = useMemo(() => ['50%', '88%'], []);

  useEffect(() => {
    if (isOpen && knot) {
      sheetRef.current?.snapToIndex(0);
    } else if (!isOpen) {
      sheetRef.current?.close();
    }
  }, [isOpen, knot]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) closeInspector();
  }, [closeInspector]);

  // ── Tab bar ──────────────────────────────────────────────────────────────
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {(['knot', 'scholia', 'paradigm'] as TabType[]).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Word header (shared across tabs) ─────────────────────────────────────
  const renderWordHeader = () => {
    if (!knot) return null;
    return (
      <View style={styles.wordSection}>
        <View style={styles.wordRow}>
          <Text style={styles.wordText} numberOfLines={2}>{knot.text}</Text>
          <IconButton
            icon="volume-high"
            iconColor={GOLD}
            size={28}
            onPress={() => AudioPlayer.playSentence(knot.text)}
          />
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          {knot.pos && <Badge label={knot.pos} />}
          {knot.tag && knot.tag.split('|').filter(t => t !== '_').map((t) => (
            <Badge key={t} label={t} variant="morph" />
          ))}
        </View>

        {/* Lemma */}
        <View style={styles.lemmaRow}>
          <Text style={styles.lemmaLabel}>Lemma</Text>
          <View style={styles.lemmaRight}>
            <Text style={styles.lemmaText}>{knot.lemma}</Text>
            {knot.transliteration && (
              <Text style={styles.translitText}>({knot.transliteration})</Text>
            )}
          </View>
        </View>

        {/* Definition */}
        {knot.definition && (
          <Text style={styles.definitionText}>{knot.definition}</Text>
        )}
      </View>
    );
  };

  // ── Tab: THE KNOT (Davidian Note) ────────────────────────────────────────
  const renderKnotTab = () => {
    if (!knot) return null;
    return (
      <View style={styles.tabContent}>
        {renderWordHeader()}

        <View style={styles.sectionDivider} />

        {/* The Davidian Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteCardHeader}>
            <View style={styles.noteCardIcon}>
              <Text style={styles.noteCardIconText}>D</Text>
            </View>
            <Text style={styles.noteCardLabel}>Davidian Note</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={GOLD} />
          ) : (
            <Text style={styles.noteCardBody}>
              {knot.david_note === 'Diachronic link undetermined.'
                ? 'The diachronic bridge is currently under construction.'
                : knot.david_note}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // ── Tab: THE SCHOLIA (RAG) ───────────────────────────────────────────────
  const renderScholiaTab = () => {
    if (!knot) return null;
    return (
      <View style={styles.tabContent}>
        {renderWordHeader()}

        <View style={styles.sectionDivider} />

        {/* The RAG Scholia */}
        <View style={styles.scholiaCard}>
          <View style={styles.scholiaCardHeader}>
            <Text style={styles.scholiaSource}>Holton et al.</Text>
            <Text style={styles.scholiaSubtitle}>Greek: A Comprehensive Grammar</Text>
          </View>
          <View style={styles.scholiaDivider} />
          {isLoading ? (
            <ActivityIndicator size="small" color="#C0A062" />
          ) : (
            <Text style={styles.scholiaBody}>{knot.rag_scholia}</Text>
          )}
        </View>
      </View>
    );
  };

  // ── Tab: THE PARADIGM ────────────────────────────────────────────────────
  const renderParadigmTab = () => {
    if (!knot) return null;
    return (
      <View style={styles.tabContent}>
        {renderWordHeader()}

        <View style={styles.sectionDivider} />

        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color={GOLD} />
          </View>
        ) : knot.has_paradigm && knot.paradigm ? (
          <ParadigmGrid
            paradigm={knot.paradigm}
            highlightForm={knot.text}
            pos={knot.pos}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No paradigm available for this form.</Text>
          </View>
        )}
      </View>
    );
  };

  if (!knot) return null;

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
          {activeTab === 'knot' && renderKnotTab()}
          {activeTab === 'scholia' && renderScholiaTab()}
          {activeTab === 'paradigm' && renderParadigmTab()}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

// ── Design tokens ────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';
const GRAY_BORDER = 'rgba(55, 65, 81, 0.6)';
const SURFACE = 'rgba(15, 5, 24, 0.4)';

const styles = StyleSheet.create({
  // ── Sheet chrome ─────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(15, 5, 24, 0.85)',
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

  // ── Tab bar ──────────────────────────────────────────────────────────────
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
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: GRAY_TEXT,
  },
  tabTextActive: {
    color: GOLD,
  },

  // ── Tab content ──────────────────────────────────────────────────────────
  tabContent: {
    paddingBottom: 40,
    gap: 12,
  },

  // ── Word header section ──────────────────────────────────────────────────
  wordSection: {
    gap: 8,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordText: {
    flex: 1,
    fontFamily: 'GFSDidot',
    fontSize: 36,
    color: PARCHMENT,
    fontWeight: 'bold',
  },
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
  badge_default: {
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderColor: 'rgba(55, 65, 81, 0.8)',
  },
  badge_morph: {
    backgroundColor: 'rgba(120, 53, 15, 0.3)',
    borderColor: 'rgba(180, 83, 9, 0.6)',
  },
  badge_gold: {
    backgroundColor: GOLD_DIM,
    borderColor: 'rgba(197, 160, 89, 0.4)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'NeueHaasGrotesk-Display',
  },
  badgeText_default: {
    color: GRAY_TEXT,
  },
  badgeText_morph: {
    color: '#FCD34D',
  },
  badgeText_gold: {
    color: GOLD,
  },
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
    gap: 8,
  },
  lemmaText: {
    fontFamily: 'GFSDidot',
    fontSize: 18,
    color: PARCHMENT,
    fontStyle: 'italic',
  },
  translitText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 12,
    color: GRAY_TEXT,
    fontStyle: 'italic',
  },
  definitionText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: PARCHMENT,
    lineHeight: 20,
    paddingHorizontal: 4,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: GRAY_BORDER,
    marginVertical: 4,
  },

  // ── THE KNOT (Davidian Note) ─────────────────────────────────────────────
  noteCard: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: GOLD_DIM,
    borderRadius: 14,
    padding: 20,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GOLD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  noteCardIconText: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: GOLD,
    fontWeight: 'bold',
  },
  noteCardLabel: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: GOLD,
  },
  noteCardBody: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: PARCHMENT,
    lineHeight: 22,
  },

  // ── THE SCHOLIA (RAG) ────────────────────────────────────────────────────
  scholiaCard: {
    backgroundColor: '#f4f1ea',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d6cfc0',
    padding: 24,
  },
  scholiaCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scholiaSource: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C0A062',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  scholiaSubtitle: {
    fontFamily: 'GFSDidot',
    fontSize: 14,
    color: '#5D4037',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  scholiaDivider: {
    height: 1,
    width: '30%',
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  scholiaBody: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 21,
  },

  // ── Empty state ──────────────────────────────────────────────────────────
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
});
