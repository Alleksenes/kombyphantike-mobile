// ── THE OBSIDIAN CHROMATIC ENGINE (SVG VIGNETTE EDITION) ──────────────────────
// 3-Layer compositing. Radial vignette so the neon rainbow shines through
// the centre of the screen instead of being uniformly crushed to black.
//
// LAYER 1 — Neon Core (SVG LinearGradient)
//   The Obsidian "Encore" rainbow: #0ff5fe → #6f00ff → #ff0000 → #ffde00 → #a7ff00 → #00ff88
//   Paints the full canvas corner-to-corner at 135°.
//
// LAYER 2 — Radial Vignette (SVG RadialGradient, NOT a flat mask)
//   cx="50%" cy="50%" r="70%"
//   Stop 0%:   stopOpacity="0"    → fully transparent → rainbow visible at centre
//   Stop 100%: stopOpacity="0.95" → near-black → neon crushed to void at edges
//   This is the correct approach. A flat rgba mask crushes everything uniformly
//   and results in a pitch-black screen. The radial gradient preserves the glow.
//
// LAYER 3 — The Grain (The Crust)
//   ImageBackground noise.png tiled at 5% opacity above the SVG canvas.
//   Adds the granular, tactile surface that makes the void feel etched.
//
// WEB FALLBACK:
//   CSS background-image stack mirrors the SVG math exactly.
//   React-native-svg full-screen SVG can be unreliable on web; the pure-CSS
//   path is more stable and produces an identical result.

import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { ImageBackground, Platform, StyleSheet, View } from 'react-native';

// ── Assets ────────────────────────────────────────────────────────────────────

// Native grain — noise.png tiled at low opacity
const NOISE_ASSET = require('../../assets/images/noise.png');

// Web grain — inline SVG feTurbulence. 250×250px tile, fractalNoise, 4 octaves.
const WEB_GRAIN_URI = Platform.OS === 'web'
  ? 'data:image/svg+xml,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250">' +
      '<filter id="g">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>' +
      '<feColorMatrix type="saturate" values="0"/>' +
      '</filter>' +
      '<rect width="250" height="250" filter="url(#g)" opacity="1"/>' +
      '</svg>'
    )
  : '';

// ── Component ─────────────────────────────────────────────────────────────────

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {

  // ── Web Path ────────────────────────────────────────────────────────────────
  // CSS background-image stack: radial vignette over neon linear gradient.
  // Layer order in CSS is painter's algorithm — first entry renders on top.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.root}>

        {/* WEB L1+L2: Neon rainbow crushed by radial vignette at edges ────────
         *  The radial-gradient is listed first (on top) — transparent centre
         *  so the neon shines through, dark void at the edges.
         *  The linear-gradient (Encore rainbow) sits beneath.
         */}
        <View style={styles.webBackground} />

        {/* WEB L3: SVG turbulence grain tiled at 5% ──────────────────────── */}
        <View style={styles.webGrain} />

        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // ── Native Path (iOS / Android) ─────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* LAYERS 1 + 2: SVG canvas ─────────────────────────────────────────── */}
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      >
        <Defs>

          {/* L1: Obsidian Encore neon rainbow, diagonal 135° */}
          <SvgLinearGradient id="neon" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0"   stopColor="#0ff5fe" stopOpacity="1" />
            <Stop offset="0.2" stopColor="#6f00ff" stopOpacity="1" />
            <Stop offset="0.4" stopColor="#ff0000" stopOpacity="1" />
            <Stop offset="0.6" stopColor="#ffde00" stopOpacity="1" />
            <Stop offset="0.8" stopColor="#a7ff00" stopOpacity="1" />
            <Stop offset="1"   stopColor="#00ff88" stopOpacity="1" />
          </SvgLinearGradient>

          {/* L2: Radial vignette — transparent centre → dark void at edges.
           *  r="70%" means the vignette fully kicks in at 70% from centre.
           *  Stop 0 (centre): opacity 0 → rainbow fully visible.
           *  Stop 1 (edge):   opacity 0.95 → near-total void. */}
          <SvgRadialGradient
            id="vignette"
            cx="50%"
            cy="50%"
            r="70%"
            gradientUnits="objectBoundingBox"
          >
            <Stop offset="0" stopColor="#0a0f0d" stopOpacity="0" />
            <Stop offset="1" stopColor="#0a0f0d" stopOpacity="0.95" />
          </SvgRadialGradient>

        </Defs>

        {/* L1: Neon rainbow fills the entire canvas */}
        <Rect width="100%" height="100%" fill="url(#neon)" />

        {/* L2: Vignette sits on top — centre transparent, edges dark */}
        <Rect width="100%" height="100%" fill="url(#vignette)" />

      </Svg>

      {/* LAYER 3 — Grain: noise PNG tiled at 5% opacity above SVG ─────────── */}
      <ImageBackground
        source={NOISE_ASSET}
        style={styles.grainOverlay}
        resizeMode="repeat"
        imageStyle={{ opacity: 1 }}
        pointerEvents="none"
      />

      <View style={styles.content}>{children}</View>
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
  },

  // Layer 3: grain tile at 5% opacity
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
  },

  content: { flex: 1 },

  // ── Web layers ────────────────────────────────────────────────────────────

  // CSS mirror of the SVG vignette + neon gradient.
  // Background-image layers render painter's-algorithm (first = top).
  // radial-gradient (vignette) sits above linear-gradient (neon rainbow).
  webBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0f0d', // fallback for any gap outside gradient bounds
    // @ts-ignore — web-only CSS multi-background
    backgroundImage: [
      // L2 (top): Radial vignette — transparent centre, near-black edges
      'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(10,15,13,0.00) 0%, rgba(10,15,13,0.95) 100%)',
      // L1 (bottom): Obsidian Encore neon rainbow, diagonal 135°
      'linear-gradient(135deg, #0ff5fe 0%, #6f00ff 20%, #ff0000 40%, #ffde00 60%, #a7ff00 80%, #00ff88 100%)',
    ].join(', '),
  },

  // SVG turbulence grain — tiled at 5% over the entire surface
  webGrain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.05,
    // @ts-ignore — web-only CSS
    backgroundImage: `url("${WEB_GRAIN_URI}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '250px 250px',
  },
});
