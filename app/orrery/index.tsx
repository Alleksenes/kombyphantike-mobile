// ── THE ORRERY SEARCH HUB ────────────────────────────────────────────────────
// Universal entry point to the Diachronic Orrery. A search bar invites the
// user to query any Greek lemma. On submit, pushes to /orrery/<lemma>.

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

export default function OrrerySearchHub() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    router.push(`/orrery/${encodeURIComponent(trimmed)}` as any);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        {/* ── Back Button ──────────────────────────────────────────────── */}
        <View style={styles.backRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={12}
          >
            <Text style={styles.backIcon}>{'\u2039'}</Text>
          </Pressable>
        </View>

        {/* ── Constellation Symbol ─────────────────────────────────────── */}
        <Text style={styles.symbol}>{'\u2726'}</Text>

        {/* ── Title ────────────────────────────────────────────────────── */}
        <Text style={styles.eyebrow}>DIACHRONIC ORRERY</Text>
        <Text style={styles.title}>Search the Constellation...</Text>
        <Text style={styles.subtitle}>
          Enter any Greek lemma to explore its semantic neighborhood
        </Text>

        {/* ── Search Bar ───────────────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            placeholder="e.g. δίκη, κόσμος, ψυχή..."
            placeholderTextColor="rgba(156, 163, 175, 0.4)"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            selectionColor={C.GOLD}
          />
          <Pressable
            style={({ pressed }) => [
              styles.searchButton,
              pressed && styles.searchButtonPressed,
              !query.trim() && styles.searchButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!query.trim()}
          >
            <Text style={[
              styles.searchButtonText,
              !query.trim() && styles.searchButtonTextDisabled,
            ]}>
              Navigate
            </Text>
          </Pressable>
        </View>

        {/* ── Quick-access constellations ──────────────────────────────── */}
        <View style={styles.quickAccess}>
          <Text style={styles.quickLabel}>RECENT CONSTELLATIONS</Text>
          <View style={styles.quickChips}>
            {['κόσμος', 'δίκη', 'ψυχή', 'λόγος', 'ἀρετή'].map((lemma) => (
              <Pressable
                key={lemma}
                style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                onPress={() => router.push(`/orrery/${encodeURIComponent(lemma)}` as any)}
              >
                <Text style={styles.chipText}>{lemma}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 60,
  },

  // ── Back ────────────────────────────────────────────────────────────────
  backRow: {
    position: 'absolute',
    top: 12,
    left: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 15, 13, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderColor: C.GOLD,
  },
  backIcon: {
    color: C.GOLD,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    marginLeft: -2,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  symbol: {
    fontFamily: F.DISPLAY,
    fontSize: 48,
    color: C.GOLD,
    textAlign: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: C.GOLD,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: F.DISPLAY,
    fontSize: 28,
    color: C.PARCHMENT,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.GRAY_TEXT,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },

  // ── Search ──────────────────────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  searchInput: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(10, 15, 13, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 18,
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: C.PARCHMENT,
  },
  searchButton: {
    height: 52,
    paddingHorizontal: 20,
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.4)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.3)',
    borderColor: C.GOLD,
  },
  searchButtonDisabled: {
    opacity: 0.4,
  },
  searchButtonText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  searchButtonTextDisabled: {
    color: C.GRAY_TEXT,
  },

  // ── Quick access ────────────────────────────────────────────────────────
  quickAccess: {
    alignItems: 'center',
    gap: 12,
  },
  quickLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: 'rgba(156, 163, 175, 0.4)',
    textTransform: 'uppercase',
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(10, 15, 13, 0.5)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipPressed: {
    backgroundColor: C.GOLD_DIM,
    borderColor: C.GOLD,
  },
  chipText: {
    fontFamily: F.DISPLAY,
    fontSize: 16,
    color: C.PARCHMENT,
  },
});
