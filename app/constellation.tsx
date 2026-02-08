import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import ConstellationMap, { ConstellationNode, ConstellationLink } from '../screens/ConstellationMap';
import CosmicBackground from '../components/CosmicBackground';

export default function ConstellationScreen() {
  const { graph } = useLocalSearchParams();

  const { nodes, links } = useMemo<{ nodes: ConstellationNode[]; links: ConstellationLink[] }>(() => {
    if (typeof graph === 'string') {
      try {
        const parsed = JSON.parse(graph);
        // Basic validation to ensure we have nodes and links arrays
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
          return { nodes: parsed.nodes, links: parsed.links };
        }
      } catch (e) {
        console.error("Failed to parse graph parameter:", e);
      }
    }
    // Return empty arrays if no graph or invalid (REMOVE MOCKS)
    return { nodes: [], links: [] };
  }, [graph]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CosmicBackground />
      {nodes.length > 0 ? (
        <ConstellationMap nodes={nodes} links={links} />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{
            color: '#E3DCCB',
            fontSize: 24,
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: 'bold',
            opacity: 0.9
          }}>
            No Constellation Data
          </Text>
          <Text style={{
            color: '#E3DCCB',
            fontSize: 16,
            textAlign: 'center',
            opacity: 0.7,
            lineHeight: 24
          }}>
            Please weave a curriculum to view your path.
          </Text>
        </View>
      )}
    </View>
  );
}
