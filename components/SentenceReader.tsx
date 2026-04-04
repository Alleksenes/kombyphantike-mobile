// ── SENTENCE READER ──────────────────────────────────────────────────────────
// STUB — Sprint 2 Palimpsest Vision
//
// The primary reading scroll of the Voyage. Renders a vertical sequence of
// CuratedSentenceDTOs as PhilologyCards with KnotWord highlights.
// Sentence advancement, mastery tracking, and the Lapidary challenge are
// wired here once voyageStore is connected.
//
// Props (planned):
//   manifest: VoyageManifest  — the ordered sentence sequence
//   onKnotPress: (knot) => void
//   onAdvance: () => void

import { StyleSheet, Text, View } from 'react-native';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../src/theme';

interface SentenceReaderProps {
  // TODO: manifest, onKnotPress, onAdvance
  [key: string]: never;
}

export default function SentenceReader(_props: SentenceReaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.glyph}>𝕾</Text>
      <Text style={styles.name}>SentenceReader</Text>
      <Text style={styles.note}>The primary reading scroll — Sprint 2</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.10)',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 36,
    marginVertical: 24,
    marginHorizontal: 20,
  },
  glyph: {
    fontSize: 36,
    color: 'rgba(197, 160, 89, 0.20)',
    marginBottom: 8,
  },
  name: {
    fontFamily: F.DISPLAY,
    fontSize: 22,
    color: 'rgba(227, 220, 203, 0.22)',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  note: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.30)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    lineHeight: 16,
  },
});
