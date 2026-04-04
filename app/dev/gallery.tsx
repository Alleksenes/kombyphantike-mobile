// ── THE NAVIGATION HUB ──────────────────────────────────────────────────────
// Sleek dev menu routing to isolated, full-screen sandbox environments.
// Includes a live network diagnostic panel at the top.

import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../src/services/apiConfig';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';

const ENV_URL = process.env.EXPO_PUBLIC_API_URL ?? '(not set)';

const NAV_CARDS = [
  {
    title: 'The Reader',
    subtitle: 'Curated Sentence Voyage',
    symbol: '\u2736',
    route: '/voyage/island-zero',
  },
  {
    title: 'The Lapidary',
    subtitle: 'Morphological Workbench',
    symbol: '\u25C7',
    route: '/lapidary/iz-sentence-1',
  },
  {
    title: 'The Orrery',
    subtitle: 'Semantic Constellation Navigator',
    symbol: '\u2726',
    route: '/orrery',
  },
] as const;

export default function GalleryScreen() {
  const router = useRouter();

  // ── Diagnostic state ────────────────────────────────────────────────────
  const [diagResult, setDiagResult] = useState<string | null>(null);
  const [diagStatus, setDiagStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const checkConnection = useCallback(async () => {
    const url = `${API_BASE_URL}/health`;
    setDiagStatus('loading');
    setDiagResult(`Fetching ${url} ...`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const text = await response.text();
      setDiagStatus(response.ok ? 'ok' : 'error');
      setDiagResult(
        `Status: ${response.status} ${response.statusText}\n` +
        `URL: ${url}\n` +
        `Body: ${text}`
      );
    } catch (e: any) {
      setDiagStatus('error');
      // Surface the FULL error — name, message, and stack trace
      const name = e?.name ?? 'UnknownError';
      const message = e?.message ?? String(e);
      const stack = e?.stack ?? '';
      setDiagResult(
        `${name}: ${message}\n\n` +
        `URL: ${url}\n` +
        (stack ? `Stack:\n${stack}` : '')
      );
    }
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Network Diagnostic Panel ───────────────────────────────────── */}
        <View style={styles.diagPanel}>
          <Text style={styles.diagTitle}>NETWORK DIAGNOSTIC</Text>
          <Text style={styles.diagUrl} selectable>
            {'ENV: ' + ENV_URL + '\n'}
            {'Resolved: ' + API_BASE_URL + '\n'}
            {'Platform: ' + Platform.OS}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.diagButton, pressed && styles.diagButtonPressed]}
            onPress={checkConnection}
          >
            <Text style={styles.diagButtonText}>
              {diagStatus === 'loading' ? 'Pinging...' : 'Ping Backend (/health)'}
            </Text>
          </Pressable>

          {diagResult ? (
            <View style={[
              styles.diagResultBox,
              diagStatus === 'ok' && styles.diagResultOk,
              diagStatus === 'error' && styles.diagResultError,
            ]}>
              <Text style={styles.diagResultText} selectable>{diagResult}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>KOMBYPHANTIKE</Text>
          <Text style={styles.title}>Dev Atelier</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Sandbox</Text>
          </View>
        </View>

        {/* ── Navigation Cards ───────────────────────────────────────────── */}
        <View style={styles.cards}>
          {NAV_CARDS.map((card) => (
            <Pressable
              key={card.route}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => router.push(card.route as any)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardSymbol}>{card.symbol}</Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.cardChevron}>{'\u203A'}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Link href="/_sitemap" style={styles.sitemapLink}>
            <Text style={styles.sitemapLinkText}>View Route Sitemap</Text>
          </Link>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  // ── Diagnostic Panel ──────────────────────────────────────────────────
  diagPanel: {
    backgroundColor: 'rgba(10, 15, 13, 0.6)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 8,
  },
  diagTitle: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: C.GRAY_TEXT,
    textTransform: 'uppercase',
  },
  diagUrl: {
    fontFamily: F.BODY,
    fontSize: 11,
    color: C.PARCHMENT,
    opacity: 0.7,
  },
  diagButton: {
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  diagButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderColor: C.GOLD,
  },
  diagButtonText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  diagResultBox: {
    backgroundColor: 'rgba(10, 15, 13, 0.5)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 8,
    padding: 10,
  },
  diagResultOk: {
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  diagResultError: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  diagResultText: {
    fontFamily: F.BODY,
    fontSize: 12,
    color: C.PARCHMENT,
    lineHeight: 18,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: C.GOLD,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: F.DISPLAY,
    fontSize: 32,
    color: C.PARCHMENT,
    marginBottom: 12,
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

  // ── Cards ───────────────────────────────────────────────────────────────
  cards: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.SURFACE,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  cardPressed: {
    backgroundColor: C.GOLD_DIM,
    borderColor: C.GOLD,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  cardSymbol: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.GOLD,
    width: 36,
    textAlign: 'center',
  },
  cardText: {
    gap: 4,
    flex: 1,
  },
  cardTitle: {
    fontFamily: F.DISPLAY,
    fontSize: 20,
    color: C.PARCHMENT,
  },
  cardSubtitle: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: C.GRAY_TEXT,
    letterSpacing: 0.3,
  },
  cardChevron: {
    fontSize: 28,
    color: C.GOLD,
    fontWeight: '300',
    marginLeft: 8,
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 12,
  },
  sitemapLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 8,
  },
  sitemapLinkText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: C.GRAY_TEXT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    color: 'rgba(156, 163, 175, 0.3)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
