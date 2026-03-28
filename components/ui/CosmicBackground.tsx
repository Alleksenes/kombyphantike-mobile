// ── THE OBSIDIAN CHROMATIC ENGINE ────────────────────────────────────────────
// 3-Layer compositing. Exact reconstruction of the Obsidian "Encore" theme CSS.
//
// LAYER 1 — Neon Core
//   The raw rainbow gradient: #0ff5fe → #6f00ff → #ff0000 → #ffde00 → #a7ff00 → #00ff88
//   This is the actual color list from Obsidian Encore. It paints the full canvas.
//
// LAYER 2 — The Black Mask (94% Void Crush)
//   A View at rgba(10, 15, 13, 0.94) absoluteFill. Crushes 94% of the neon,
//   leaving only chromatic edge/corner bleed — the signature "dark glow" effect.
//
// LAYER 3 — The Grain (The Crust)
//   SVG feTurbulence noise tiled at opacity 0.08. Adds the granular, tactile
//   surface that makes Obsidian feel etched rather than flat.
//
// WEB ARCHITECTURE NOTE:
//   expo-linear-gradient's <LinearGradient> collapses to 0px height on web when
//   used inside absoluteFill without an explicit parent height. To avoid this,
//   the web path uses CSS backgroundImage (via @ts-ignore) on plain Views, which
//   always work because RN-web renders them as fully-sized divs when the html/body
//   CSS foundation is injected by _layout.tsx.

import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, Platform, StyleSheet, View } from 'react-native';

// ── Assets ────────────────────────────────────────────────────────────────────

// Native grain — our noise.png PNG tiled at low opacity
const NOISE_ASSET = require('../../assets/images/noise.png');

// Web grain — inline SVG feTurbulence pattern. Self-contained, no bundler path
// issues. 250×250px tile with fractalNoise at 0.75 frequency, 4 octaves.
// encodeURIComponent ensures it is safe inside a CSS url("…") call.
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
  // expo-linear-gradient silently collapses on web → use pure CSS layers.
  // Layer 1+2 are merged: neon radial glows in each corner against a void base.
  // This gives the "chromatic glow bleeds through the darkness" effect.
  if (Platform.OS === 'web') {
    return (
      <View style={styles.root}>

        {/* WEB L1+L2: Neon corner glows merged with 94% void crush ──────────
         *  Each radial-gradient fires a different Encore colour from its corner.
         *  The dark base (#0a0f0d) is the fallback backgroundColor.
         *  The radial gradients are subtle (max 0.30 alpha) so the result is
         *  a near-black surface with chromatic edge halos — matching Obsidian.
         */}
        <View style={styles.webNeonMask} />

        {/* WEB L3: SVG grain tiled at 8% ───────────────────────────────────── */}
        <View style={styles.webGrain} />

        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // ── Native Path (iOS / Android) ─────────────────────────────────────────────
  return (
    <View style={styles.root}>

      {/* LAYER 1 — Neon Core: Obsidian Encore rainbow, corner-to-corner ────── */}
      <LinearGradient
        colors={['#0ff5fe', '#6f00ff', '#ff0000', '#ffde00', '#a7ff00', '#00ff88']}
        locations={[0, 0.2, 0.4, 0.6, 0.8, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* LAYER 2 — 94% Void Crush: the signature Obsidian dark treatment ───── */}
      <View style={styles.darkMask} />

      {/* LAYER 3 — Grain: noise PNG tiled at 8% opacity ─────────────────────── */}
      <ImageBackground
        source={NOISE_ASSET}
        style={styles.grainOverlay}
        resizeMode="repeat"
        imageStyle={{ opacity: 1 }}
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

  // ── Native layers ─────────────────────────────────────────────────────────

  // Layer 2: near-opaque void. 0.94 = 6% neon bleeds through the edges.
  darkMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 13, 0.94)',
  },

  // Layer 3: grain tile
  grainOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },

  content: { flex: 1 },

  // ── Web layers ────────────────────────────────────────────────────────────

  // Neon corner halos + dark void — merged into one CSS layer for reliability.
  // Each radial-gradient fires a different Encore colour from a different corner.
  // The stack reads CSS-top-to-bottom, so halos sit above the base colour.
  webNeonMask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0f0d',
    // @ts-ignore — web-only CSS multi-background
    backgroundImage: [
      // Top-left: cyan halo
      'radial-gradient(ellipse 55% 55% at 0% 0%, rgba(15, 245, 254, 0.28) 0%, transparent 100%)',
      // Top-right: violet halo
      'radial-gradient(ellipse 55% 55% at 100% 0%, rgba(111, 0, 255, 0.24) 0%, transparent 100%)',
      // Bottom-left: lime halo
      'radial-gradient(ellipse 45% 45% at 0% 100%, rgba(167, 255, 0, 0.20) 0%, transparent 100%)',
      // Bottom-right: red halo
      'radial-gradient(ellipse 45% 45% at 100% 100%, rgba(255, 0, 0, 0.18) 0%, transparent 100%)',
      // Bottom-centre: green halo
      'radial-gradient(ellipse 40% 30% at 50% 100%, rgba(0, 255, 136, 0.16) 0%, transparent 100%)',
    ].join(', '),
  },

  // SVG turbulence grain — tiled at 8% over the entire surface
  webGrain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    // @ts-ignore — web-only CSS
    backgroundImage: `url("${WEB_GRAIN_URI}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '250px 250px',
  },
});
