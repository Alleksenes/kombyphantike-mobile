import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, View } from 'react-native';
import { PhilologicalColors } from '../../src/theme';

// Palimpsest gradient: VOID → VOID_DEEP, top-left to bottom-right.
// No shaders. No animation. Pure native performance.
//
// Web fix: LinearGradient with absoluteFill can collapse to 0-height
// on web if no explicit width/height. We force dimensions via style.
export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  // Web fallback: if LinearGradient won't render, use a solid VOID background
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback}>
        <View style={styles.webGradientLayer} />
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[PhilologicalColors.VOID, '#1a0b2e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    backgroundImage: `linear-gradient(135deg, ${PhilologicalColors.VOID} 0%, #1a0b2e 100%)`,
    backgroundColor: PhilologicalColors.VOID, // Fallback
  },
});
