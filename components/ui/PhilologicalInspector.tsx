// ── THE PHILOLOGICAL INSPECTOR ────────────────────────────────────────────────
// A bottom sheet with Progressive Disclosure layers for deep word inspection.
// Fully wired to GET /inspect/{lemma} via unifiedInspectorStore.
//
// LAYER MODEL:
//   Level 'translation' (35%) — Word header + METIS definition + audio
//   Level 'knot'        (55%) — + Davidian Note + RAG Scholia + Grammar Scholia + LSJ
//   Level 'etymology'   (88%) — + Ancient Ancestor + Paradigm Matrix + HNC N-Grams
//                                + Idioms (METIS) + Explore Constellation
//
// SHALLOW KNOT RESILIENCE:
//   Every field render is guarded with optional chaining.
//   If the API returns 'void' (404), the frosted-glass Void card renders gracefully.

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import { AudioPlayer } from '../../src/services/AudioPlayer';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { DisclosureLevel } from '../../src/types';
import ParadigmGrid from '../ParadigmGrid';

// ── Bottom Sheet: Conditional import for web safety ─────────────────────────
// @gorhom/bottom-sheet can crash on web without proper gesture handler setup.
// On web, we render a simple modal overlay instead.
let BottomSheet: any = null;
let BottomSheetScrollView: any = null;
let BottomSheetView: any = null;

if (Platform.OS !== 'web') {
  try {
    const bs = require('@gorhom/bottom-sheet');
    BottomSheet = bs.default;
    BottomSheetScrollView = bs.BottomSheetScrollView;
    BottomSheetView = bs.BottomSheetView;
  } catch (e) {
    console.warn('BottomSheet not available:', e);
  }
}

// ── Disclosure Level Order ───────────────────────────────────────────────────
const LEVEL_ORDER: DisclosureLevel[] = ['translation', 'audio', 'knot', 'etymology'];
const LEVEL_SNAP_INDEX: Record<DisclosureLevel, number> = {
  translation: 0,
  audio: 0,
  knot: 1,
  etymology: 2,
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

// ── Depth Indicator (replaces tab bar) ───────────────────────────────────────
function DepthIndicator({
  currentLevel,
  onLevelPress,
}: {
  currentLevel: DisclosureLevel;
  onLevelPress: (level: DisclosureLevel) => void;
}) {
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);

  const labels: Record<DisclosureLevel, string> = {
    translation: 'Translation',
    audio: 'Audio',
    knot: 'The Knot',
    etymology: 'Etymology',
  };

  // Show only 3 tappable depth levels (translation/audio share the first slot)
  const displayLevels: DisclosureLevel[] = ['translation', 'knot', 'etymology'];

  return (
    <View style={styles.depthBar}>
      {displayLevels.map((level, i) => {
        const levelIdx = LEVEL_ORDER.indexOf(level);
        const isActive = currentIdx >= levelIdx;
        const isCurrent = currentLevel === level || (level === 'translation' && currentLevel === 'audio');
        return (
          <TouchableOpacity
            key={level}
            onPress={() => onLevelPress(level)}
            style={[styles.depthDot, isActive && styles.depthDotActive]}
          >
            <View style={[styles.depthDotInner, isActive && styles.depthDotInnerActive]} />
            {isCurrent && (
              <Text style={styles.depthLabel}>{labels[currentLevel]}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PhilologicalInspector() {
  const sheetRef = useRef<any>(null);
  const router = useRouter();
  const {
    knot,
    isOpen,
    isLoading,
    inspectError,
    disclosureLevel,
    closeInspector,
    setDisclosureLevel,
  } = useInspectorStore();

  const snapPoints = useMemo(() => ['35%', '55%', '88%'], []);

  useEffect(() => {
    if (isOpen && knot) {
      const snapIdx = LEVEL_SNAP_INDEX[disclosureLevel] ?? 0;
      sheetRef.current?.snapToIndex(snapIdx);
    } else if (!isOpen) {
      sheetRef.current?.close();
    }
  }, [isOpen, knot, disclosureLevel]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      closeInspector();
      return;
    }
    // Haptic tick on disclosure level transitions
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // Sync disclosure level from snap position
    if (index === 0) setDisclosureLevel('translation');
    else if (index === 1) setDisclosureLevel('knot');
    else if (index === 2) setDisclosureLevel('etymology');
  }, [closeInspector, setDisclosureLevel]);

  const handleLevelPress = useCallback((level: DisclosureLevel) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setDisclosureLevel(level);
    const snapIdx = LEVEL_SNAP_INDEX[level] ?? 0;
    sheetRef.current?.snapToIndex(snapIdx);
  }, [setDisclosureLevel]);

  // ── Word Header: Level 1 — Translation only ───────────────────────────────
  // Shows: Greek word (large) + audio button + definition.
  // Lemma, badges, KDS are promoted to Level 2 (renderWordMetadata).
  const renderWordHeader = () => {
    if (!knot) return null;
    return (
      <View style={styles.wordSection}>
        <View style={styles.wordRow}>
          <Text style={styles.wordText} numberOfLines={2}>{knot.text}</Text>
          <IconButton
            icon="volume-high"
            iconColor={C.GOLD}
            size={28}
            onPress={() => AudioPlayer.playSentence(knot.text)}
          />
        </View>

        {/* Definition — the "translation" at Level 1 */}
        {knot.definition ? (
          <Text style={styles.definitionText}>{knot.definition}</Text>
        ) : null}
      </View>
    );
  };

  // ── Word Metadata: shown at Level 2+ (lemma, badges, KDS) ─────────────────
  const renderWordMetadata = () => {
    if (!knot) return null;
    return (
      <>
        {/* Lemma row */}
        <View style={styles.lemmaRow}>
          <Text style={styles.lemmaLabel}>Lemma</Text>
          <View style={styles.lemmaRight}>
            <Text style={styles.lemmaText}>{knot.lemma}</Text>
            {knot.transliteration ? (
              <Text style={styles.translitText}>({knot.transliteration})</Text>
            ) : null}
            {/* KDS Badge inline */}
            {knot.kds_score != null && (
              <View style={styles.kdsBadge}>
                <Text style={styles.kdsLabel}>KDS</Text>
                <Text style={styles.kdsScore}>{knot.kds_score.toFixed(2)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* POS / morphology / CEFR badges */}
        <View style={styles.badgeRow}>
          {knot.pos ? <Badge label={knot.pos} /> : null}
          {knot.tag?.split('|').filter(t => t !== '_').map((t) => (
            <Badge key={t} label={t} variant="morph" />
          ))}
          {knot.cefr_level ? <Badge label={knot.cefr_level} variant="gold" /> : null}
        </View>
      </>
    );
  };

  // ── The Philological Void (404 / missing diachronic link) ──────────────────
  const renderVoidCard = () => (
    <View style={styles.voidCard}>
      <Text style={styles.voidSymbol}>Ψ</Text>
      <Text style={styles.voidTitle}>Philological Void</Text>
      <View style={styles.voidDivider} />
      <Text style={styles.voidBody}>
        The diachronic link is lost to time,{'\n'}or awaits philological excavation.
      </Text>
    </View>
  );

  // ── LAYER 2: THE KNOT (POS + morphology → Davidian Note → Scholia) ──────
  const renderKnotLayer = () => {
    if (!knot) return null;

    // Void state
    if (inspectError === 'void') return renderVoidCard();

    return (
      <>
        {/* Word metadata: lemma, badges, KDS */}
        {renderWordMetadata()}

        {/* ── POS & Morphological Parsing — prominent, before the note ────── */}
        {(knot.pos || knot.morphology) ? (
          <View style={styles.morphCard}>
            {knot.pos ? (
              <View style={styles.morphPosRow}>
                <Text style={styles.morphPosLabel}>Part of Speech</Text>
                <Text style={styles.morphPosValue}>{knot.pos}</Text>
              </View>
            ) : null}
            {knot.morphology ? (
              <View style={styles.morphParseRow}>
                <Text style={styles.morphParseLabel}>Morphological Parse</Text>
                <Text style={styles.morphParseValue}>{knot.morphology}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* The Davidian Note */}
        <View style={styles.noteCard}>
          <View style={styles.noteCardHeader}>
            <View style={styles.noteCardIcon}>
              <Text style={styles.noteCardIconText}>D</Text>
            </View>
            <Text style={styles.noteCardLabel}>Davidian Note</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color={C.GOLD} />
          ) : (
            <Text style={styles.noteCardBody}>
              {!knot.david_note || knot.david_note === 'Diachronic link undetermined.'
                ? 'The diachronic bridge is currently under construction.'
                : knot.david_note}
            </Text>
          )}
        </View>

        {/* The RAG Scholia — Holton citation */}
        {knot.rag_scholia ? (
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
        ) : null}

        {/* Grammar Scholia (merged RAG + Davidian synthesis) */}
        {knot.grammar_scholia ? (
          <View style={styles.noteCard}>
            <View style={styles.noteCardHeader}>
              <View style={styles.noteCardIcon}>
                <Text style={styles.noteCardIconText}>G</Text>
              </View>
              <Text style={styles.noteCardLabel}>Grammar Scholia</Text>
            </View>
            <Text style={styles.noteCardBody}>{knot.grammar_scholia}</Text>
          </View>
        ) : null}
      </>
    );
  };

  // ── LAYER 3: ETYMOLOGY (Ancestor → LSJ → Paradigm → Idioms → Collocations) ──
  const renderEtymologyLayer = () => {
    if (!knot) return null;
    if (inspectError === 'void') return null;

    return (
      <>
        {/* ── Ancient Ancestor — linked visually to LSJ ────────────────── */}
        {knot.ancient_ancestor ? (
          <View style={styles.ancestorCard}>
            <Text style={styles.ancestorLabel}>Ancient Ancestor</Text>
            <Text style={styles.ancestorText}>{knot.ancient_ancestor}</Text>
          </View>
        ) : null}

        {/* ── LSJ Definitions — Ancient Jewels, placed with ancestor ───── */}
        {!isLoading && knot.lsj_definitions && knot.lsj_definitions.length > 0 ? (
          <View style={styles.lsjCard}>
            <View style={styles.noteCardHeader}>
              <View style={styles.lsjIcon}>
                <Text style={styles.lsjIconText}>L</Text>
              </View>
              <Text style={styles.lsjLabel}>LSJ Definitions</Text>
            </View>
            {knot.lsj_definitions.map((def, i) => (
              <View key={i} style={styles.lsjRow}>
                <Text style={styles.lsjBullet}>{'\u2022'}</Text>
                <Text style={styles.lsjText}>{def}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Paradigm Grid — modern morphology, distinct from ancient ──── */}
        {isLoading ? (
          <View style={styles.emptyCard}>
            <ActivityIndicator size="small" color={C.GOLD} />
          </View>
        ) : knot.has_paradigm && knot.paradigm ? (
          <ParadigmGrid
            paradigm={knot.paradigm}
            highlightForm={knot.text}
            pos={knot.pos}
          />
        ) : null}

        {/* Idioms (METIS) */}
        {knot.idioms && knot.idioms.length > 0 ? (
          <View style={styles.idiomsCard}>
            <View style={styles.noteCardHeader}>
              <View style={styles.idiomsIcon}>
                <Text style={styles.noteCardIconText}>M</Text>
              </View>
              <Text style={styles.noteCardLabel}>Idioms (METIS)</Text>
            </View>
            {knot.idioms.map((idiom, i) => (
              <View key={i} style={styles.idiomRow}>
                <Text style={styles.idiomExpression}>{idiom.expression}</Text>
                <Text style={styles.idiomTranslation}>{idiom.translation}</Text>
                {idiom.source ? (
                  <Text style={styles.idiomSource}>{idiom.source}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* NGrams / Collocations */}
        {knot.ngrams && knot.ngrams.length > 0 ? (
          <View style={styles.noteCard}>
            <View style={styles.noteCardHeader}>
              <View style={styles.lsjIcon}>
                <Text style={styles.lsjIconText}>N</Text>
              </View>
              <Text style={styles.noteCardLabel}>Collocations</Text>
            </View>
            <View style={styles.ngramRow}>
              {knot.ngrams.map((ng, i) => (
                <Badge key={i} label={ng} variant="gold" />
              ))}
            </View>
          </View>
        ) : null}

        {/* ── THE ORRERY HOOK ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.orreryButton}
          onPress={() => {
            closeInspector();
            router.push({ pathname: '/orrery/[lemma]', params: { lemma: knot.lemma } } as any);
          }}
          activeOpacity={0.6}
        >
          <Text style={styles.orreryButtonIcon}>✦</Text>
          <Text style={styles.orreryButtonText}>Explore Constellation</Text>
        </TouchableOpacity>
      </>
    );
  };

  if (!knot) return null;

  // Determine which layers to show based on disclosure level
  const levelIdx = LEVEL_ORDER.indexOf(disclosureLevel);
  const showKnotLayer = levelIdx >= 2;   // 'knot' or deeper
  const showEtymologyLayer = levelIdx >= 3; // 'etymology' only

  // ── Shared content for both native BottomSheet and web overlay ──────────
  const sheetContent = (
    <>
      {/* Depth Indicator (replaces tab bar) */}
      <DepthIndicator
        currentLevel={disclosureLevel}
        onLevelPress={handleLevelPress}
      />

      <View style={styles.layerContent}>
        {/* LAYER 1: Translation / Audio — always visible */}
        {renderWordHeader()}

        <View style={styles.sectionDivider} />

        {/* LAYER 2: The Knot — visible at 'knot' and deeper */}
        {showKnotLayer && renderKnotLayer()}

        {/* LAYER 3: Etymology — visible at 'etymology' only */}
        {showEtymologyLayer && (
          <>
            <View style={styles.sectionDivider} />
            {renderEtymologyLayer()}
          </>
        )}
      </View>
    </>
  );

  // ── WEB FALLBACK: Slide-up overlay panel ───────────────────────────────
  if (Platform.OS === 'web' || !BottomSheet) {
    if (!isOpen) return null;
    return (
      <View style={styles.webOverlay}>
        <TouchableOpacity
          style={styles.webBackdrop}
          activeOpacity={1}
          onPress={closeInspector}
        />
        <View style={styles.webSheet}>
          <View style={styles.webHandleBar}>
            <View style={styles.handle} />
          </View>
          <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {sheetContent}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // ── NATIVE: @gorhom/bottom-sheet ───────────────────────────────────────
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
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {sheetContent}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
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
    backgroundColor: C.GOLD,
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ── Depth Indicator (replaces tab bar) ─────────────────────────────────
  depthBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.GRAY_BORDER,
    marginBottom: 16,
  },
  depthDot: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  depthDotActive: {},
  depthDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
  },
  depthDotInnerActive: {
    backgroundColor: C.GOLD,
    borderColor: C.GOLD,
  },
  depthLabel: {
    fontFamily: F.LABEL,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: C.GOLD,
    marginTop: 4,
  },

  // ── Layer content ──────────────────────────────────────────────────────
  layerContent: {
    paddingBottom: 48,
    paddingHorizontal: 4,
    gap: 16,
  },

  // ── Word header section ──────────────────────────────────────────────────
  wordSection: {
    gap: 10,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordText: {
    flex: 1,
    fontFamily: F.DISPLAY,
    fontSize: 36,
    color: C.PARCHMENT,
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
    backgroundColor: C.MORPH_BG,
    borderColor: C.MORPH_BORDER,
  },
  badge_gold: {
    backgroundColor: C.GOLD_DIM,
    borderColor: 'rgba(197, 160, 89, 0.4)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: F.LABEL,
  },
  badgeText_default: {
    color: C.GRAY_TEXT,
  },
  badgeText_morph: {
    color: C.MORPH_TEXT,
  },
  badgeText_gold: {
    color: C.GOLD,
  },
  lemmaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 10,
    padding: 12,
  },
  lemmaLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: C.GRAY_TEXT,
  },
  lemmaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lemmaText: {
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: C.PARCHMENT,
    fontStyle: 'italic',
  },
  translitText: {
    fontFamily: F.BODY,
    fontSize: 12,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
  },
  definitionText: {
    fontFamily: F.BODY,
    fontSize: 15,
    color: C.PARCHMENT,
    lineHeight: 24,
    paddingHorizontal: 4,
    letterSpacing: 0.15,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: C.GRAY_BORDER,
    marginVertical: 4,
  },

  // ── POS & Morphological Parse (Level 2 — before Davidian Note) ──────────
  morphCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.MORPH_BORDER,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  morphPosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  morphPosLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: C.GRAY_TEXT,
  },
  morphPosValue: {
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: C.MORPH_TEXT,
    fontWeight: 'bold',
  },
  morphParseRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(180, 83, 9, 0.2)',
    paddingTop: 10,
  },
  morphParseLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: C.GRAY_TEXT,
    marginBottom: 4,
  },
  morphParseValue: {
    fontFamily: F.BODY,
    fontSize: 14,
    color: C.PARCHMENT,
    fontStyle: 'italic',
    lineHeight: 22,
  },

  // ── THE KNOT (Davidian Note) ─────────────────────────────────────────────
  noteCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
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
    backgroundColor: C.GOLD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  noteCardIconText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GOLD,
    fontWeight: 'bold',
  },
  noteCardLabel: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.GOLD,
  },
  noteCardBody: {
    fontFamily: F.BODY,
    fontSize: 14,
    color: C.PARCHMENT,
    lineHeight: 23,
    letterSpacing: 0.1,
  },

  // ── THE SCHOLIA (RAG) ────────────────────────────────────────────────────
  scholiaCard: {
    backgroundColor: C.SCHOLIA_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.SCHOLIA_BORDER,
    padding: 24,
  },
  scholiaCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scholiaSource: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#C0A062',
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  scholiaSubtitle: {
    fontFamily: F.DISPLAY,
    fontSize: 14,
    color: C.SCHOLIA_TEXT,
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
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.SCHOLIA_TEXT,
    lineHeight: 22,
    letterSpacing: 0.1,
  },

  // ── Ancient Ancestor ─────────────────────────────────────────────────────
  ancestorCard: {
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  ancestorLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.GOLD,
    marginBottom: 8,
  },
  ancestorText: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.GOLD,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── KDS Badge ──────────────────────────────────────────────────────────
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kdsBadge: {
    alignItems: 'center',
    backgroundColor: C.GOLD_DIM,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  kdsLabel: {
    fontFamily: F.LABEL,
    fontSize: 8,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  kdsScore: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GOLD,
    fontWeight: 'bold',
  },

  // ── LSJ Definitions ───────────────────────────────────────────────────
  lsjCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.12)',
    borderRadius: 14,
    padding: 20,
  },
  lsjIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(192, 160, 98, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lsjIconText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: '#C0A062',
    fontWeight: 'bold',
  },
  lsjLabel: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#C0A062',
  },
  lsjRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    paddingLeft: 4,
  },
  lsjBullet: {
    fontFamily: F.BODY,
    fontSize: 14,
    color: C.GOLD,
    marginRight: 8,
    lineHeight: 22,
  },
  lsjText: {
    flex: 1,
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.PARCHMENT,
    lineHeight: 22,
  },

  // ── Idioms (METIS) ───────────────────────────────────────────────────────
  idiomsCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    borderRadius: 14,
    padding: 20,
  },
  idiomsIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(180, 83, 9, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  idiomRow: {
    marginTop: 12,
    paddingLeft: 4,
  },
  idiomExpression: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.PARCHMENT,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  idiomTranslation: {
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.GRAY_TEXT,
    lineHeight: 20,
  },
  idiomSource: {
    fontFamily: F.BODY,
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.5)',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // ── NGrams / Collocations ─────────────────────────────────────────────
  ngramRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  // ── Philological Void ─────────────────────────────────────────────────
  voidCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 15, 13, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.3)',
    borderRadius: 20,
    paddingVertical: 44,
    paddingHorizontal: 32,
  },
  voidSymbol: {
    fontFamily: F.DISPLAY,
    fontSize: 40,
    color: 'rgba(156, 163, 175, 0.3)',
    marginBottom: 12,
  },
  voidTitle: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    color: C.GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  voidDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    marginBottom: 12,
  },
  voidBody: {
    fontFamily: F.DISPLAY,
    fontSize: 14,
    color: 'rgba(156, 163, 175, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── The Orrery Hook ──────────────────────────────────────────────────────
  orreryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    borderRadius: 14,
    backgroundColor: 'rgba(197, 160, 89, 0.04)',
  },
  orreryButtonIcon: {
    fontFamily: F.DISPLAY,
    fontSize: 14,
    color: 'rgba(197, 160, 89, 0.5)',
  },
  orreryButtonText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    color: 'rgba(197, 160, 89, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // ── Empty state ──────────────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },

  // ── Web Overlay (replaces BottomSheet on web) ─────────────────────────
  webOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  webBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  webSheet: {
    maxHeight: '85%',
    backgroundColor: 'rgba(10, 15, 13, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
  },
  webHandleBar: {
    alignItems: 'center',
    paddingVertical: 12,
  },
});
