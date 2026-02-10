import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface MoltenButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function MoltenButton({ label, onPress, disabled }: MoltenButtonProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1
    );
  }, []);

  // Animate the gradient start/end points
  const start = useDerivedValue(() => vec(0, 0));
  const end = useDerivedValue(() => vec(200 + (progress.value * 100), 50));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        { opacity: disabled ? 0.5 : (pressed ? 0.9 : 1) }
      ]}
    >
      <View style={styles.canvasContainer}>
        <Canvas style={StyleSheet.absoluteFill}>
          <Rect x={0} y={0} width={300} height={60}>
            <LinearGradient
              start={start}
              end={end}
              colors={["#C5A059", "#E3DCCB", "#C5A059"]}
            />
          </Rect>
        </Canvas>
      </View>

      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C5A059', // Fallback
    marginTop: 20,
  },
  canvasContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  text: {
    color: '#1a1918',
    fontSize: 18,
    fontFamily: 'NeueHaasGrotesk',
    fontWeight: 'bold',
    zIndex: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});