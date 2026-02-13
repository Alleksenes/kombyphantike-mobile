import { BackdropBlur, Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface AetherButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function AetherButton({ label, onPress, disabled }: AetherButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {Platform.OS !== 'web' ? (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <BackdropBlur blur={10}>
            <Rect x={0} y={0} width={1000} height={1000}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, 56)}
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              />
            </Rect>
          </BackdropBlur>
        </Canvas>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.webBackground]} />
      )}
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 20,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  webBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontFamily: 'NeueHaasGrotesk-Display',
    color: '#E3DCCB',
    fontSize: 16,
    letterSpacing: 1.5,
    textAlign: 'center',
    zIndex: 10,
  },
});
