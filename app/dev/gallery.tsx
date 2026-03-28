// ── COMPONENT LABORATORY ─────────────────────────────────────────────────────
// Un-gated sandbox. No API calls. All data is hardcoded mock payloads.
// Boot target: the root index redirects here while the backend is offline.
//
// Sections:
//   § PhilologyCard   — sentence display with KnotWord gold highlights
//   § Mock Knots      — tap any knot row to open the Inspector at 'knot' depth

import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ParadigmChallenge from '../../components/lapidary/ParadigmChallenge';
import PhilologyCard from '../../components/PhilologyCard';
import { mockCuratedSentence } from '../../src/services/mock_data';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import type { Knot } from '../../src/types';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

// ── Mock Paradigm for the Workbench demo ────────────────────────────────────
const MOCK_PARADIGM = [
  { form: 'κόσμος', tags: ['Nom', 'Sg'] },
  { form: 'κόσμου', tags: ['Gen', 'Sg'] },
  { form: 'κόσμο', tags: ['Acc', 'Sg'] },
  { form: 'κόσμε', tags: ['Voc', 'Sg'] },
  { form: 'κόσμοι', tags: ['Nom', 'Pl'] },
  { form: 'κόσμων', tags: ['Gen', 'Pl'] },
  { form: 'κόσμους', tags: ['Acc', 'Pl'] },
  { form: 'κόσμοι', tags: ['Voc', 'Pl'] },
];

export default function GalleryScreen() {
  const openInspector = useInspectorStore((s) => s.openInspector);
  const router = useRouter();

  const handleKnotPress = (knot: Knot) => {
    openInspector(knot, 'translation');
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>KOMBYPHANTIKE · DEV</Text>
          <Text style={styles.title}>Component Laboratory</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Sandbox · No API · Mock Data</Text>
          </View>
        </View>

        {/* ── § PhilologyCard ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>§ PhilologyCard</Text>
          <Text style={styles.hint}>
            Tap a shimmering gold word to open the Inspector
          </Text>
          <PhilologyCard
            sentence={mockCuratedSentence.greek_text}
            translation={mockCuratedSentence.translation}
            knots={mockCuratedSentence.knots}
            onTokenPress={(token) => {
              const match = mockCuratedSentence.knots.find(
                (k) => k.text === token.text,
              );
              if (match) handleKnotPress(match);
            }}
          />
          <Text style={styles.metaLabel}>
            {mockCuratedSentence.source} · Level {mockCuratedSentence.level}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── § Mock Knots ──────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            § Mock Knots ({mockCuratedSentence.knots.length})
          </Text>
          <Text style={styles.hint}>
            Tap a row to open the Inspector at Knot depth
          </Text>
          {mockCuratedSentence.knots.map((knot) => (
            <TouchableOpacity
              key={knot.id}
              style={styles.knotRow}
              onPress={() => openInspector(knot, 'knot')}
              activeOpacity={0.7}
            >
              <View style={styles.knotLeft}>
                <Text style={styles.knotText}>{knot.text}</Text>
                <Text style={styles.knotLemma}>{knot.lemma}</Text>
              </View>
              <View style={styles.posBadge}>
                <Text style={styles.posText}>{knot.pos}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* ── § Paradigm Challenge (Lapidary's Table) ──────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>§ Lapidary's Table</Text>
          <Text style={styles.hint}>
            Fill the blank with the correct form of κόσμος
          </Text>
          <ParadigmChallenge
            sentence={'τον ________ και τον λόγος κατανοώ'}
            blankedWord="κόσμον"
            lemma="κόσμος"
            paradigm={MOCK_PARADIGM}
            pos="NOUN"
            knotLabel="II.2.1.1 · Masculine -ος/-οι Declension"
          />
        </View>

        <View style={styles.divider} />

        {/* ── § Orrery ──────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>§ Diachronic Orrery</Text>
          <Text style={styles.hint}>
            Explore the semantic constellation of κόσμος
          </Text>
          <TouchableOpacity
            style={styles.orreryLaunch}
            onPress={() => router.push({ pathname: '/orrery/[lemma]', params: { lemma: 'κόσμος' } } as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.orreryLaunchIcon}>✦</Text>
            <Text style={styles.orreryLaunchText}>Launch Orrery: κόσμος</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ── § Stubs ──────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>§ Upcoming Stubs</Text>
          {['SentenceReader', 'KnotWord'].map((name) => (
            <View key={name} style={styles.stubCard}>
              <Text style={styles.stubName}>{name}</Text>
              <Text style={styles.stubStatus}>Sprint 3</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Inspector is a global overlay — rendered in _layout.tsx
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    paddingBottom: 60,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.GOLD_DIM,
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: C.GOLD,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: F.DISPLAY,
    fontSize: 28,
    color: C.PARCHMENT,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.SUCCESS,
  },
  statusText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: C.GRAY_TEXT,
    letterSpacing: 0.5,
  },

  // ── Section ─────────────────────────────────────────────────────────────
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 12,
  },
  sectionLabel: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: C.GOLD,
  },
  hint: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.GRAY_TEXT,
    letterSpacing: 0.3,
    marginTop: -4,
  },
  metaLabel: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.4)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: C.GRAY_BORDER,
    marginHorizontal: 20,
    marginTop: 8,
  },

  // ── Knot Rows ─────────────────────────────────────────────────────────
  knotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  knotLeft: {
    gap: 2,
  },
  knotText: {
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: C.PARCHMENT,
  },
  knotLemma: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
  },
  posBadge: {
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  posText: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Stub Cards ──────────────────────────────────────────────────────────
  stubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 5, 24, 0.3)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  stubName: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: 'rgba(227, 220, 203, 0.3)',
    fontStyle: 'italic',
  },
  stubStatus: {
    fontFamily: F.LABEL,
    fontSize: 9,
    color: 'rgba(156, 163, 175, 0.4)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // ── Orrery Launch ────────────────────────────────────────────────────────
  orreryLaunch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  orreryLaunchIcon: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.GOLD,
  },
  orreryLaunchText: {
    fontFamily: F.LABEL,
    fontSize: 12,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.3)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
