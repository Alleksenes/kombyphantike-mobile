import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import PhilologyCard from '../components/PhilologyCard';
import { Token } from '../components/WordChip';
import ConstellationMap from '../screens/ConstellationMap';

import { API_BASE_URL } from '../src/services/apiConfig';
import { useInspectorStore } from '../src/store/inspectorStore';
import { ConstellationGraph, ConstellationLink, ConstellationNode } from '../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CENTER_X = SCREEN_WIDTH / 2;

// ─── Focus camera toward a node ───────────────────────────────────────────────
// Given a node's x/y in simulation space, computes the translateX/Y/scale
// values to bring that node close to center with a gentle zoom.
function focusOnNode(
  nodeX: number,
  nodeY: number,
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  scale: SharedValue<number>,
) {
  const targetScale = 1.4;
  const targetTx = CENTER_X - nodeX * targetScale;
  const targetTy = CENTER_Y - nodeY * targetScale;

  scale.value = withSpring(targetScale, { damping: 18, stiffness: 120 });
  translateX.value = withSpring(targetTx, { damping: 18, stiffness: 120 });
  translateY.value = withSpring(targetTy, { damping: 18, stiffness: 120 });
}

export default function ConstellationScreen() {
  const { graph: graphParam } = useLocalSearchParams();
  const router = useRouter();
  const openInspector = useInspectorStore((s) => s.openInspector);

  // ── State: canonical types from src/types.ts ─────────────────────────────
  const [nodes, setNodes] = useState<ConstellationNode[]>([]);
  const [links, setLinks] = useState<ConstellationLink[]>([]);
  const [goldenPath, setGoldenPath] = useState<string[]>([]);
  const [isWeaving, setIsWeaving] = useState(false);

  // Selection State
  const [activeSentenceNode, setActiveSentenceNode] = useState<ConstellationNode | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // ── Camera shared values (passed into ConstellationMap for node-focus) ────
  const cameraTranslateX = useSharedValue(0);
  const cameraTranslateY = useSharedValue(0);
  const cameraScale = useSharedValue(1);

  // ── 1. PARSE GRAPH FROM ROUTE PARAMS ─────────────────────────────────────
  useEffect(() => {
    if (!graphParam) return;
    try {
      const raw = Array.isArray(graphParam) ? graphParam[0] : graphParam;
      const parsed: ConstellationGraph = JSON.parse(raw);
      setNodes(parsed.nodes ?? []);
      setLinks(parsed.links ?? []);
      setGoldenPath(parsed.golden_path ?? []);
    } catch (e) {
      console.error('Failed to parse graph param:', e);
    }
  }, [graphParam]);

  // ── 2. AUTO-TRIGGER WEAVE SENTENCES ──────────────────────────────────────
  useEffect(() => {
    if (nodes.length > 0 && !isWeaving) {
      const needsWeaving = nodes.some(n => n.status !== 'mastered' && n.type !== 'theme');
      if (needsWeaving) {
        handleWeaveSentences();
      }
    }
  }, [nodes]);

  // ── 3. AI FILL (Weave Sentences) ─────────────────────────────────────────
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
          ancient_context: n.data?.ancient_context,
        },
      }));

      const response = await fetch(`${API_BASE_URL}/fill_curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheet_data: leanNodes,
          instruction_text: 'Fill these nodes.',
        }),
      });

      if (!response.ok) throw new Error('AI Generation Failed');

      const result = await response.json();
      const updatedData = result.worksheet_data || [];

      setNodes(prev =>
        prev.map(node => {
          const match = updatedData.find((n: any) => n.id === node.id);
          if (match && match.data?.target_sentence) {
            return {
              ...node,
              status: 'mastered' as const,
              data: { ...node.data, ...match.data },
            };
          }
          return node;
        }),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsWeaving(false);
    }
  };

  // ── 4. INTERACTION HANDLERS ───────────────────────────────────────────────
  //    Node tap → camera focuses → PhilologyCard appears
  //    Token tap → TheInspector opens (via Zustand)
  const onNodePress = (node: ConstellationNode) => {
    if (node.type === 'rule' && node.status === 'mastered') {
      // Animate camera to focus on this node
      if (node.x !== undefined && node.y !== undefined) {
        focusOnNode(node.x, node.y, cameraTranslateX, cameraTranslateY, cameraScale);
      }
      setActiveSentenceNode(node);
      setSelectedToken(null);
    }
  };

  const onTokenPress = (token: Token) => {
    const enrichedToken: Token = {
      ...token,
      knot_definition: token.knot_definition || activeSentenceNode?.data?.knot_definition,
      ancient_context: token.ancient_context || activeSentenceNode?.data?.ancient_context,
    };
    setSelectedToken(enrichedToken);
    openInspector(enrichedToken);
  };

  const dismissCard = () => {
    setActiveSentenceNode(null);
    setSelectedToken(null);
    // Reset camera to neutral
    cameraScale.value = withSpring(1, { damping: 18, stiffness: 120 });
    cameraTranslateX.value = withSpring(0, { damping: 18, stiffness: 120 });
    cameraTranslateY.value = withSpring(0, { damping: 18, stiffness: 120 });
  };

  const handleBack = () => {
    router.back();
  };

  // ── All nodes mastered? ───────────────────────────────────────────────────
  const allMastered = nodes.length > 0 && nodes.every(
    n => n.status === 'mastered' || n.type === 'theme',
  );
  const showWeaveBtn = !isWeaving && nodes.length > 0 && !allMastered;

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Transparent so Global Cosmos shows through */}
      <View style={styles.scene}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* DO NOT RENDER <CosmicBackground /> HERE. IT IS IN _LAYOUT. */}

        {/* ── Constellation Map (full-screen canvas) ── */}
        <ConstellationMap
          nodes={nodes}
          links={links}
          goldenPath={goldenPath}
          onNodePress={onNodePress}
          cameraTranslateX={cameraTranslateX}
          cameraTranslateY={cameraTranslateY}
          cameraScale={cameraScale}
        />

        {/* ── HUD: Gold Back Button (top-left) ─────── */}
        <View style={styles.hudTop} pointerEvents="box-none">
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            hitSlop={12}
          >
            {/* Chevron-left as Unicode, no icon library needed */}
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        {/* ── PhilologyCard: appears when a mastered node is tapped ── */}
        {activeSentenceNode && activeSentenceNode.data?.target_sentence && (
          <>
            {/* Transparent backdrop to dismiss card */}
            <Pressable style={styles.cardBackdrop} onPress={dismissCard} />
            <View style={styles.cardContainer} pointerEvents="box-none">
              <PhilologyCard
                sentence={activeSentenceNode.data.target_sentence}
                translation={activeSentenceNode.data.source_sentence || ''}
                tokens={activeSentenceNode.data.target_tokens}
                onTokenPress={onTokenPress}
                selectedToken={selectedToken}
              />
            </View>
          </>
        )}

        {/* TheInspector is mounted globally in _layout.tsx via inspectorStore */}

        {/* ── HUD: Bottom — Weave Sentences Button ─── */}
        {showWeaveBtn && (
          <View style={styles.hudBottom} pointerEvents="box-none">
            <Pressable
              onPress={handleWeaveSentences}
              style={({ pressed }) => [styles.weaveButton, pressed && styles.weaveButtonPressed]}
            >
              <Text style={styles.weaveButtonText}>Weave Sentences</Text>
            </Pressable>
          </View>
        )}

        {/* ── Loading Indicator (Weaving state) ────── */}
        {isWeaving && (
          <View style={styles.loaderContainer} pointerEvents="none">
            <ActivityIndicator size="large" color="#C5A059" />
            <Text style={styles.loaderText}>Transmuting Knowledge…</Text>
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

  // ─── HUD: top bar ─────────────────────────────────────────────────────────
  hudTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 32,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 80,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 5, 24, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderColor: '#C5A059',
  },
  backIcon: {
    color: '#C5A059',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    marginLeft: -2, // optical centering of ‹
  },

  // ─── PhilologyCard overlay ────────────────────────────────────────────────
  cardBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  cardContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 50,
  },

  // ─── HUD: bottom Weave Sentences ──────────────────────────────────────────
  hudBottom: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    zIndex: 100,
    alignItems: 'center',
  },
  weaveButton: {
    height: 56,
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#131110',
    borderWidth: 1,
    borderColor: '#C5A059',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // Obsidian shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  weaveButtonPressed: {
    backgroundColor: '#1a1918',
    borderColor: '#E3DCCB',
  },
  weaveButtonText: {
    fontFamily: 'NeueHaasGrotesk-Display',
    fontSize: 16,
    color: '#C5A059',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  // ─── Weaving loader ────────────────────────────────────────────────────────
  loaderContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  loaderText: {
    fontFamily: 'NeueHaasGrotesk-Text',
    color: '#C5A059',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
