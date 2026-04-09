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

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function LapidaryScreen() {
  const { sentenceId } = useLocalSearchParams<{ sentenceId: string }>();
  const router = useRouter();
  const { manifest, markPracticed } = useVoyageStore();

  // Guard: Expo Router passes the literal "[sentenceId]" during the initial
  // unresolved render cycle. Treat it as missing — show the void state.
  const resolvedId = (!sentenceId || sentenceId === '[sentenceId]') ? undefined : sentenceId;

  // Find the sentence in the current voyage + derive navigation
  const sentence = useMemo(
    () => resolvedId ? (manifest?.sentences.find((s) => s.id === resolvedId) ?? null) : null,
    [manifest, resolvedId],
  );

  const total = getSentenceCount(manifest);
  const sentenceIndex = useMemo(
    () => resolvedId ? (manifest?.sentences.findIndex((s) => s.id === resolvedId) ?? -1) : -1,
    [manifest, resolvedId],
  );
  const prevSentence = sentenceIndex > 0 ? manifest?.sentences[sentenceIndex - 1] : null;
  const nextSentence = sentenceIndex >= 0 && sentenceIndex < total - 1
    ? manifest?.sentences[sentenceIndex + 1]
    : null;

  const challengeKnot = useMemo(
    () => (sentence ? pickChallengeKnot(sentence) : null),
    [sentence],
  );

  const correctForm = challengeKnot?.text ?? '';

  // ── Lexical Array: split sentence into chunks preserving delimiters ─────
  const chunks = useMemo(
    () => (sentence ? sentence.greek_text.split(/([\s.,;:!?]+)/g).filter(Boolean) : []),
    [sentence],
  );

  // ── State ──────────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Build quiz options: 1 correct + up to 4 unique incorrect from paradigm ──
  useEffect(() => {
    if (!challengeKnot?.paradigm || challengeKnot.paradigm.length === 0 || !correctForm) {
      setQuizOptions([]);
      return;
    }

    const correct = correctForm.trim().toLowerCase();

    // We now use challengeKnot.morphology directly as an array.
    // If it's missing, fall back to parsing challengeKnot.tag.
    const tagsSource = challengeKnot.morphology && challengeKnot.morphology.length > 0
      ? challengeKnot.morphology
      : (challengeKnot.tag?.split('|').filter(t => t !== '_') || []);

    const targetTags = new Set(tagsSource.map(t => t.toLowerCase()));

    const seen = new Set<string>();
    const incorrectForms: { form: string; score: number }[] = [];

    // Score each paradigm entry by morphological similarity (intersection over tags)
    for (const p of challengeKnot.paradigm) {
      const form = extractForm(p);
      if (!form) continue;

      const normalized = form.toLowerCase();
      if (normalized === correct || seen.has(normalized)) continue;

      seen.add(normalized);

      let score = 0;
      if (p.tags && Array.isArray(p.tags)) {
        const pTags = p.tags.map((t: string) => t.toLowerCase());
        for (const t of pTags) {
          if (targetTags.has(t)) {
            score += 1;
          }
        }
      }

      // Add small random noise to break ties among equally similar distractors
      score += Math.random() * 0.1;
      incorrectForms.push({ form, score });
    }

    // Sort descending by score to get high intersection but different forms
    incorrectForms.sort((a, b) => b.score - a.score);

    // Pick top distractors
    const picked = incorrectForms.slice(0, 4).map(item => item.form);

    // We already sorted all `incorrectForms` by their score in descending order,
    // and picked the top 4. If we have less than 4 `incorrectForms` in total,
    // `picked` will naturally be smaller, and we use whatever is available.

    // Combine with correct form and shuffle all 5
    const options = [...picked, correctForm].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
  }, [challengeKnot, correctForm]);

  // ── Shake animation for incorrect answer ──────────────────────────────
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // ── Quiz option press handler ─────────────────────────────────────────
  const handleCellPress = useCallback(
    (form: string) => {
      if (feedback === 'correct') return;

      setSelectedForm(form);
      setAttempts((a) => a + 1);

      const isCorrect = form.trim().toLowerCase() === correctForm.trim().toLowerCase();

      if (isCorrect) {
        setFeedback('correct');
        // Mark practiced & return to voyage after a brief celebratory pause
        if (sentence) {
          markPracticed(sentence.id);
        }
        setTimeout(() => {
          router.back();
        }, 1200);
      } else {
        setFeedback('incorrect');
        triggerShake();
        setTimeout(() => {
          setFeedback('idle');
          setSelectedForm(null);
        }, 800);
      }
    },
    [correctForm, feedback, sentence, markPracticed, router, triggerShake],
  );

  // ── Feedback-dependent styling ────────────────────────────────────────
  const blankBorderColor =
    feedback === 'correct' ? C.SUCCESS :
      feedback === 'incorrect' ? C.ERROR :
        C.GOLD;

  const blankBgColor =
    feedback === 'correct' ? 'rgba(52, 211, 153, 0.15)' :
      feedback === 'incorrect' ? 'rgba(239, 68, 68, 0.15)' :
        'rgba(197, 160, 89, 0.06)';

  // ── Guard: no sentence / no knot ──────────────────────────────────────
  if (!sentence || !challengeKnot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.voidContainer}>
          <Text style={styles.voidSymbol}>Ψ</Text>
          <Text style={styles.voidText}>Poseidon has struck this land; no mortal may practice here yet.</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Return to Voyage</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const hasParadigm = hasUsableParadigm(challengeKnot.paradigm);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconButton icon="arrow-left" iconColor={C.GOLD} size={22} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.eyebrow}>THE LAPIDARY'S TABLE</Text>
          <Text style={styles.headerLemma}>
            {challengeKnot.lemma && challengeKnot.lemma !== 'UNKNOWN'
              ? challengeKnot.lemma
              : challengeKnot.text && challengeKnot.text !== 'UNKNOWN'
                ? challengeKnot.text
                : challengeKnot.pos || 'Practice'}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sentence Card: Lexical Array with INLINE blank ────────── */}
        <Animated.View
          style={[
            styles.sentenceCard,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {/* Flex-wrap row: each chunk is a physical inline entity */}
          <View style={styles.sentenceRow}>
            {chunks.map((chunk, i) => {
              // ── Delimiter chunk (whitespace / punctuation) → plain Text ──
              if (/^[\s.,;:!?]+$/.test(chunk)) {
                return <Text key={i} style={styles.punctText}>{chunk}</Text>;
              }

              // ── Word chunk → check if it's the challenge knot ─────────
              const knot = findKnot(chunk, sentence.knots);
              const isChallengeWord =
                knot != null &&
                challengeKnot != null &&
                knot.id === challengeKnot.id;

              if (isChallengeWord) {
                // ── INLINE DASHED BLANK BOX ─────────────────────────
                return (
                  <View
                    key={i}
                    style={[
                      styles.blankBox,
                      { borderColor: blankBorderColor, backgroundColor: blankBgColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.blankText,
                        feedback === 'correct' && styles.blankTextCorrect,
                        feedback === 'incorrect' && styles.blankTextIncorrect,
                      ]}
                    >
                      {feedback === 'correct' ? correctForm : selectedForm || '_______'}
                    </Text>
                  </View>
                );
              }

              // ── Other knot word → gold ────────────────────────────
              if (knot) {
                return (
                  <Text key={i} style={styles.sentenceKnotWord}>{chunk}</Text>
                );
              }

              // ── Plain word ────────────────────────────────────────
              return (
                <Text key={i} style={styles.sentenceWord}>{chunk}</Text>
              );
            })}
          </View>

          {/* Translation hint */}
          <View style={styles.translationRow}>
            <View style={styles.translationDivider} />
            <Text style={styles.translationText}>{sentence.translation}</Text>
          </View>

          {/* Feedback indicator */}
          {feedback !== 'idle' && (
            <View style={styles.feedbackRow}>
              <Text
                style={[
                  styles.feedbackText,
                  feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
                ]}
              >
                {feedback === 'correct' ? 'Correct!' : 'Try again'}
              </Text>
              {feedback === 'correct' && attempts > 1 && (
                <Text style={styles.attemptsText}>{attempts} attempts</Text>
              )}
            </View>
          )}
        </Animated.View>

        {/* ── Quiz Option Buttons: 5 paradigm forms below the sentence ── */}
        {hasParadigm && quizOptions.length > 0 ? (
          <View style={styles.gridSection}>
            <Text style={styles.gridLabel}>
              Select the correct form of{' '}
              <Text style={styles.gridLemma}>{challengeKnot.lemma}</Text>
            </Text>
            <View style={styles.quizOptionsContainer}>
              {quizOptions.map((form, i) => {
                const isCorrectAnswer = feedback === 'correct' && form.trim().toLowerCase() === correctForm.trim().toLowerCase();
                const isWrongSelection = feedback === 'incorrect' && selectedForm === form;
                return (
                  <Pressable
                    key={`${form}-${i}`}
                    style={({ pressed }) => [
                      styles.quizOption,
                      pressed && styles.quizOptionPressed,
                      isCorrectAnswer && styles.quizOptionCorrect,
                      isWrongSelection && styles.quizOptionIncorrect,
                    ]}
                    onPress={() => feedback !== 'correct' && handleCellPress(form)}
                    disabled={feedback === 'correct'}
                  >
                    <Text
                      style={[
                        styles.quizOptionText,
                        isCorrectAnswer && styles.quizOptionTextCorrect,
                        isWrongSelection && styles.quizOptionTextIncorrect,
                      ]}
                    >
                      {form}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.gridSection}>
            <Text style={styles.gridLabel}>
              No paradigm data available. Return to the Voyage to continue.
            </Text>
          </View>
        )}

        {/* Success: returning banner */}
        {feedback === 'correct' && (
          <View style={styles.successBanner}>
            <Text style={styles.successBannerText}>
              Returning to Voyage...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Footer: Prev / Next sentence navigation ─────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => prevSentence && router.replace(`/lapidary/${prevSentence.id}` as any)}
          disabled={!prevSentence}
          style={[styles.navButton, !prevSentence && styles.navButtonDisabled]}
        >
          <IconButton
            icon="chevron-left"
            iconColor={!prevSentence ? 'rgba(197, 160, 89, 0.3)' : C.GOLD}
            size={28}
          />
          <Text style={[styles.navLabel, !prevSentence && styles.navLabelDisabled]}>Prev</Text>
        </TouchableOpacity>

        {/* Counter */}
        <Text style={styles.footerCounter}>
          {sentenceIndex >= 0 ? sentenceIndex + 1 : '?'} / {total}
        </Text>

        <TouchableOpacity
          onPress={() => nextSentence && router.replace(`/lapidary/${nextSentence.id}` as any)}
          disabled={!nextSentence}
          style={[styles.navButton, !nextSentence && styles.navButtonDisabled]}
        >
          <Text style={[styles.navLabel, !nextSentence && styles.navLabelDisabled]}>Next</Text>
          <IconButton
            icon="chevron-right"
            iconColor={!nextSentence ? 'rgba(197, 160, 89, 0.3)' : C.GOLD}
            size={28}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: C.GOLD,
    textTransform: 'uppercase',
  },
  headerLemma: {
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.PARCHMENT,
    marginTop: 2,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    gap: 20,
  },

  // ── Sentence Card ─────────────────────────────────────────────────────
  sentenceCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },

  // ── Lexical Array: flex-wrap row ──────────────────────────────────────
  sentenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  punctText: {
    fontFamily: F.DISPLAY,
    fontSize: 22,
    color: 'rgba(227, 220, 203, 0.5)',
    lineHeight: 36,
  },
  sentenceWord: {
    fontFamily: F.DISPLAY,
    fontSize: 22,
    color: 'rgba(227, 220, 203, 0.7)',
    lineHeight: 36,
  },
  sentenceKnotWord: {
    fontFamily: F.DISPLAY,
    fontSize: 22,
    color: C.GOLD,
    lineHeight: 36,
  },

  // ── Inline dashed blank box ───────────────────────────────────────────
  blankBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  blankText: {
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.GOLD,
    fontStyle: 'italic',
  },
  blankTextCorrect: {
    color: C.SUCCESS,
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  blankTextIncorrect: {
    color: C.ERROR,
  },

  // Translation
  translationRow: {
    alignItems: 'center',
    gap: 10,
  },
  translationDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderRadius: 1,
  },
  translationText: {
    fontFamily: F.DISPLAY,
    fontSize: 13,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  feedbackText: {
    fontFamily: F.LABEL,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  feedbackCorrect: {
    color: C.SUCCESS,
  },
  feedbackIncorrect: {
    color: C.ERROR,
  },
  attemptsText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: C.GRAY_TEXT,
  },

  // ── Grid Section ──────────────────────────────────────────────────────
  gridSection: {
    gap: 12,
  },
  gridLabel: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.GRAY_TEXT,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  gridLemma: {
    fontFamily: F.DISPLAY,
    color: C.PARCHMENT,
    fontStyle: 'italic',
  },

  // ── Quiz Option Buttons (5 paradigm forms) ────────────────────────────
  quizOptionsContainer: {
    gap: 10,
  },
  quizOption: {
    backgroundColor: 'rgba(10, 15, 13, 0.5)',
    borderWidth: 1.5,
    borderColor: C.GRAY_BORDER,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  quizOptionPressed: {
    backgroundColor: C.GOLD_DIM,
    borderColor: C.GOLD,
  },
  quizOptionCorrect: {
    borderColor: C.SUCCESS,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  quizOptionIncorrect: {
    borderColor: C.ERROR,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  quizOptionText: {
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.PARCHMENT,
  },
  quizOptionTextCorrect: {
    color: C.SUCCESS,
    fontWeight: 'bold' as const,
  },
  quizOptionTextIncorrect: {
    color: C.ERROR,
  },

  // ── Success Banner ────────────────────────────────────────────────────
  successBanner: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successBannerText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.SUCCESS,
    letterSpacing: 1,
    fontStyle: 'italic',
  },

  // ── Void / Error ──────────────────────────────────────────────────────
  voidContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
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
  backLink: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backLinkText: {
    fontFamily: F.LABEL,
    fontSize: 12,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Footer Navigation ────────────────────────────────────────────────
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
  footerCounter: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.GRAY_TEXT,
    letterSpacing: 1,
  },
});
