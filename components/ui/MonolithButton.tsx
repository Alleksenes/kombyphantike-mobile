import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

interface MonolithButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function MonolithButton({ label, onPress, disabled, style }: MonolithButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      {disabled ? (
        <Text style={[styles.text, styles.textDisabled]}>{label}</Text>
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56, // Tall, authoritative
    backgroundColor: '#131110', // Darker than the Stele
    borderWidth: 1,
    borderColor: '#C5A059', // Solid Byzantine Gold
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    // The "Obsidian" Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pressed: {
    backgroundColor: '#1a1918',
    transform: [{ scale: 0.98 }], // Physical feedback
    borderColor: '#E3DCCB', // Shift to Parchment on press
  },
  disabled: {
    borderColor: 'rgba(197, 160, 89, 0.2)',
    backgroundColor: 'rgba(19, 17, 16, 0.5)',
  },
  text: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 16,
    color: '#C5A059', // Gold text
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  textDisabled: {
    color: 'rgba(197, 160, 89, 0.3)',
  }
});