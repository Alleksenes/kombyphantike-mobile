// ── THE TACTILE VOID ──────────────────────────────────────────────────────────
// Granular atmosphere: deep emerald/rust/purple chromatic gradient with a
// repeating noise texture overlay (The Crust). Obsidian-inspired.
//
// Web fix: LinearGradient with absoluteFill can collapse to 0-height
// on web if no explicit width/height. We force dimensions via style.

import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Platform, StyleSheet, View } from 'react-native';
import { PhilologicalColors } from '../../src/theme';

// Noise overlay asset — a small repeating grain PNG at very low opacity.
// Falls back gracefully if the asset is missing (transparent View).
const NOISE_ASSET = require('../../assets/images/noise.png');

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  // Web fallback: CSS gradient + no noise (ImageBackground repeat not reliable on web)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <View style={styles.webGradientLayer} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Chromatic Gradient ──────────────────────────────────────────── */}
      <LinearGradient
        colors={[
          PhilologicalColors.VOID,       // Deep emerald-black
          '#0e100c',                      // Warm charcoal midpoint
          PhilologicalColors.VOID_WARM,   // Rust-black warmth
          PhilologicalColors.VOID_DEEP,   // Near-true black terminus
        ]}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── The Crust (Noise Overlay) ──────────────────────────────────── */}
      <ImageBackground
        source={NOISE_ASSET}
        style={styles.noiseOverlay}
        resizeMode="repeat"
        imageStyle={{ opacity: 1 }}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  content: { flex: 1 },

  // Web: CSS gradient via a View with background
  webFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webGradientLayer: {
    ...StyleSheet.absoluteFillObject,
    // @ts-ignore — web-only CSS property
    backgroundImage: `linear-gradient(155deg, ${PhilologicalColors.VOID} 0%, #0e100c 30%, ${PhilologicalColors.VOID_WARM} 65%, ${PhilologicalColors.VOID_DEEP} 100%)`,
    backgroundColor: PhilologicalColors.VOID, // Fallback
  },
});
