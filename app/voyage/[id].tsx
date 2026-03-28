// ── THE VOYAGE READER ─────────────────────────────────────────────────────────
// Full-screen sentence-by-sentence philological reader.
// One sentence visible at a time. Greek text large + centered. KnotWords in
// Byzantine Gold. Tap a knot → PhilologicalInspector at Level 1 (Translation).
// English translation anchors below. Prev/Next navigation in the footer.

import { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { useVoyageStore, getCurrentSentence, getSentenceCount } from '../../src/store/voyageStore';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Knot } from '../../src/types';

// ── Token type for rendered sentence ─────────────────────────────────────────

interface SentenceToken {
  text: string;
  knot?: Knot;
  trailingPunct?: string;
}

// ── Multi-Word Tokenization ───────────────────────────────────────────────────
// Greedy longest-match: checks multi-word knot phrases (MWEs) before falling
// back to whitespace-delimited splitting. Handles trailing punctuation correctly.

function tokenizeSentence(greekText: string, knots: Knot[]): SentenceToken[] {
  if (!knots.length) {
    return greekText.split(/\s+/).filter(Boolean).map((text) => ({ text }));
  }

  // Sort descending by text length so multi-word phrases match before single words
  const sortedKnots = [...knots].sort((a, b) => b.text.length - a.text.length);
  const PUNCT_RE = /^([.,;·;:!?()\[\]«»"]+)/;

  const tokens: SentenceToken[] = [];
  let remaining = greekText.trim();

  while (remaining.length > 0) {
    let matched = false;

    for (const knot of sortedKnots) {
      const knotText = knot.text.trim();
      if (!knotText) continue;

      if (remaining.startsWith(knotText)) {
        const rest = remaining.slice(knotText.length);
        const punctMatch = rest.match(PUNCT_RE);
        const trailingPunct = punctMatch ? punctMatch[1] : '';
        tokens.push({ text: knotText, knot, trailingPunct });
        remaining = rest.slice(trailingPunct.length).replace(/^\s+/, '');
        matched = true;
        break;
      }
    }

    if (!matched) {
      // No knot matched — consume next whitespace-delimited word
      const wordMatch = remaining.match(/^(\S+)/);
      if (!wordMatch) break;
      const word = wordMatch[1];
      const stripped = word.replace(/[.,;·;:!?()\[\]«»"]+$/, '');
      const trailingPunct = word.slice(stripped.length);
      tokens.push({ text: stripped || word, trailingPunct });
      remaining = remaining.slice(word.length).replace(/^\s+/, '');
    }
  }

  return tokens;
}

// ── KnotWord component ────────────────────────────────────────────────────────

function KnotWord({
  token,
  isActive,
  onPress,
}: {
  token: SentenceToken;
  isActive: boolean;
  onPress: (knot: Knot) => void;
}) {
  const knot = token.knot!;

  return (
    <Pressable
      onPress={() => onPress(knot)}
      style={[styles.knotWord, isActive && styles.knotWordActive]}
    >
      <Text style={[styles.greekWord, styles.knotWordText, isActive && styles.knotWordTextActive]}>
        {token.text}
      </Text>
      <View style={[styles.knotUnderline, isActive && styles.knotUnderlineActive]} />
      {/* Transliteration — shown beneath each knot */}
      {knot.transliteration ? (
        <Text style={styles.transliterationText}>{knot.transliteration}</Text>
      ) : null}
      {/* CEFR micro-badge — only show for active knot with level data */}
      {isActive && knot.cefr_level ? (
        <Text style={styles.knotCefrBadge}>{knot.cefr_level}</Text>
      ) : null}
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function VoyageReader() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // ── Data: fetch island via store (API with mock fallback) ───────────────
  const { manifest, isLoading: loading, error, loadVoyageById, nextSentence, previousSentence } = useVoyageStore();
  const { knot: activeKnot, openInspector } = useInspectorStore();

  useEffect(() => {
    if (id) {
      loadVoyageById(id);
    }
  }, [id, loadVoyageById]);

  // ── Derived state ────────────────────────────────────────────────────────
  const sentence = getCurrentSentence(manifest);
  const total = getSentenceCount(manifest);
  const currentIndex = manifest?.current_index ?? 0;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= total - 1;
  const showPractice = sentence?.mastery !== 'unseen';

  // Tokenize current sentence for rendering
  const tokens = useMemo(
    () => (sentence ? tokenizeSentence(sentence.greek_text, sentence.knots) : []),
    [sentence],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  // Open the inspector at 'knot' depth — triggers GET /inspect/{lemma}
  // via unifiedInspectorStore to fetch the deep philological dossier
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
  if ((loading && !sentence) || (!sentence && !error)) {
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
            {currentIndex + 1} / {total}
          </Text>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: total > 0 ? `${((currentIndex + 1) / total) * 100}%` : '0%' },
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
          <>
            {/* Greek text with KnotWords */}
            <View style={styles.greekTextRow}>
              {tokens.map((token, i) => {
                if (token.knot) {
                  return (
                    <View key={i} style={styles.tokenWrapper}>
                      <KnotWord
                        token={token}
                        isActive={activeKnot?.id === token.knot.id}
                        onPress={handleKnotPress}
                      />
                      {token.trailingPunct ? (
                        <Text style={styles.greekPunct}>{token.trailingPunct}</Text>
                      ) : null}
                    </View>
                  );
                }
                return (
                  <View key={i} style={styles.tokenWrapper}>
                    <View style={styles.plainWordStack}>
                      <Text style={[styles.greekWord, styles.plainWord]}>
                        {token.text}
                      </Text>
                    </View>
                    {token.trailingPunct ? (
                      <Text style={styles.greekPunct}>{token.trailingPunct}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* English anchor translation */}
            <View style={styles.translationAnchor}>
              <View style={styles.translationDivider} />
              <Text style={styles.translationText}>{sentence.translation}</Text>
            </View>
          </>
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
  greekTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    rowGap: 16,
    columnGap: 8,
  },
  tokenWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  greekWord: {
    fontFamily: F.DISPLAY,
    fontSize: 34,
    lineHeight: 50,
    textAlign: 'center',
  },
  plainWord: {
    color: 'rgba(227, 220, 203, 0.7)',
  },
  greekPunct: {
    fontFamily: F.DISPLAY,
    fontSize: 34,
    lineHeight: 50,
    color: 'rgba(227, 220, 203, 0.5)',
    marginLeft: -2,
  },

  // KnotWord
  knotWord: {
    alignItems: 'center',
    paddingBottom: 2,
  },
  plainWordStack: {
    alignItems: 'center',
  },
  knotWordActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 2,
  },
  knotWordText: {
    color: C.GOLD,
  },
  knotWordTextActive: {
    color: C.GOLD,
  },
  knotUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(197, 160, 89, 0.45)',
    borderRadius: 1,
    marginTop: 2,
  },
  knotUnderlineActive: {
    backgroundColor: C.GOLD,
  },
  transliterationText: {
    fontFamily: F.BODY,
    fontSize: 12,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 3,
  },
  knotCefrBadge: {
    fontFamily: F.LABEL,
    fontSize: 8,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  // Translation
  translationAnchor: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
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
    maxWidth: '90%',
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
