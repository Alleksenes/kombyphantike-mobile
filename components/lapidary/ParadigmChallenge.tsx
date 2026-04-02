// ── THE LAPIDARY'S TABLE — Paradigm Challenge ────────────────────────────────
// A morphological workbench component: the user must inflect a lemma to fill
// a blanked-out slot in a real sentence, guided by the paradigm grid.
//
// Props:
//   sentence     — The Greek sentence with one word blanked
//   blankedWord  — The correct surface form that was removed
//   lemma        — The dictionary headword (shown as hint)
//   paradigm     — The paradigm table data (from Knot)
//   pos          — Part of speech (for ParadigmGrid rendering)
//   knotLabel    — The Knot rule label (e.g., "III.1.a Present Indicative")
//
// Interaction:
//   User taps a cell in the ParadigmGrid → Correct/Incorrect visual feedback.

import { useState, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

// ── Types ───────────────────────────────────────────────────────────────────

type ParadigmEntry = { form: string; tags: string[] };

type FeedbackState = 'idle' | 'correct' | 'incorrect';

interface ParadigmChallengeProps {
  sentence: string;
  blankedWord: string;
  lemma: string;
  paradigm: ParadigmEntry[];
  pos?: string;
  knotLabel?: string;
  onComplete?: (correct: boolean) => void;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ParadigmChallenge({
  sentence,
  blankedWord,
  lemma,
  paradigm,
  pos,
  knotLabel,
  onComplete,
}: ParadigmChallengeProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Split sentence around the blank
  const blankToken = '________';
  const sentenceParts = sentence.includes(blankToken)
    ? sentence.split(blankToken)
    : [sentence.replace(blankedWord, ''), '']; // fallback: remove the word

  const handleCellPress = useCallback((form: string) => {
    if (feedback === 'correct') return; // Already solved

    setSelectedForm(form);
    setAttempts((a) => a + 1);

    // Normalize comparison (strip accents for leniency, then exact match)
    const isCorrect = form.trim().toLowerCase() === blankedWord.trim().toLowerCase();

    if (isCorrect) {
      setFeedback('correct');
      onComplete?.(true);
    } else {
      setFeedback('incorrect');
      // Reset after brief feedback
      setTimeout(() => {
        setFeedback('idle');
        setSelectedForm(null);
      }, 800);
    }
  }, [blankedWord, feedback, onComplete]);

  // ── Feedback colors
  const blankBorderColor =
    feedback === 'correct' ? C.SUCCESS :
    feedback === 'incorrect' ? C.ERROR :
    C.GOLD;

  const blankBgColor =
    feedback === 'correct' ? 'rgba(52, 211, 153, 0.1)' :
    feedback === 'incorrect' ? 'rgba(239, 68, 68, 0.1)' :
    'rgba(197, 160, 89, 0.06)';

  return (
    <View style={styles.root}>
      {/* ── Knot Label (the rule being tested) ────────────────────────── */}
      {knotLabel ? (
        <View style={styles.knotLabelRow}>
          <View style={styles.knotIcon}>
            <Text style={styles.knotIconText}>K</Text>
          </View>
          <Text style={styles.knotLabelText}>{knotLabel}</Text>
        </View>
      ) : null}

      {/* ── The Sentence (left panel metaphor) ────────────────────────── */}
      <View style={styles.sentenceCard}>
        <Text style={styles.sentenceText}>
          {sentenceParts[0]}
          <View style={[styles.blankBox, { borderColor: blankBorderColor, backgroundColor: blankBgColor }]}>
            <Text style={[styles.blankText, feedback === 'correct' && styles.blankTextCorrect]}>
              {feedback === 'correct' ? blankedWord : selectedForm || lemma + '___'}
            </Text>
          </View>
          {sentenceParts[1]}
        </Text>

        {/* Feedback indicator */}
        {feedback !== 'idle' && (
          <View style={styles.feedbackRow}>
            <Text style={[
              styles.feedbackText,
              feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackIncorrect,
            ]}>
              {feedback === 'correct' ? '✓ Correct!' : '✗ Try again'}
            </Text>
            {feedback === 'correct' && attempts > 1 && (
              <Text style={styles.attemptsText}>{attempts} attempts</Text>
            )}
          </View>
        )}
      </View>

      {/* ── The Paradigm Grid (center panel — selection mode) ─────────── */}
      <View style={styles.gridSection}>
        <Text style={styles.gridLabel}>
          Tap the correct form of <Text style={styles.gridLemma}>{lemma}</Text>
        </Text>

        {/* Render paradigm cells as a selectable grid */}
        <View style={styles.cellGrid}>
          {paradigm.map((entry, i) => {
            // Safely extract the text form
            const formText = entry.form || (entry as any).word || (typeof entry === 'string' ? entry : '');

            const isSelected = selectedForm === formText;
            const isAnswer = formText.trim().toLowerCase() === blankedWord.trim().toLowerCase();
            const showAsCorrect = feedback === 'correct' && isAnswer;

            return (
              <View
                key={`${formText}-${i}`}
                style={[
                  styles.cell,
                  isSelected && feedback === 'incorrect' && styles.cellIncorrect,
                  showAsCorrect && styles.cellCorrect,
                ]}
              >
                <Text
                  style={[
                    styles.cellForm,
                    showAsCorrect && styles.cellFormCorrect,
                    isSelected && feedback === 'incorrect' && styles.cellFormIncorrect,
                  ]}
                  onPress={() => handleCellPress(formText)}
                >
                  {formText}
                </Text>
                <Text style={styles.cellTags}>
                  {entry.tags.join(' · ')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Evidence (right panel metaphor) ───────────────────────────── */}
      {feedback === 'correct' && (
        <View style={styles.evidenceCard}>
          <Text style={styles.evidenceLabel}>The Knot Revealed</Text>
          <Text style={styles.evidenceBody}>
            The form <Text style={styles.evidenceHighlight}>{blankedWord}</Text> is the correct
            inflection of <Text style={styles.evidenceHighlight}>{lemma}</Text>.
          </Text>
          {pos && (
            <View style={styles.evidenceBadge}>
              <Text style={styles.evidenceBadgeText}>{pos}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },

  // ── Knot Label ──────────────────────────────────────────────────────────
  knotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  knotIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.GOLD_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  knotIconText: {
    fontFamily: F.DISPLAY,
    fontSize: 14,
    color: C.GOLD,
    fontWeight: 'bold',
  },
  knotLabelText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    color: C.GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // ── Sentence Card ───────────────────────────────────────────────────────
  sentenceCard: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    borderRadius: 14,
    padding: 20,
  },
  sentenceText: {
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.PARCHMENT,
    lineHeight: 32,
    textAlign: 'center',
  },
  blankBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  blankText: {
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: C.GOLD,
    fontStyle: 'italic',
  },
  blankTextCorrect: {
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
  feedbackText: {
    fontFamily: F.LABEL,
    fontSize: 12,
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

  // ── Grid Section ────────────────────────────────────────────────────────
  gridSection: {
    gap: 10,
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
  cellGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 80,
  },
  cellCorrect: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: C.SUCCESS,
  },
  cellIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: C.ERROR,
  },
  cellForm: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.PARCHMENT,
  },
  cellFormCorrect: {
    color: C.SUCCESS,
    fontWeight: 'bold',
  },
  cellFormIncorrect: {
    color: C.ERROR,
  },
  cellTags: {
    fontFamily: F.LABEL,
    fontSize: 8,
    color: C.GRAY_TEXT,
    letterSpacing: 0.5,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ── Evidence Card (post-success reveal) ─────────────────────────────────
  evidenceCard: {
    backgroundColor: 'rgba(52, 211, 153, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  evidenceLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.SUCCESS,
  },
  evidenceBody: {
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.PARCHMENT,
    textAlign: 'center',
    lineHeight: 20,
  },
  evidenceHighlight: {
    fontFamily: F.DISPLAY,
    color: C.GOLD,
    fontStyle: 'italic',
  },
  evidenceBadge: {
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  evidenceBadgeText: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    color: C.GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
