import BottomSheet from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import InspectorSheet from '../components/InspectorSheet';
import PhilologyCard from '../components/PhilologyCard';
import CosmicBackground from '../components/ui/CosmicBackground';
import { Token } from '../components/WordChip';
import ConstellationMap, { ConstellationLink, ConstellationNode } from '../screens/ConstellationMap';
import { API_BASE_URL } from '../src/services/apiConfig';

export default function ConstellationScreen() {
  const { graph } = useLocalSearchParams();
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);

  // Interaction State
  const [activeNode, setActiveNode] = useState<ConstellationNode | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

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
    if (isWeaving || nodes.length === 0) return;
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

      /* const updatedNodes: ConstellationNode[] = await response.json(); */
      const { worksheet_data: updatedNodes } = await response.json();

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
    setSelectedToken(null);
    // Close the sheet when switching nodes to focus on the new sentence
    bottomSheetRef.current?.close();
  };

  const handleTokenPress = (token: Token) => {
    console.log("Token Pressed:", token.text);
    setSelectedToken(token);
    // Open sheet to inspect
    bottomSheetRef.current?.snapToIndex(0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0518' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <CosmicBackground />
      {nodes.length > 0 ? (
        <>
          <ConstellationMap
            nodes={nodes}
            links={links}
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

          {/* Inspector Sheet */}
          <InspectorSheet
            ref={bottomSheetRef}
            selectedToken={selectedToken}
            ancientContext={activeNode?.ancient_context || "Unknown Context"}
            greekSentence={activeNode?.target_sentence}
            englishTranslation={activeNode?.source_sentence}
          />
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
