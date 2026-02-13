import {
  Canvas,
  Circle,
  Group,
  Path,
  PathVerb // FIX: Added missing import
  ,



  Skia,
  Text as SkiaText,
  useFont
} from '@shopify/react-native-skia';
import * as d3 from 'd3-force';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AncientContext, Token } from '../components/WordChip';

// 1. GLOBAL CONSTANTS
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 2. TYPES
// Extend D3's types correctly
export type ConstellationNode = d3.SimulationNodeDatum & {
  id: string;
  label: string;
  status: 'locked' | 'unlocked' | 'mastered' | 'active';
  type: 'theme' | 'lemma' | 'rule';
  data?: any;
  target_sentence?: string;
  source_sentence?: string;
  target_tokens?: Token[];
  ancient_context?: string | AncientContext;
  // D3 adds x, y, vx, vy automatically
};

export type ConstellationLink = d3.SimulationLinkDatum<ConstellationNode>;

type Props = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  goldenPath: string[]; // FIX: Added missing prop
  onNodePress?: (node: ConstellationNode) => void;
};

// Internal Component (Native Only)
function ConstellationMapCanvas({ nodes, links, goldenPath, onNodePress }: Props) {
  // A. Fonts
  const font = useFont(require('../assets/fonts/NeueHaasGrotesk.ttf'), 14);

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
      context.value = { x: translateX.value, y: translateY.value, scale: scale.value };
    })
    .onUpdate((e) => {
      translateX.value = context.value.x + e.translationX;
      translateY.value = context.value.y + e.translationY;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value, scale: scale.value };
    })
    .onUpdate((e) => {
      scale.value = context.value.scale * e.scale;
    });

  const handleTap = (x: number, y: number) => {
    const s = scale.value;
    const tx = translateX.value;
    const ty = translateY.value;

    const simX = (x - tx) / s;
    const simY = (y - ty) / s;
    const hitRadius = 30;

    const clickedNode = simulationNodes.find(node => {
      if (node.x === undefined || node.y === undefined) return false;
      const dx = node.x - simX;
      const dy = node.y - simY;
      return dx * dx + dy * dy < hitRadius * hitRadius;
    });

    if (clickedNode && onNodePress) {
      onNodePress(clickedNode);
    }
  };

  const tapGesture = Gesture.Tap().onStart((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

  // E. Transform Matrix
  // FIX: Explicitly typed return for Skia transform
  const transform = useDerivedValue(() => {
    return [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }];
  });

  // F. Simulation Effect (D3)
  useEffect(() => {
    if (nodes.length === 0) return;

    // 1. Initial Positions (Prevent 0,0 Cluster)
    nodes.forEach(node => {
      if (node.x === undefined || node.y === undefined) {
        node.x = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 50;
        node.y = SCREEN_HEIGHT / 2 + (Math.random() - 0.5) * 50;
      }
    });

    // 2. Initialize simulation (Stopped)
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2))
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(90))
      .stop(); // Stop automatic ticking

    // 3. Warmup Phase (Calculate initial layout in one shot)
    simulation.tick(100);
    setSimulationNodes([...nodes]);

    return () => { simulation.stop(); };
  }, [nodes, links]);

  // G. Golden Path Logic
  const goldenPathCmds = useMemo(() => {
    if (simulationNodes.length === 0 || !goldenPath || goldenPath.length === 0) return Skia.Path.Make();

    const nodeMap = new Map(simulationNodes.map(n => [n.id, n]));
    const cmds: any[] = []; // Using any to bypass strict PathVerb array typing issues temporarily

    goldenPath.forEach((nodeId, index) => {
      const node = nodeMap.get(nodeId);
      if (node && node.x !== undefined && node.y !== undefined) {
        if (index === 0) {
          cmds.push(PathVerb.Move, node.x, node.y);
        } else {
          cmds.push(PathVerb.Line, node.x, node.y);
        }
      }
    });
    return Skia.Path.MakeFromCmds(cmds);
  }, [simulationNodes, goldenPath]);

  if (!font) return <View style={styles.loader} />;

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Group transform={transform}>

            {/* LINKS */}
            {links.map((link, i) => {
              // Safe casting for D3 links after simulation
              const source = link.source as unknown as ConstellationNode;
              const target = link.target as unknown as ConstellationNode;

              if (!source.x || !target.x) return null;
              return <Path key={`link-${i}`} path={`M ${source.x} ${source.y} L ${target.x} ${target.y}`} color="rgba(227, 220, 203, 0.2)" style="stroke" strokeWidth={1} />;
            })}

            {/* GOLDEN PATH (The "Spline") */}
            {(() => {
              if (!goldenPath || goldenPath.length < 2) return null;

              const path = Skia.Path.Make();

              // We need to look up nodes by ID efficiently or just find them
              // optimizing for small N: just find
              const orderedNodes = goldenPath.map(id => simulationNodes.find(n => n.id === id)).filter(n => n && n.x !== undefined && n.y !== undefined) as ConstellationNode[];

              if (orderedNodes.length < 2) return null;

              orderedNodes.forEach((node, index) => {
                if (index === 0) {
                  path.moveTo(node.x!, node.y!);
                } else {
                  path.lineTo(node.x!, node.y!);
                }
              });

              return (
                <Path
                  path={path}
                  color="#C5A059"
                  style="stroke"
                  strokeWidth={3}
                >
                  <BlurMask blur={5} style="normal" />
                </Path>
              );
            })()}

            {/* NODES */}
            {simulationNodes.map((node) => {
              if (node.x === undefined || node.y === undefined) return null;

              const isMastered = node.status === 'mastered';
              const isActive = node.status === 'active';
              const isLocked = node.status === 'locked';
              const nodeColor = isMastered ? "#C5A059" : (isActive ? "#FFFFFF" : "#6B7280");
              const nodeRadius = isActive ? 20 : 15;
              const textWidth = font.getTextWidth(node.label);

              return (
                <Group key={`node-${node.id}`}>
                  <Circle cx={node.x} cy={node.y} r={nodeRadius} color={nodeColor} />
                  <SkiaText
                    x={node.x - textWidth / 2}
                    y={node.y + nodeRadius + 15}
                    text={node.label}
                    font={font}
                    color={isActive ? "#FFFFFF" : "#9CA3AF"}
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

export default function ConstellationMap({ nodes, links, goldenPath, onNodePress }: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Constellation Map (Web View)</Text>
        {nodes.map(n => (
            <Text key={n.id} style={{ color: 'gray' }}>{n.label}</Text>
        ))}
      </View>
    );
  }
  return <ConstellationMapCanvas nodes={nodes} links={links} goldenPath={goldenPath} onNodePress={onNodePress} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  canvas: { flex: 1 },
  loader: { flex: 1, backgroundColor: 'transparent' },
});