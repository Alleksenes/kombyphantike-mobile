import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Knot } from '../../src/types';

// ── Token type for rendered sentence ─────────────────────────────────────────

export interface SentenceToken {
  text: string;
  knot?: Knot;
  trailingPunct?: string;
  isBlanked?: boolean;
}

// ── Multi-Word Tokenization ───────────────────────────────────────────────────

export function tokenizeSentence(greekText: string, knots: Knot[], blankedKnotText?: string): SentenceToken[] {
  if (!knots.length && !blankedKnotText) {
    return greekText.split(/\s+/).filter(Boolean).map((text) => ({ text }));
  }

  // Sort descending by text length so multi-word phrases match before single words
  const sortedKnots = [...knots].sort((a, b) => b.text.length - a.text.length);
  const PUNCT_RE = /^([.,;·;:!?()\[\]«»"]+)/;

  const tokens: SentenceToken[] = [];
  let remaining = greekText.trim();

  // If there's a blanked knot without a matching knot object, we still want to be able to blank it if matched textually
  // Actually, lapidary ensures we have the knot object usually, but the blankedKnotText is what we strictly match.

  while (remaining.length > 0) {
    let matched = false;

    // Check against knots
    for (const knot of sortedKnots) {
      const knotText = knot.text.trim();
      if (!knotText) continue;

      if (remaining.startsWith(knotText)) {
        const rest = remaining.slice(knotText.length);
        const punctMatch = rest.match(PUNCT_RE);
        const trailingPunct = punctMatch ? punctMatch[1] : '';

        const isBlanked = blankedKnotText === knotText;
        tokens.push({ text: knotText, knot, trailingPunct, isBlanked });
        remaining = rest.slice(trailingPunct.length).replace(/^\s+/, '');
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Check if it perfectly matches the blanked text even without a knot
      if (blankedKnotText && remaining.startsWith(blankedKnotText)) {
        const rest = remaining.slice(blankedKnotText.length);
        const punctMatch = rest.match(PUNCT_RE);
        const trailingPunct = punctMatch ? punctMatch[1] : '';

        tokens.push({ text: blankedKnotText, trailingPunct, isBlanked: true });
        remaining = rest.slice(trailingPunct.length).replace(/^\s+/, '');
        matched = true;
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
  onPress?: (knot: Knot) => void;
}) {
  const knot = token.knot!;

  return (
    <Pressable
      onPress={() => onPress?.(knot)}
      style={[styles.knotWord, isActive && styles.knotWordActive]}
      disabled={!onPress}
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

// ── BlankedBox component ────────────────────────────────────────────────────────

function BlankedBox({
  selectedForm,
  feedback,
}: {
  selectedForm?: string | null;
  feedback?: 'idle' | 'correct' | 'incorrect';
}) {
  const blankBorderColor =
    feedback === 'correct' ? C.SUCCESS :
    feedback === 'incorrect' ? C.ERROR :
    C.GOLD;

  const blankBgColor =
    feedback === 'correct' ? 'rgba(52, 211, 153, 0.15)' :
    feedback === 'incorrect' ? 'rgba(239, 68, 68, 0.15)' :
    'rgba(197, 160, 89, 0.06)';

  return (
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
        {selectedForm || '_______'}
      </Text>
    </View>
  );
}

// ── LexicalRenderer Component ─────────────────────────────────────────────────

export interface LexicalRendererProps {
  greek_text: string;
  knots: Knot[];
  activeKnotId?: string;
  onKnotPress?: (knot: Knot) => void;
  blankedKnotText?: string;
  selectedForm?: string | null;
  feedback?: 'idle' | 'correct' | 'incorrect';
}

export default function LexicalRenderer({
  greek_text,
  knots,
  activeKnotId,
  onKnotPress,
  blankedKnotText,
  selectedForm,
  feedback,
}: LexicalRendererProps) {
  const tokens = useMemo(
    () => tokenizeSentence(greek_text, knots, blankedKnotText),
    [greek_text, knots, blankedKnotText],
  );

  return (
    <View style={styles.greekTextRow}>
      {tokens.map((token, i) => {
        if (token.isBlanked) {
          return (
            <View key={i} style={styles.tokenWrapper}>
              <View style={styles.blankWrapper}>
                <BlankedBox selectedForm={selectedForm} feedback={feedback} />
              </View>
              {token.trailingPunct ? (
                <Text style={styles.greekPunct}>{token.trailingPunct}</Text>
              ) : null}
            </View>
          );
        }

        if (token.knot) {
          return (
            <View key={i} style={styles.tokenWrapper}>
              <KnotWord
                token={token}
                isActive={activeKnotId === token.knot.id}
                onPress={onKnotPress}
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
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
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

  // Blank Box
  blankWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4, // Aligns roughly with text baseline
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
    lineHeight: 30, // To match the larger font somewhat or keep stable
  },
  blankTextCorrect: {
    color: C.SUCCESS,
    fontStyle: 'normal',
    fontWeight: 'bold',
  },
  blankTextIncorrect: {
    color: C.ERROR,
  },
});
