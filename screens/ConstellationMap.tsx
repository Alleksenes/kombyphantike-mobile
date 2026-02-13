import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  useFont
} from '@shopify/react-native-skia';
import * as d3 from 'd3-force';
import { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AncientContext, Token } from '../components/WordChip';

// 1. GLOBAL CONSTANTS (Safe)
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 2. TYPES
export type ConstellationNode = {
  id: string;
  label: string;
  status: 'locked' | 'unlocked' | 'mastered';
  x?: number;
  y?: number;
  target_sentence?: string;
  source_sentence?: string;
  target_tokens?: Token[];
  ancient_context?: string | AncientContext;
  vx?: number;
  vy?: number;
  data?: any;
};

export type ConstellationLink = {
  source: string;
  target: string;
};

type Props = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  onNodePress?: (node: ConstellationNode) => void;
};

// Internal Component (Native Only)
function ConstellationMapCanvas({ nodes, links, onNodePress }: Props) {
  // A. Fonts
  const font = useFont(require('../assets/fonts/NeueHaasGrotesk.ttf'), 12);

  // B. Gestures & Animation Values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const context = useSharedValue({ x: 0, y: 0, scale: 1 });

  // C. Local State for D3 Simulation
  const [simulationNodes, setSimulationNodes] = useState<ConstellationNode[]>([]);

  // D. Gesture Logic
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
      };
    })
    .onUpdate((e) => {
      translateX.value = context.value.x + e.translationX;
      translateY.value = context.value.y + e.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      context.value = {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
      };
    })
    .onUpdate((e) => {
      scale.value = context.value.scale * e.scale;
    });

  const handleTap = (x: number, y: number) => {
    // Invert transform to get simulation coordinates
    const tx = translateX.value;
    const ty = translateY.value;
    const s = scale.value;

    const simX = (x - tx) / s;
    const simY = (y - ty) / s;

    // Find node
    const clickedNode = simulationNodes.find(node => {
      if (!node.x || !node.y) return false;
      const dx = node.x - simX;
      const dy = node.y - simY;
      const r = node.status === 'mastered' ? 25 : 15;
      return dx * dx + dy * dy < r * r * 2; // generous hit area
    });

    if (clickedNode && onNodePress) {
      onNodePress(clickedNode);
    }
  };

  const tapGesture = Gesture.Tap()
    .onStart((e) => {
      runOnJS(handleTap)(e.x, e.y);
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

  // E. Transform Matrix (Computed for Skia)
  const transform = useDerivedValue(() => {
    return [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ];
  }, [translateX, translateY, scale]);

  // F. Simulation Effect (D3)
  // F. Simulation Effect (D3)
  useEffect(() => {
    if (nodes.length === 0) return;

    // Initialize simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2))
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .on('tick', () => {
        setSimulationNodes([...nodes]);
      });

    // THE FIX: Explicitly return an arrow function
    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  if (!font) {
    return <View style={styles.loader} />;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Group transform={transform}>

            {/* LINKS (Draw lines first so they are behind nodes) */}
            {links.map((link, i) => {
              // D3 replaces string IDs with object references after simulation starts
              const source = link.source as unknown as ConstellationNode;
              const target = link.target as unknown as ConstellationNode;

              if (!source.x || !target.x) return null;

              const path = Skia.Path.Make();
              path.moveTo(source.x, source.y!);
              path.lineTo(target.x, target.y!);

              return (
                <Path
                  key={`link-${i}`}
                  path={path}
                  color="rgba(227, 220, 203, 0.3)" // Parchment White, Low Opacity
                  style="stroke"
                  strokeWidth={1}
                />
              );
            })}

            {/* NODES (Stars) */}
            {simulationNodes.map((node) => {
              if (!node.x || !node.y) return null;

              // STYLING LOGIC (From PR 79)
              const isMastered = node.status === 'mastered';
              const nodeColor = isMastered ? "#C5A059" : "#FFFFFF"; // Gold vs White
              const nodeRadius = isMastered ? 25 : 15;

              return (
                <Group key={`node-${node.id}`}>
                  {/* The Star Body */}
                  <Circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    color={nodeColor}
                    opacity={node.status === 'locked' ? 0.3 : 1}
                  />
                </Group>
              );
            })}
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}

export default function ConstellationMap({ nodes, links, onNodePress }: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0518' }}>
        <Text style={{ color: '#E3DCCB', fontSize: 24, marginBottom: 20 }}>Cosmic Scriptorium</Text>
        <Text style={{ color: '#E3DCCB', opacity: 0.7 }}>Constellation Map (Web View)</Text>
        {nodes.map(node => (
          <Text
            key={node.id}
            onPress={() => onNodePress && onNodePress(node)}
            style={{ color: '#E3DCCB', marginVertical: 2, cursor: 'pointer' }}
          >
            {node.label} ({node.status})
          </Text>
        ))}
      </View>
    );
  }

  return <ConstellationMapCanvas nodes={nodes} links={links} onNodePress={onNodePress} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  canvas: {
    flex: 1,
  },
  loader: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
