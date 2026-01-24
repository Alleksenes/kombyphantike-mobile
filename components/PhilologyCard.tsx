import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

interface PhilologyCardProps {
  modernGreek: string;
  ancientContext: string;
  englishTranslation: string;
  index: number;
  total: number;
  width: number;
  height: number;
}

export default function PhilologyCard({
  modernGreek,
  ancientContext,
  englishTranslation,
  index,
  total,
  width,
  height
}: PhilologyCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { width, height }]}>
      <Surface style={styles.card} elevation={3}>
        {/* Top: Modern Greek */}
        <View style={styles.topSection}>
          <Text
            variant="displaySmall"
            style={[styles.modernGreek, { color: theme.colors.primary }]}
            numberOfLines={4}
            adjustsFontSizeToFit
          >
            {modernGreek}
          </Text>
        </View>

        {/* Middle: Ancient Context (The Ghost) */}
        <View style={styles.middleSection}>
          <Text
            style={[styles.ancientContext, { color: theme.colors.onSurfaceVariant }]}
          >
            {ancientContext}
          </Text>
        </View>

        {/* Bottom: English Translation */}
        <View style={styles.bottomSection}>
          <Text
            variant="bodyLarge"
            style={[styles.englishTranslation, { color: theme.colors.secondary }]}
          >
            {englishTranslation}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {index + 1} — {total}
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
  },
  card: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    padding: 32,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  topSection: {
    flex: 2,
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  modernGreek: {
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  middleSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ancientContext: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 24,
  },
  englishTranslation: {
    textAlign: 'left',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    right: 32,
  }
});
