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
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.15)',
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 32,
    margin: 16,
  },
  glyph: {
    fontSize: 32,
    color: 'rgba(197, 160, 89, 0.25)',
    marginBottom: 4,
  },
  name: {
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: 'rgba(227, 220, 203, 0.25)',
    fontStyle: 'italic',
  },
  note: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
