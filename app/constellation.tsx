import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import ConstellationMap, { ConstellationNode, ConstellationLink } from '../screens/ConstellationMap';
import CosmicBackground from '../components/CosmicBackground';

const NODES: ConstellationNode[] = [
  { id: '1', label: 'Genesis', status: 'mastered' },
  { id: '2', label: 'Logic', status: 'mastered' },
  { id: '3', label: 'Rhetoric', status: 'unlocked' },
  { id: '4', label: 'Grammar', status: 'unlocked' },
  { id: '5', label: 'Music', status: 'locked' },
  { id: '6', label: 'Astronomy', status: 'locked' },
  { id: '7', label: 'Arithmetic', status: 'locked' },
  { id: '8', label: 'Geometry', status: 'locked' },
];

const LINKS: ConstellationLink[] = [
  { source: '1', target: '2' },
  { source: '1', target: '3' },
  { source: '2', target: '4' },
  { source: '3', target: '5' },
  { source: '4', target: '6' },
  { source: '5', target: '7' },
  { source: '6', target: '8' },
  { source: '2', target: '8' },
  { source: '3', target: '7' },
];

export default function ConstellationScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CosmicBackground />
      <ConstellationMap nodes={NODES} links={LINKS} />
    </View>
  );
}
