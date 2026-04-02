// ── THE LAPIDARY'S TABLE ──────────────────────────────────────────────────────
// Active practice mode for a specific sentence. The user must select the correct
// inflected form from the ParadigmGrid to fill a blanked KnotWord slot.
//
// Flow: SentenceCard (blank) → ParadigmGrid (selection) → Submit → Feedback
// Success: flash green, fill word, mark 'practiced', return to Voyage.
// Failure: flash red, shake, allow retry.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { useVoyageStore } from '../../src/store/voyageStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import ParadigmGrid from '../../components/ParadigmGrid';
import type { Knot, VoyageSentence } from '../../src/types';
import LexicalRenderer from '../../components/ui/LexicalRenderer';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Find the best knot to challenge: prefer one with paradigm data. */
function pickChallengeKnot(sentence: VoyageSentence): Knot | null {
  // First: a knot that has paradigm data
  const withParadigm = sentence.knots.find((k) => k.paradigm && k.paradigm.length > 0);
  if (withParadigm) return withParadigm;
  // Fallback: first knot with a lemma and definition
  return sentence.knots.find((k) => k.lemma && k.definition) ?? sentence.knots.find((k) => k.lemma) ?? sentence.knots[0] ?? null;
}

// ── Semantic Challenge Fallback Options ──────────────────────────────────────
const FALLBACK_GLOSSES = [
  'the inhabited world',
  'universe, totality',
  'to arrange, to adorn',
  'cosmic, worldly, secular',
  'to turn the world upside down',
  'order, class, rank',
];

type FeedbackState = 'idle' | 'correct' | 'incorrect';

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function LapidaryScreen() {
  const { sentenceId } = useLocalSearchParams<{ sentenceId: string }>();
  const router = useRouter();
  const { manifest, markPracticed } = useVoyageStore();

  // Find the sentence in the current voyage
  const sentence = useMemo(
    () => manifest?.sentences.find((s) => s.id === sentenceId) ?? null,
    [manifest, sentenceId],
  );

  const challengeKnot = useMemo(
    () => (sentence ? pickChallengeKnot(sentence) : null),
    [sentence],
  );

  const correctForm = challengeKnot?.text ?? '';

  // ── State ──────────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const shakeAnim = useRef(new Animated.Value(0)).current;

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

  // ── Cell press handler (from ParadigmGrid selection mode) ─────────────
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

  // ── Submit button (explicit confirm after selection) ───────────────────
  const handleSubmit = useCallback(() => {
    if (selectedForm) {
      handleCellPress(selectedForm);
    }
  }, [selectedForm, handleCellPress]);

  // ── Guard: no sentence / no knot ──────────────────────────────────────
  const hasParadigm = !!(challengeKnot?.paradigm && challengeKnot.paradigm.length > 0);

  // ── Semantic Challenge Options ───────────────────────────────────────────
  const semanticOptions = useMemo(() => {
    if (hasParadigm || !challengeKnot?.definition) return [];

    // Pick 2 distractor definitions from the sentence itself, or fallback
    const distractors = sentence?.knots
      .filter((k) => k.definition && k.definition !== challengeKnot.definition)
      .map((k) => k.definition as string) || [];

    while (distractors.length < 2) {
      const fallback = FALLBACK_GLOSSES[Math.floor(Math.random() * FALLBACK_GLOSSES.length)];
      if (fallback !== challengeKnot.definition && !distractors.includes(fallback)) {
        distractors.push(fallback);
      }
    }

    const options = [challengeKnot.definition, distractors[0], distractors[1]];
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }, [hasParadigm, challengeKnot, sentence]);

  // Semantic challenge validation
  const handleSemanticSelection = useCallback((gloss: string) => {
    if (feedback === 'correct') return;

    setSelectedForm(gloss);
    setAttempts((a) => a + 1);

    const isCorrect = gloss === challengeKnot?.definition;

    if (isCorrect) {
      setFeedback('correct');
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
  }, [feedback, sentence, challengeKnot, markPracticed, router, triggerShake]);

  if (!sentence || !challengeKnot) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.voidContainer}>
          <Text style={styles.voidSymbol}>Ψ</Text>
          <Text style={styles.voidText}>No challenges in this passage. Swipe to next.</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Return to Voyage</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <IconButton icon="arrow-left" iconColor={C.GOLD} size={22} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.eyebrow}>THE LAPIDARY'S TABLE</Text>
          <Text style={styles.headerLemma}>{challengeKnot.lemma}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TOP: Sentence Card with blank ─────────────────────────── */}
        <Animated.View
          style={[
            styles.sentenceCard,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <View style={styles.sentenceTextContainer}>
            <LexicalRenderer
              greek_text={sentence.greek_text}
              knots={sentence.knots}
              blankedKnotText={challengeKnot.text}
              selectedForm={feedback === 'correct' ? correctForm : selectedForm}
              feedback={feedback}
            />
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

        {/* ── MIDDLE: Paradigm Grid or Semantic Challenge ───────────────── */}
        {hasParadigm ? (
          <>
            <View style={styles.gridSection}>
              <Text style={styles.gridLabel}>
                Tap the correct form of{' '}
                <Text style={styles.gridLemma}>{challengeKnot.lemma}</Text>
              </Text>
              <ParadigmGrid
                paradigm={challengeKnot.paradigm!}
                pos={challengeKnot.pos}
                highlightForm={feedback === 'correct' ? correctForm : undefined}
                onCellPress={feedback !== 'correct' ? handleCellPress : undefined}
              />
            </View>

            {/* ── BOTTOM: Submit Button for Paradigm ─────────────────────────────────── */}
            {selectedForm && feedback === 'idle' && (
              <Pressable
                style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonPressed]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Confirm: {selectedForm}</Text>
              </Pressable>
            )}
          </>
        ) : (
          <View style={styles.gridSection}>
            <Text style={styles.gridLabel}>
              Semantic Challenge: Select the correct gloss (METIS / KAIKKI) for{' '}
              <Text style={styles.gridLemma}>{challengeKnot.lemma}</Text>
            </Text>
            <View style={styles.semanticOptions}>
              {semanticOptions.map((gloss, idx) => (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [
                    styles.semanticButton,
                    selectedForm === gloss && feedback === 'incorrect' && styles.semanticButtonIncorrect,
                    feedback === 'correct' && gloss === challengeKnot.definition && styles.semanticButtonCorrect,
                    pressed && styles.semanticButtonPressed,
                  ]}
                  onPress={() => feedback !== 'correct' && handleSemanticSelection(gloss)}
                >
                  <Text style={[
                    styles.semanticButtonText,
                    feedback === 'correct' && gloss === challengeKnot.definition && styles.semanticButtonTextCorrect
                  ]}>
                    {gloss}
                  </Text>
                </Pressable>
              ))}
            </View>
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
  sentenceTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
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

  // ── Submit Button ─────────────────────────────────────────────────────
  submitButton: {
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderColor: C.GOLD,
  },
  submitButtonText: {
    fontFamily: F.LABEL,
    fontSize: 13,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Semantic Challenge ────────────────────────────────────────────────
  semanticOptions: {
    gap: 12,
    marginTop: 8,
  },
  semanticButton: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  semanticButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderColor: C.GOLD,
  },
  semanticButtonCorrect: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: C.SUCCESS,
  },
  semanticButtonIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: C.ERROR,
  },
  semanticButtonText: {
    fontFamily: F.BODY,
    fontSize: 14,
    color: C.PARCHMENT,
    textAlign: 'center',
  },
  semanticButtonTextCorrect: {
    color: C.SUCCESS,
    fontWeight: 'bold',
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
});
