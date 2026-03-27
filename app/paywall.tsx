// ── THE SCHOLAR'S GATE ───────────────────────────────────────────────────────
// Frosted-glass comparison view: Initiate (free) vs Scholar (paid) tiers.
// Highlights the philological depth unlocked by the Scholar tier.

import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';

// ── Design Tokens ────────────────────────────────────────────────────────────
const GOLD = '#C5A059';
const GOLD_DIM = 'rgba(197, 160, 89, 0.15)';
const PARCHMENT = '#E3DCCB';
const GRAY_TEXT = '#9CA3AF';
const GRAY_BORDER = 'rgba(55, 65, 81, 0.6)';
const SURFACE = 'rgba(15, 5, 24, 0.6)';
const CHECK = '\u2713';
const LOCK = '\u2717';

interface FeatureRow {
  label: string;
  initiate: boolean;
  scholar: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: 'A1–A2 Islands', initiate: true, scholar: true },
  { label: 'Davidian Notes', initiate: true, scholar: true },
  { label: 'RAG Scholia (Holton)', initiate: true, scholar: true },
  { label: 'Paradigm Tables', initiate: true, scholar: true },
  { label: 'B1+ Islands', initiate: false, scholar: true },
  { label: 'LSJ Citations', initiate: false, scholar: true },
  { label: 'KDS Diachronic Score', initiate: false, scholar: true },
  { label: 'Grammar Scholia', initiate: false, scholar: true },
  { label: 'Constellation Graph', initiate: true, scholar: true },
  { label: 'Audio (Pneuma)', initiate: false, scholar: true },
];

function FeatureCheck({ enabled }: { enabled: boolean }) {
  return (
    <View style={[styles.checkCircle, enabled ? styles.checkEnabled : styles.checkDisabled]}>
      <Text style={[styles.checkText, enabled ? styles.checkTextEnabled : styles.checkTextDisabled]}>
        {enabled ? CHECK : LOCK}
      </Text>
    </View>
  );
}

export default function PaywallScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back Button */}
      <View style={styles.headerRow}>
        <IconButton
          icon="chevron-left"
          iconColor={GOLD}
          size={28}
          onPress={() => router.back()}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ────────────────────────────────────────────────────── */}
        <View style={styles.titleSection}>
          <Text style={styles.titleText}>The Scholar's Gate</Text>
          <View style={styles.titleDivider} />
          <Text style={styles.subtitleText}>
            Unlock the full philological depth
          </Text>
        </View>

        {/* ── Comparison Card (Frosted Glass) ──────────────────────────── */}
        <View style={styles.comparisonCard}>
          {Platform.OS !== 'web' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.comparisonOverlay} />

          <View style={styles.comparisonContent}>
            {/* Column Headers */}
            <View style={styles.headerColumns}>
              <View style={styles.featureLabelCol} />
              <View style={styles.tierCol}>
                <Text style={styles.tierLabel}>Initiate</Text>
                <Text style={styles.tierPrice}>Free</Text>
              </View>
              <View style={[styles.tierCol, styles.scholarCol]}>
                <Text style={[styles.tierLabel, styles.tierLabelGold]}>Scholar</Text>
                <Text style={styles.tierPriceGold}>Pro</Text>
              </View>
            </View>

            <View style={styles.tableTopDivider} />

            {/* Feature Rows */}
            {FEATURES.map((feature, i) => (
              <View
                key={feature.label}
                style={[styles.featureRow, i % 2 === 0 && styles.featureRowAlt]}
              >
                <View style={styles.featureLabelCol}>
                  <Text style={[
                    styles.featureLabel,
                    !feature.initiate && styles.featureLabelGold,
                  ]}>
                    {feature.label}
                  </Text>
                </View>
                <View style={styles.tierCol}>
                  <FeatureCheck enabled={feature.initiate} />
                </View>
                <View style={[styles.tierCol, styles.scholarCol]}>
                  <FeatureCheck enabled={feature.scholar} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Highlight: Philological Depth ────────────────────────────── */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightIconRow}>
            <View style={styles.highlightIcon}>
              <Text style={styles.highlightIconText}>L</Text>
            </View>
            <Text style={styles.highlightTitle}>Philological Depth</Text>
          </View>
          <Text style={styles.highlightBody}>
            The Scholar tier grants access to the LSJ (Liddell-Scott-Jones) lexicon citations,
            diachronic KDS distance scores, and B1+ Islands — the deeper waters where
            Ancient and Modern Greek converge. Every word becomes a bridge across millennia.
          </Text>
        </View>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaPressed,
          ]}
          onPress={() => {
            // TODO: Connect to payment flow
            router.back();
          }}
        >
          <Text style={styles.ctaText}>Become a Scholar</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.maybeLater}>Maybe later</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },

  // ── Title ─────────────────────────────────────────────────────────────────
  titleSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  titleText: {
    fontFamily: 'GFSDidot',
    fontSize: 30,
    color: PARCHMENT,
    textAlign: 'center',
  },
  titleDivider: {
    width: 50,
    height: 1,
    backgroundColor: GOLD,
    marginVertical: 12,
  },
  subtitleText: {
    fontFamily: 'GFSDidot',
    fontSize: 14,
    color: GOLD,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // ── Comparison Card ───────────────────────────────────────────────────────
  comparisonCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  comparisonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SURFACE,
  },
  comparisonContent: {
    padding: 20,
  },

  // ── Column Headers ────────────────────────────────────────────────────────
  headerColumns: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 12,
  },
  featureLabelCol: {
    flex: 1,
  },
  tierCol: {
    width: 72,
    alignItems: 'center',
  },
  scholarCol: {
    backgroundColor: GOLD_DIM,
    borderRadius: 10,
    paddingVertical: 6,
    marginLeft: 4,
  },
  tierLabel: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 10,
    fontWeight: 'bold',
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tierLabelGold: {
    color: GOLD,
  },
  tierPrice: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: PARCHMENT,
    fontWeight: 'bold',
    marginTop: 2,
  },
  tierPriceGold: {
    fontFamily: 'GFSDidot',
    fontSize: 15,
    color: GOLD,
    fontWeight: 'bold',
    marginTop: 2,
  },

  tableTopDivider: {
    height: 1,
    backgroundColor: GRAY_BORDER,
    marginBottom: 4,
  },

  // ── Feature Rows ──────────────────────────────────────────────────────────
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  featureRowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  featureLabel: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: PARCHMENT,
  },
  featureLabelGold: {
    color: GOLD,
  },

  // ── Check Marks ───────────────────────────────────────────────────────────
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEnabled: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  checkDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  checkText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkTextEnabled: {
    color: '#34D399',
  },
  checkTextDisabled: {
    color: 'rgba(107, 114, 128, 0.4)',
  },

  // ── Highlight Card ────────────────────────────────────────────────────────
  highlightCard: {
    backgroundColor: GOLD_DIM,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
    padding: 20,
    marginBottom: 28,
  },
  highlightIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  highlightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  highlightIconText: {
    fontFamily: 'GFSDidot',
    fontSize: 16,
    color: GOLD,
    fontWeight: 'bold',
  },
  highlightTitle: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 11,
    fontWeight: 'bold',
    color: GOLD,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  highlightBody: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: PARCHMENT,
    lineHeight: 20,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  ctaButton: {
    backgroundColor: GOLD,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaPressed: {
    opacity: 0.7,
  },
  ctaText: {
    fontFamily: 'GFSDidot',
    fontSize: 18,
    color: '#1a1918',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  maybeLater: {
    fontFamily: 'NeueHaasGrotesk',
    fontSize: 13,
    color: GRAY_TEXT,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
