import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

interface PhilologyCardProps {
  modernGreek: string;
  ancientContext: string;
  englishTranslation: string;
  index: number;
  total: number;
  width: number;
  height: number;
  loading?: boolean;
}

export default function PhilologyCard({
  modernGreek,
  ancientContext,
  englishTranslation,
  index,
  total,
  width,
  height,
  loading = false
}: PhilologyCardProps) {
  const theme = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
        pulseAnim.setValue(1);
    }
  }, [loading]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Surface style={styles.card} elevation={4}>

        {/* Decorative Header Line */}
        <View style={styles.decorativeLine} />

        {/* Top: Modern Greek */}
        <View style={styles.topSection}>
          {loading ? (
             <Animated.View style={[styles.skeletonText, { width: '80%', height: 32, opacity: pulseAnim, backgroundColor: theme.colors.surfaceVariant }]} />
          ) : (
            <Text
                variant="displaySmall"
                style={[styles.modernGreek, { color: theme.colors.primary }]}
                numberOfLines={5}
                adjustsFontSizeToFit
            >
                {modernGreek}
            </Text>
          )}
        </View>

        {/* Middle: Ancient Context (The Ghost) - Always Visible */}
        <View style={styles.middleSection}>
          <Text
            style={[styles.ancientContext, { color: theme.colors.onSurfaceVariant }]}
          >
            {ancientContext}
          </Text>
        </View>

        {/* Bottom: English Translation */}
        <View style={styles.bottomSection}>
           <Text style={styles.translationLabel}>TRANSLATION</Text>
           {loading ? (
             <Animated.View style={[styles.skeletonText, { width: '60%', height: 16, opacity: pulseAnim, backgroundColor: theme.colors.surfaceVariant }]} />
           ) : (
            <Text
                variant="bodyLarge"
                style={[styles.englishTranslation, { color: theme.colors.secondary }]}
            >
                {englishTranslation}
            </Text>
           )}
        </View>

        <View style={styles.footer}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline, letterSpacing: 2 }}>
            {index + 1} / {total}
          </Text>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    padding: 32,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  decorativeLine: {
      width: 40,
      height: 4,
      backgroundColor: '#E0E0E0',
      alignSelf: 'center',
      borderRadius: 2,
      marginBottom: 16,
      opacity: 0.5,
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    marginBottom: 24,
  },
  modernGreek: {
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  middleSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginVertical: 16,
  },
  ancientContext: {
    fontFamily: Platform.select({ ios: 'Times New Roman', android: 'serif', default: 'serif' }),
    fontStyle: 'italic',
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 34,
    opacity: 0.6,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 16,
  },
  translationLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      opacity: 0.4,
      marginBottom: 8,
  },
  englishTranslation: {
    textAlign: 'left',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    right: 32,
  },
  skeletonText: {
      borderRadius: 4,
      marginBottom: 8,
  }
});
