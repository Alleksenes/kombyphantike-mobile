import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export interface IslandCardProps {
  id: string;
  title: string;
  level: string;
  progress: number;
  status: 'Draft' | 'Mastered';
  onPress?: (id: string) => void;
}

function IslandCard({ id, title, level, progress, status, onPress }: IslandCardProps) {
  const isMastered = status === 'Mastered';
  const borderColor = isMastered ? '#C5A059' : '#9CA3AF'; // Gold for Mastered, Grey for Draft

  return (
    <Pressable
      onPress={() => onPress && onPress(id)}
      style={({ pressed }) => [
        styles.card,
        { borderColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={[styles.badge, { borderColor }]}>
          <Text style={[styles.badgeText, { color: borderColor }]}>{level}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.statusText}>{status}</Text>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: borderColor }]} />
      </View>
    </Pressable>
  );
}

export default memo(IslandCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 5, 24, 0.6)', // Glassmorphous dark theme
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 4,
    zIndex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: 'GFSDidot',
    fontSize: 20,
    color: '#E3DCCB',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(15, 5, 24, 0.8)',
  },
  badgeText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 12,
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    fontSize: 14,
    color: 'rgba(227, 220, 203, 0.7)',
  },
  progressText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 14,
    color: '#E3DCCB',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
