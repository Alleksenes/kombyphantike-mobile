import React, { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, LayoutChangeEvent, ViewStyle, Platform, View } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming, useDerivedValue, Easing } from 'react-native-reanimated';

interface MoltenButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function MoltenButton({ onPress, label, disabled, style }: MoltenButtonProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true // Reverse to create a sloshing/breathing liquid effect
    );
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const start = useDerivedValue(() => {
    return vec(0 + progress.value * 30, 0);
  });

  const end = useDerivedValue(() => {
    return vec(layout.width - progress.value * 30, layout.height);
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onLayout={onLayout}
      style={({ pressed }) => [
        styles.button,
        style,
        disabled && styles.disabled,
        pressed && styles.pressed,
        Platform.OS === 'web' && { backgroundColor: '#C5A059' }
      ]}
    >
      {Platform.OS !== 'web' && layout.width > 0 && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <RoundedRect x={0} y={0} width={layout.width} height={layout.height} r={layout.height / 2}>
            <LinearGradient
              start={start}
              end={end}
              colors={["#5E4B15", "#8A6E2F", "#C5A059", "#FFD700", "#C5A059", "#8A6E2F"]}
              positions={[0, 0.1, 0.3, 0.5, 0.7, 1]}
            />
          </RoundedRect>
        </Canvas>
      )}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#C0A062', // Fallback color
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  text: {
    color: '#1a1918', // Dark text on gold
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 18,
    fontWeight: '700', // Bold
    zIndex: 10,
    letterSpacing: 0.5,
  }
});
