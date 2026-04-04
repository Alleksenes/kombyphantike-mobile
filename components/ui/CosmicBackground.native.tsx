// ── THE OBSIDIAN GRUNGE (NATIVE) ─────────────────────────────────────────────
// 3-Layer static compositing. NO animation, NO Giant Canvas, NO translateY.
//
// LAYER 1 — The Base: Solid #07050a (absolute deep void).
// LAYER 2 — The Glow: A stationary diagonal LinearGradient.
//           Deep amethyst + emerald glow — VISIBLE beneath the grain.
// LAYER 3 — The Crust: noise.jpg at 25% opacity ON TOP of everything.
//           Aggressive, weathered grain biting through content like crusted stone.

import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, View } from 'react-native';

const NOISE_ASSET = require('../../assets/images/noise.jpg');

// ── The Obsidian Palette ─────────────────────────────────────────────────────
const VOID_BASE = '#07050a';

const GLOW_COLORS: [string, string, string] = [
  '#07050a', 'rgba(36, 15, 60, 0.4)', 'rgba(10, 25, 20, 0.2)'    // Emerald shadow at the tail
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.root}>

      {/* LAYER 1 — The Base: solid deep void (via root backgroundColor) ──── */}

      {/* LAYER 2 — The Glow: stationary diagonal gradient ───────────────── */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={GLOW_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* CONTENT — sandwiched between gradient and grain ─────────────────── */}
      <View style={styles.content}>{children}</View>

      {/* LAYER 3 — The Crust: noise.jpg at 25% opacity — TOPMOST z-index ── */}
      {/* Sits ABOVE content so the grain bites into everything visible.      */}
      <View pointerEvents="none" style={styles.grainWrapper}>
        <ImageBackground
          source={NOISE_ASSET}
          style={styles.grainOverlay}
          resizeMode="cover"
          imageStyle={{ opacity: 0.6, tintColor: '#817272ff' }}
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: VOID_BASE,
  },
  grainWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.14,
  },
  content: { flex: 1 },
});
