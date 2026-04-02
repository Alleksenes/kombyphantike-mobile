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

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Find the best knot to challenge: prefer one with paradigm data. */
function pickChallengeKnot(sentence: VoyageSentence): Knot | null {
  // First: a knot that has paradigm data
  const withParadigm = sentence.knots.find((k) => k.paradigm && k.paradigm.length > 0);
  if (withParadigm) return withParadigm;
  // Fallback: first knot with a lemma
  return sentence.knots.find((k) => k.lemma) ?? sentence.knots[0] ?? null;
}

/** Build the sentence display with the target knot blanked out. */
function blankSentence(greekText: string, knotText: string): { before: string; after: string } {
  const idx = greekText.indexOf(knotText);
  if (idx === -1) return { before: greekText, after: '' };
  return {
    before: greekText.slice(0, idx),
    after: greekText.slice(idx + knotText.length),
  };
}

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
  const parts = useMemo(
    () => (sentence && challengeKnot ? blankSentence(sentence.greek_text, challengeKnot.text) : null),
    [sentence, challengeKnot],
  );

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
  if (!sentence || !challengeKnot || !parts) {
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

  const hasParadigm = challengeKnot.paradigm && challengeKnot.paradigm.length > 0;

  // ── Semantic Challenge Options (if no paradigm) ──────────
  const semanticOptions = useMemo(() => {
    if (hasParadigm || !sentence || !challengeKnot) return [];

    const correctDef = challengeKnot.definition || 'Unknown meaning';

    // Collect dummy definitions from other knots in the sentence
    const dummyDefs = sentence.knots
      .filter((k) => k.id !== challengeKnot.id && k.definition)
      .map((k) => k.definition as string);

    // If not enough dummies, add hardcoded fallbacks
    if (dummyDefs.length < 2) {
      dummyDefs.push('to speak', 'the people', 'city state');
    }

    // Pick 2 random dummies
    const shuffledDummies = dummyDefs.sort(() => 0.5 - Math.random()).slice(0, 2);

    // Combine and shuffle the 3 options
    return [correctDef, ...shuffledDummies].sort(() => 0.5 - Math.random());
  }, [hasParadigm, sentence, challengeKnot]);

  // Handle tap for Semantic Challenge mode
  const handleSemanticOptionPress = useCallback((option: string) => {
    if (feedback === 'correct') return;

    setSelectedForm(option);
    setAttempts((a) => a + 1);

    const correctDef = challengeKnot?.definition || 'Unknown meaning';
    const isCorrect = option === correctDef;

    if (isCorrect) {
      setFeedback('correct');
      if (sentence) markPracticed(sentence.id);
      setTimeout(() => router.back(), 1200);
    } else {
      setFeedback('incorrect');
      triggerShake();
      setTimeout(() => {
        setFeedback('idle');
        setSelectedForm(null);
      }, 800);
    }
  }, [feedback, challengeKnot, sentence, markPracticed, router, triggerShake]);

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
          <Text style={styles.sentenceText}>
            <Text style={styles.sentenceGreek}>{parts.before}</Text>
            <View
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
            <Text style={styles.sentenceGreek}>{parts.after}</Text>
          </Text>

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

        {/* ── MIDDLE: Paradigm Grid in Selection Mode ───────────────── */}
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

            {/* ── BOTTOM: Submit Button ─────────────────────────────────── */}
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
          /* Semantic Challenge */
          <View style={styles.gridSection}>
            <Text style={styles.gridLabel}>
              Select the correct translation for{' '}
              <Text style={styles.gridLemma}>{challengeKnot.lemma}</Text>
            </Text>
            <View style={styles.semanticOptionsContainer}>
              {semanticOptions.map((option, idx) => {
                const isSelected = selectedForm === option;
                const isOptionCorrect = option === (challengeKnot?.definition || 'Unknown meaning');

                let btnStyle = styles.semanticOption;
                let textStyle = styles.semanticOptionText;

                if (feedback === 'correct' && isOptionCorrect) {
                  btnStyle = styles.semanticOptionCorrect;
                  textStyle = styles.semanticOptionTextCorrect;
                } else if (feedback === 'incorrect' && isSelected) {
                  btnStyle = styles.semanticOptionIncorrect;
                  textStyle = styles.semanticOptionTextIncorrect;
                }

                return (
                  <Pressable
                    key={`${option}-${idx}`}
                    style={({ pressed }) => [
                      btnStyle,
                      pressed && feedback === 'idle' && styles.semanticOptionPressed
                    ]}
                    onPress={() => feedback !== 'correct' && handleSemanticOptionPress(option)}
                  >
                    <Text style={textStyle}>{option}</Text>
                  </Pressable>
                );
              })}
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
  sentenceText: {
    fontFamily: F.DISPLAY,
    fontSize: 22,
    color: C.PARCHMENT,
    lineHeight: 36,
    textAlign: 'center',
  },
  sentenceGreek: {
    fontFamily: F.DISPLAY,
    fontSize: 22,
    color: 'rgba(227, 220, 203, 0.7)',
  },
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
  semanticOptionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  semanticOption: {
    backgroundColor: 'rgba(197, 160, 89, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  semanticOptionPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    borderColor: 'rgba(197, 160, 89, 0.4)',
  },
  semanticOptionCorrect: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: C.SUCCESS,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  semanticOptionIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: C.ERROR,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  semanticOptionText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.PARCHMENT,
    textAlign: 'center',
  },
  semanticOptionTextCorrect: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.SUCCESS,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  semanticOptionTextIncorrect: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.ERROR,
    textAlign: 'center',
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
