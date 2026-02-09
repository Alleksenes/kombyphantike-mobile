import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import CosmicBackground from '../components/ui/CosmicBackground';
import ConstellationMap, { ConstellationLink, ConstellationNode } from '../screens/ConstellationMap';
import { API_BASE_URL } from '../src/services/apiConfig';

export default function ConstellationScreen() {
  const { graph } = useLocalSearchParams();
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);

  useEffect(() => {
    if (typeof graph === 'string') {
      try {
        const parsed = JSON.parse(graph);
        console.log("Parsed Graph:", parsed);
        // Basic validation to ensure we have nodes and links arrays
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
          setNodes(parsed.nodes);
          setLinks(parsed.links);
        } else {
          setNodes([]);
          setLinks([]);
        }
      } catch (e) {
        console.error("JSON Parse Error:", e);
        setNodes([]);
        setLinks([]);
      }
    } else {
      setNodes([]);
      setLinks([]);
    }
  }, [graph]);

  const handleWeave = async () => {
    if (isWeaving) return;
    setIsWeaving(true);

    try {
      console.log("Filling curriculum for nodes:", nodes.length);
      const response = await fetch(`${API_BASE_URL}/fill_curriculum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worksheet_data: nodes }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
      }

      const updatedNodes: ConstellationNode[] = await response.json();
      console.log("Received updated nodes:", updatedNodes.length);

      setNodes(prevNodes => {
        return prevNodes.map(node => {
          const match = updatedNodes.find(n => n.id === node.id);
          if (match) {
            const hasTarget = !!match.target_sentence;
            return {
              ...node,
              ...match,
              status: hasTarget ? 'mastered' : node.status,
              // Preserve simulation coordinates if they exist
              x: node.x,
              y: node.y
            };
          }
          return node;
        });
      });

    } catch (error) {
      console.error("Fill Curriculum Error:", error);
      // Ideally show a toast or alert here
    } finally {
      setIsWeaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CosmicBackground />
      {nodes.length > 0 ? (
        <>
          <ConstellationMap nodes={nodes} links={links} />
          {/* Actuator FAB */}
          <Pressable
            onPress={handleWeave}
            disabled={isWeaving}
            style={({ pressed }) => ({
              position: 'absolute',
              bottom: 40,
              right: 20,
              backgroundColor: '#C5A059',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 30,
              elevation: 5,
              opacity: pressed || isWeaving ? 0.8 : 1,
              zIndex: 100,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            })}
          >
            {isWeaving ? (
              <ActivityIndicator color="#1a1918" size="small" />
            ) : (
              <Text style={{
                color: '#1a1918',
                fontWeight: 'bold',
                fontSize: 16,
                fontFamily: 'NeueHaasGrotesk-Display',
                letterSpacing: 0.5
              }}>
                Weave Sentences
              </Text>
            )}
          </Pressable>
        </>
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
