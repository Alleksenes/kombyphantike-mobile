import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface OmegaLoaderProps {
  size?: number;
  color?: string;
  duration?: number;
}

export default function OmegaLoader({
  size = 64,
  color = '#C5A059',
  duration = 2000
}: OmegaLoaderProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, [duration]);

  // Estimated path length for the Omega shape
  const PATH_LENGTH = 300;

  const animatedProps = useAnimatedProps(() => {
    // Draw from left (full dashoffset) to right (0 dashoffset)
    // We animate from 0 to 0.7 to draw, then hold, then fade
    const offset = interpolate(progress.value, [0, 0.7], [PATH_LENGTH, 0], 'clamp');
    return {
      strokeDashoffset: offset,
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    // Fade out at the end: 0.8 -> 1.0
    const opacity = interpolate(progress.value, [0.8, 1], [1, 0], 'clamp');
    return {
      opacity: opacity,
    };
  });

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <AnimatedPath
            d="M 15 80 L 30 80 A 28 28 0 1 1 70 80 L 85 80"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={PATH_LENGTH}
            animatedProps={animatedProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
