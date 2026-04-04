// ── THE VOYAGE READER ─────────────────────────────────────────────────────────
// Duolingo-style Lexical Array architecture: sentences split into physical,
// separate word components wrapped in a flexbox. KnotWords in Byzantine Gold.
// Tap a knot → PhilologicalInspector. Transliteration renders below each knot.

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

// ── Lexical Array: find matching knot for a word chunk ──────────────────────
// Strips residual punctuation from the chunk, lowercases, and checks against
// every knot.text and knot.lemma. Returns the first match or undefined.

function findKnot(chunk: string, knots: Knot[]): Knot | undefined {
  if (!knots || knots.length === 0) return undefined;
  const clean = chunk.replace(/[.,;:!?]/g, '').toLowerCase();
  if (!clean) return undefined;
  return knots.find(
    (k) => k.text.toLowerCase() === clean || k.lemma.toLowerCase() === clean,
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

  // ── Lexical Array: split sentence into chunks preserving delimiters ─────
  const chunks = useMemo(
    () => (sentence ? sentence.greek_text.split(/([\s.,;:!?]+)/g).filter(Boolean) : []),
    [sentence],
  );

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
            {/* Greek text — Lexical Array: flexDirection row, flexWrap wrap */}
            <View style={styles.greekTextRow}>
              {chunks.map((chunk, i) => {
                // ── Delimiter chunk (whitespace / punctuation) → plain Text ──
                if (/^[\s.,;:!?]+$/.test(chunk)) {
                  return (
                    <Text key={i} style={styles.punctText}>{chunk}</Text>
                  );
                }

                // ── Word chunk → check against knots ────────────────────────
                const knot = findKnot(chunk, sentence.knots);

                if (knot) {
                  const isActive = activeKnot?.id === knot.id;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => handleKnotPress(knot)}
                      style={isActive ? styles.knotPressableActive : undefined}
                    >
                      <View style={styles.knotWordContainer}>
                        <Text style={[styles.knotGreekText, isActive && styles.knotGreekTextActive]}>
                          {chunk}
                        </Text>
                        {knot.transliteration ? (
                          <Text style={styles.transliterationText}>{knot.transliteration}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                }

                // ── Plain word — no knot match ──────────────────────────────
                return (
                  <Text key={i} style={styles.plainWordText}>{chunk}</Text>
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

  // ── Lexical Array: flex row with wrap ──────────────────────────────────
  greekTextRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  // Punctuation / whitespace chunk
  punctText: {
    fontFamily: F.DISPLAY,
    fontSize: 26,
    lineHeight: 42,
    color: 'rgba(227, 220, 203, 0.5)',
  },

  // Plain word (no knot match)
  plainWordText: {
    fontFamily: F.DISPLAY,
    fontSize: 26,
    lineHeight: 42,
    color: 'rgba(227, 220, 203, 0.7)',
  },

  // Knot word — Pressable container + inner stack
  knotPressableActive: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderRadius: 6,
  },
  knotWordContainer: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  knotGreekText: {
    fontFamily: F.DISPLAY,
    fontSize: 26,
    lineHeight: 42,
    color: C.GOLD,
    textAlign: 'center',
  },
  knotGreekTextActive: {
    color: C.GOLD,
  },

  // Transliteration — 12px italic gray below each knot
  transliterationText: {
    fontFamily: F.BODY,
    fontSize: 12,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
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
