// ── KNOTWORD ──────────────────────────────────────────────────────────────────
// The shimmering gold word. A pulsing Byzantine Gold underline marks lexical
// nodes of diachronic significance. Wraps a WordChip with a Reanimated pulse.
//
// Used standalone by SentenceReader. Also defined inline in PhilologyCard for
// legacy compatibility — both render identically.

import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import WordChip, { Token } from './WordChip';

interface KnotWordProps {
  token: Token;
  onPress: (token: Token) => void;
  onLongPress: (token: Token) => void;
  isFocused: boolean;
}

export default function KnotWord({ token, onPress, onLongPress, isFocused }: KnotWordProps) {
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderBottomColor: `rgba(197, 160, 89, ${pulse.value})`,
    borderBottomWidth: 2,
    borderStyle: 'solid',
  }));

  return (
    <Animated.View style={animatedStyle}>
      <WordChip
        token={token}
        onPress={onPress}
        onLongPress={onLongPress}
        isFocused={isFocused}
      />
    </Animated.View>
  );
}
