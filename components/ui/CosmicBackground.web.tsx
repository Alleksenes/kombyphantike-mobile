// ── TACTILE VOID (WEB — CSS) ────
// Full-screen div with CSS filter + repeating noise SVG background.
// Base: #0a0a0f · Grain: noise.svg @ 25% · Vignette: radial-gradient 0.95

import { StyleSheet, View } from 'react-native';

const NOISE_SVG = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <filter id="n">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/>
    </filter>
    <rect width="256" height="256" filter="url(#n)" opacity="0.07"/>
  </svg>
`)}`;

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <View
        style={styles.background}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0f',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundImage: `url(${NOISE_SVG})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '256px 256px',
    filter: 'contrast(150%) brightness(80%)',
  },
  content: { flex: 1 },
});
