import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// --- COMPONENT IMPORTS (Corrected Paths) ---
import InspectorSheet from '../components/InspectorSheet';
import PhilologyCard from '../components/PhilologyCard'; // FIX: Path was wrong, should be ../
import CosmicBackground from '../components/ui/CosmicBackground'; // FIX: Path was wrong, should be ../
import ConstellationMap from '../screens/ConstellationMap'; // FIX: Path was wrong, should be ../

// --- THE SINGLE SOURCE OF TRUTH ---
import { ConstellationGraph, ConstellationLink, ConstellationNode } from '../src/types';

// --- SERVICES ---
import { API_BASE_URL } from '../src/services/apiConfig';


// -----------------------------------------------------------------
// --- DELETE THESE - They are the source of all your errors ---
//
// interface NodeData { ... }
// interface ConstellationNode { ... } 
//
// -----------------------------------------------------------------


export default function ConstellationScreen() {
  const { graph } = useLocalSearchParams();

  // State now uses the CANONICAL types
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);

  // Selection State
  const [activeSentenceNode, setActiveSentenceNode] = useState<ConstellationNode | null>(null);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);

  // 1. Hydrate the Universe
  useEffect(() => {
    if (typeof graph === 'string') {
      try {
        // Type assertion tells TypeScript to trust us
        const parsedGraph = JSON.parse(graph) as ConstellationGraph;
        if (Array.isArray(parsedGraph.nodes)) {
          setNodes(parsedGraph.nodes);
          setLinks(parsedGraph.links || []);
        }
      } catch (e) {
        console.error("Universe Parse Error:", e);
      }
    }
  }, [graph]);

  // 2. The Actuator Logic (Fill with AI)
  const handleWeaveSentences = async () => {
    if (isWeaving) return;
    setIsWeaving(true);

    try {
      const leanNodes = nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        data: {
          knot_definition: n.data?.knot_definition,
          ancient_context: n.data?.ancient_context
        }
      }));

      const response = await fetch(`${API_BASE_URL}/fill_curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheet_data: leanNodes,
          instruction_text: "Fill these nodes."
        }),
      });

      if (!response.ok) throw new Error('AI Generation Failed');

      const result = await response.json();
      const updatedData = result.worksheet_data || [];

      // MERGE: Update nodes with new sentences
      setNodes(prev => prev.map(node => {
        const match = updatedData.find((n: any) => n.id === node.id);
        if (match && match.data?.target_sentence) {
          return {
            ...node,
            status: 'mastered',
            data: { ...node.data, ...match.data }
          };
        }
        return node;
      }));

    } catch (error) {
      console.error(error);
    } finally {
      setIsWeaving(false);
    }
  };

  // 3. Interaction Handlers
  const onNodePress = (node: ConstellationNode) => {
    if (node.type === 'rule' && node.status === 'mastered') {
      setActiveSentenceNode(node);
      setSelectedToken(null);
    }
  };

  const onTokenPress = (token: any) => {
    setSelectedToken(token);
  };

  const closeInspector = () => setSelectedToken(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <CosmicBackground />
        <ConstellationMap
          nodes={nodes}
          links={links}
          goldenPath={[]}
          onNodePress={onNodePress}
        />
        {activeSentenceNode && activeSentenceNode.data?.target_sentence && (
          <View style={styles.cardContainer}>
            <PhilologyCard
              sentence={activeSentenceNode.data.target_sentence}
              translation={activeSentenceNode.data.source_sentence || ""}
              tokens={activeSentenceNode.data.target_tokens}
              onTokenPress={onTokenPress}
            />
          </View>
        )}
        {selectedToken && (
          <InspectorSheet
            token={selectedToken}
            onClose={closeInspector}
          />
        )}
        {/* ... Actuator FABs and Loaders ... */}
        {!isWeaving && nodes.length > 0 && !nodes.some(n => n.status === 'mastered') && (
          <Pressable onPress={handleWeaveSentences} style={styles.fab}>
            <Text style={styles.fabText}>WEAVE SENTENCES</Text>
          </Pressable>
        )}
        {isWeaving && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#C5A059" />
            <Text style={styles.loaderText}>Transmuting...</Text>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

// ... your styles ...
const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    top: 60, left: 20, right: 20,
    zIndex: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 40, right: 20,
    backgroundColor: '#1a1918',
    borderColor: '#C5A059',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 100,
    elevation: 10,
    zIndex: 100,
  },
  fabText: {
    color: '#E3DCCB',
    fontFamily: 'NeueHaasGrotesk-Display',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loader: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#C5A059',
    marginTop: 8,
    fontFamily: 'NeueHaasGrotesk-Text',
  }
});