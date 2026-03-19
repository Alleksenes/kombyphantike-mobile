import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import PhilologyCard from '../components/PhilologyCard';
import { Token } from '../components/WordChip';
import ConstellationMap from '../screens/ConstellationMap';
import { ApiService } from '../src/services/ApiService';
import { ConstellationLink, ConstellationNode } from '../src/types';
import { useInspectorStore } from '../src/store/inspectorStore';

export default function ResultsScreen() {
  const router = useRouter();
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [goldenPath, setGoldenPath] = useState<string[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);

  // Interaction State
  const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);

  // Global Inspector Store
  const { openInspector, closeInspector, token: selectedToken } = useInspectorStore();

  useEffect(() => {
    // TODO: migrate draft loading to Zustand store (SessionStore purged in Phase 2)
    const draft: any = null;
    if (!draft) return;

    let data = draft;
    if (typeof draft === 'string') {
      try { data = JSON.parse(draft); } catch { /* Silent failure */ }
    }

    if (data) {
      if (Array.isArray(data.nodes)) {
        setNodes(data.nodes);
        setLinks(data.links || []);
        setGoldenPath(data.golden_path || []);
      } else if (Array.isArray(data)) {
        setNodes(data);
        setLinks([]);
      }
    }
  }, []);

  const handleWeave = async () => {
    if (isWeaving || nodes.length === 0) return;
    setIsWeaving(true);

    try {
      const result = await ApiService.fillCurriculum({ worksheet_data: nodes });
      const updatedNodes = result.worksheet_data;

      if (!Array.isArray(updatedNodes)) {
        throw new Error("Invalid response structure from server: worksheet_data is not an array.");
      }

      setNodes(prevNodes => {
        // efficient lookup map
        const updateMap = new Map(updatedNodes.map(n => [n.id, n]));
        return prevNodes.map(node => {
          const match = updateMap.get(node.id);
          if (match) {
            const hasTarget = !!match.data?.target_sentence;
            return {
              ...node, // Keep the original node
              data: match.data, // Overwrite with the updated data from the server
              status: hasTarget ? 'mastered' : node.status, // Update status
              // Preserve simulation coordinates
              x: node.x,
              y: node.y,
              vx: node.vx,
              vy: node.vy,
            };
          }
          return node;
        });
      });

    } catch (error) {
       // Ideally show a toast or alert here
       // No console.log for code health
    } finally {
      setIsWeaving(false);
    }
  };

  const handleNodePress = (node: ConstellationNode) => {
    setActiveNode(node);
    closeInspector();
  };

  const handleTokenPress = (token: Token) => {
    openInspector(token);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Stack.Screen options={{ headerShown: false }} />
      {nodes.length > 0 ? (
        <>
          <ConstellationMap
            nodes={nodes}
            links={links}
            goldenPath={goldenPath}
            onNodePress={handleNodePress}
          />

          {/* Actuator FAB */}
          <Pressable
            onPress={handleWeave}
            disabled={isWeaving}
            style={({ pressed }) => ({
              position: 'absolute',
              bottom: 40,
              right: 20,
              // THE GOLDEN GRADIENT (Simulated with background color + border)
              backgroundColor: '#1a1918', // Obsidian Core
              borderWidth: 1,
              borderColor: '#C5A059', // Solid Gold Border

              // THE SHAPE
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 100, // Pill Shape

              // THE GLOW (Shadows)
              shadowColor: '#C5A059',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 10,
              elevation: 10, // Android Glow

              // INTERACTION
              opacity: pressed || isWeaving ? 0.8 : 1,
              zIndex: 100,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            })}
          >
            {isWeaving ? (
              <ActivityIndicator color="#C5A059" size="small" />
            ) : (
              <Text style={{
                color: '#E3DCCB', // Parchment Text
                fontWeight: '600',
                fontSize: 16,
                fontFamily: 'NeueHaasGrotesk-Display', // The Noble Font
                letterSpacing: 1,
                textTransform: 'uppercase'
              }}>
                Weave Sentences
              </Text>
            )}
          </Pressable>

          {/* Philology Card (Conditional) */}
          {activeNode && (activeNode.data?.target_sentence || activeNode.data?.source_sentence) && (
            <PhilologyCard
              sentence={activeNode.data?.target_sentence || activeNode.data?.source_sentence || ""}
              tokens={activeNode.data?.target_tokens}
              translation={activeNode.data?.source_sentence || activeNode.data?.target_sentence || ""}
              onTokenPress={handleTokenPress}
              selectedToken={selectedToken}
            />
          )}

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
            No Result Data
          </Text>
          <Text style={{
            color: '#E3DCCB',
            fontSize: 16,
            textAlign: 'center',
            opacity: 0.7,
            lineHeight: 24
          }}>
            Unable to load the constellation from history.
          </Text>
        </View>
      )}
    </View>
  );
}
