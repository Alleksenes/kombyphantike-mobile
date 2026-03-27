import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { PhilologicalColors } from '../../src/theme';

// Palimpsest gradient: VOID → VOID_DEEP, top-left to bottom-right.
// No shaders. No animation. Pure native performance.
export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[PhilologicalColors.VOID, '#1a0b2e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
});
