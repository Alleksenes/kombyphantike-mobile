import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Fill,
  LinearGradient,
  RadialGradient,
  vec,
  FractalNoise,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
  interpolateColor,
} from 'react-native-reanimated';

const COLORS = ['#0ff5fe', '#6f00ff', '#ff0000', '#ffde00', '#a7ff00', '#00ff88'];

import { Platform } from 'react-native';

export default function SkiaLabScreen() {
  const progress = useSharedValue(0);


  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 30000 }),
      -1,
      true
    );
  }, [progress]);

  const color1 = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.2, 0.4, 0.6, 0.8, 1],
      ['#0ff5fe', '#6f00ff', '#ff0000', '#ffde00', '#a7ff00', '#00ff88']
    );
  });

  const color2 = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.2, 0.4, 0.6, 0.8, 1],
      ['#6f00ff', '#ff0000', '#ffde00', '#a7ff00', '#00ff88', '#0ff5fe']
    );
  });

  const color3 = useDerivedValue(() => {
    return interpolateColor(
      progress.value,
      [0, 0.2, 0.4, 0.6, 0.8, 1],
      ['#ff0000', '#ffde00', '#a7ff00', '#00ff88', '#0ff5fe', '#6f00ff']
    );
  });

  const colors = useDerivedValue(() => {
    return [color1.value, color2.value, color3.value];
  });

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, backgroundColor: '#0f0518', justifyContent: 'center', alignItems: 'center' }}>
          {/* A simple placeholder since Skia on web throws CanvasKit not defined without the WithSkiaWeb wrapper */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(400, 800)}
            colors={colors}
          />
        </Fill>

        <Fill>
          <FractalNoise freqX={0.05} freqY={0.05} octaves={4} />
        </Fill>

        <Fill>
          <RadialGradient
            c={vec(200, 400)}
            r={600}
            colors={['rgba(15, 5, 24, 0)', 'rgba(15, 5, 24, 0.95)']}
          />
        </Fill>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0518',
  },
  canvas: {
    flex: 1,
  },
});
