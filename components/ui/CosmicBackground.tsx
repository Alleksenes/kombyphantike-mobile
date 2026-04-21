// ── TACTILE VOID (SHARED FALLBACK) ────
// Simple View with solid background — no animation, no canvas.

import { StyleSheet, View } from 'react-native';

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  return (
    <View style={styles.root}>
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
  content: { flex: 1 },
});
