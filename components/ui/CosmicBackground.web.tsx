// ── THE OBSIDIAN GRUNGE (WEB) ────────────────────────────────────────────────
// CSS-only 3-layer static compositing. NO animation, NO scrolling background.
//
// LAYER 1 — The Base: Solid #07050a (absolute deep void) via backgroundColor.
// LAYER 2 — The Glow: CSS diagonal linear-gradient — deep amethyst + emerald.
//           Colors ['#07050a', 'rgba(36, 15, 60, 0.4)', 'rgba(10, 25, 20, 0.2)']
//           are VISIBLE beneath the grain.
// LAYER 3 — The Crust: SVG feTurbulence grain at 25% opacity, mixBlendMode
//           color-burn. TOPMOST layer — bites through everything visible.

import { StyleSheet, View } from 'react-native';

// ── The Obsidian Palette ─────────────────────────────────────────────────────
const VOID_BASE = '#07050a';

// Web grain — inline SVG feTurbulence tile (fully desaturated, coarser grain)
const WEB_GRAIN_URI = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">' +
  '<filter id="g">' +
  '<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" stitchTiles="stitch"/>' +
  '<feColorMatrix type="saturate" values="0"/>' +
  '</filter>' +
  '<rect width="200" height="200" filter="url(#g)" opacity="1"/>' +
  '</svg>'
);

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.root}>
      {/* L1: Solid void base (via root backgroundColor) */}
      {/* L2: The Glow — diagonal gradient ──────────────────────────────── */}
      <View style={styles.glow} />
      {/* CONTENT — sandwiched between gradient and grain ────────────────── */}
      <View style={styles.content}>{children}</View>
      {/* L3: The Crust — SVG turbulence grain, color-burn — TOPMOST ─────── */}
      <View style={styles.grain} />
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
    backgroundColor: VOID_BASE,
  },
  content: { flex: 1 },

  // L2: Diagonal glow — amethyst and emerald, matching the native palette
  glow: {
    ...StyleSheet.absoluteFillObject,
    // @ts-ignore — web-only CSS
    backgroundImage:
      'linear-gradient(135deg, #07050a 0%, rgba(36,15,60,0.4) 50%, rgba(10,25,20,0.2) 100%)',
  },

  // L3: SVG turbulence grain at 25% opacity — TOPMOST z-index, color-burn bites
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
    // @ts-ignore — web-only CSS
    zIndex: 10,
    // @ts-ignore — web-only CSS
    pointerEvents: 'none',
    // @ts-ignore — web-only CSS
    backgroundImage: `url("${WEB_GRAIN_URI}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '200px 200px',
    // @ts-ignore — web-only CSS
    mixBlendMode: 'color-burn',
  },
});
