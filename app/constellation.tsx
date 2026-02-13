import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import PhilologyCard from '../components/PhilologyCard';
import { Token } from '../components/WordChip';
import ConstellationMap, { ConstellationLink, ConstellationNode } from '../screens/ConstellationMap';
import { ApiService } from '../src/services/ApiService';
import { useInspectorStore } from '../src/store/inspectorStore';

export default function ConstellationScreen() {
  const { graph } = useLocalSearchParams();
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);
  const [goldenPath, setGoldenPath] = useState<string[]>([]); // ADD THIS STATE

  // Interaction State
  const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);


  // Global Inspector Store
  const { openInspector, closeInspector, token: selectedToken } = useInspectorStore();

  useEffect(() => {
    if (typeof graph === 'string') {
      try {
        const parsed = JSON.parse(graph);
        console.log("Parsed Graph:", parsed);
        // Basic validation to ensure we have nodes and links arrays
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
          setNodes(parsed.nodes);
          setLinks(parsed.links);
          setGoldenPath(parsed.golden_path || []); // PARSE THE PATH
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
    if (isWeaving || nodes.length === 0) return;
    setIsWeaving(true);

    try {
      console.log("Filling curriculum for nodes:", nodes.length);
      const result = await ApiService.fillCurriculum({ worksheet_data: nodes });
      const updatedNodes = result.worksheet_data;

      if (!Array.isArray(updatedNodes)) {
        throw new Error("Invalid response structure from server: worksheet_data is not an array.");
      }

      console.log("Received updated nodes:", updatedNodes.length);

      setNodes(prevNodes => {
        // efficient lookup map
        const updateMap = new Map(updatedNodes.map(n => [n.id, n]));
        return prevNodes.map(node => {
          const match = updateMap.get(node.id);
          if (match) {
            // *** FIX 2: LOOK FOR THE SENTENCE IN THE CORRECT PLACE (node.data) ***
            const hasTarget = !!match.data?.target_sentence;
            return {
              ...node, // Keep the original node
              data: match.data, // Overwrite with the updated data from the server
              status: hasTarget ? 'mastered' : node.status, // Update status
              // Preserve simulation coordinates - THIS IS BRILLIANT
              x: node.x,
              y: node.y,
              vx: node.vx, // Also preserve velocity to stop jittering
              vy: node.vy,
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

  const handleNodePress = (node: ConstellationNode) => {
    console.log("Node Pressed:", node.label);
    setActiveNode(node);
    // Close the inspector when switching nodes
    closeInspector();
  };

  const handleTokenPress = (token: Token) => {
    console.log("Token Pressed:", token.text);
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
            goldenPath={goldenPath} // PASS THE PATH
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
          {activeNode && (activeNode.target_sentence || activeNode.source_sentence) && (
            <PhilologyCard
              sentence={activeNode.target_sentence || activeNode.source_sentence || ""}
              tokens={activeNode.target_tokens}
              translation={activeNode.source_sentence || activeNode.target_sentence || ""}
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
