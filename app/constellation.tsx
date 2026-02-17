import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import PhilologyCard from '../components/PhilologyCard';
import { Token } from '../components/WordChip';
import ConstellationMap from '../screens/ConstellationMap';

import { API_BASE_URL } from '../src/services/apiConfig';
import { useInspectorStore } from '../src/store/inspectorStore';
import { ConstellationLink, ConstellationNode } from '../src/types';


export default function ConstellationScreen() {
  const { graph } = useLocalSearchParams();
  const openInspector = useInspectorStore((s) => s.openInspector);

  // State uses the CANONICAL types from src/types.ts
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);

  // Selection State
  const [activeSentenceNode, setActiveSentenceNode] = useState<ConstellationNode | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [goldenPath, setGoldenPath] = useState<string[]>([]);


  // 1. AUTO-TRIGGER WEAVE SENTENCES
  useEffect(() => {
    if (nodes.length > 0 && !isWeaving) {
      // Check if we already have sentences (mastered). If not, trigger AI.
      const needsWeaving = nodes.some(n => n.status !== 'mastered' && n.type !== 'theme');
      if (needsWeaving) {
        handleWeaveSentences();
      }
    }
  }, [nodes]);
  // 2. AI Fill (Weave Sentences)
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

      setNodes(prev => prev.map(node => {
        const match = updatedData.find((n: any) => n.id === node.id);
        if (match && match.data?.target_sentence) {
          return {
            ...node,
            status: 'mastered' as const,
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

  // 3. Interaction Handlers — The Complete Chain:
  //    Node tap -> PhilologyCard appears -> Token tap -> TheInspector opens (via Zustand)
  const onNodePress = (node: ConstellationNode) => {
    if (node.type === 'rule' && node.status === 'mastered') {
      setActiveSentenceNode(node);
      setSelectedToken(null);
    }
  };

  const onTokenPress = (token: Token) => {
    // Enrich token with node-level context before opening inspector
    const enrichedToken: Token = {
      ...token,
      knot_definition: token.knot_definition || activeSentenceNode?.data?.knot_definition,
      ancient_context: token.ancient_context || activeSentenceNode?.data?.ancient_context,
    };
    setSelectedToken(enrichedToken);
    openInspector(enrichedToken);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Transparent background so Global Cosmos shows through */}
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* DO NOT RENDER <CosmicBackground /> HERE. IT IS IN _LAYOUT. */}

        <ConstellationMap
          nodes={nodes}
          links={links}
          goldenPath={[]}
          onNodePress={onNodePress}
        />

        {/* PhilologyCard: appears when a mastered node is tapped */}
        {activeSentenceNode && activeSentenceNode.data?.target_sentence && (
          <View style={styles.cardContainer} pointerEvents="box-none">
            <PhilologyCard
              sentence={activeSentenceNode.data.target_sentence}
              translation={activeSentenceNode.data.source_sentence || ""}
              tokens={activeSentenceNode.data.target_tokens}
              onTokenPress={onTokenPress}
              selectedToken={selectedToken}
            />
          </View>
        )}

        {/* TheInspector is mounted globally in _layout.tsx and reacts to inspectorStore */}

        {/* FAB: Weave Sentences */}
        {!isWeaving && nodes.length > 0 && !nodes.some(n => n.status === 'mastered') && (
          <Pressable onPress={handleWeaveSentences} style={styles.fab}>
            <Text style={styles.fabText}>WEAVE SENTENCES</Text>
          </Pressable>
        )}

        {/* LOADING INDICATOR (Instead of Button) */}
        {isWeaving && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#C5A059" />
            <Text style={styles.loaderText}>Transmuting Knowledge...</Text>
          </View>
        )}

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scene: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 50,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
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
  },
});
