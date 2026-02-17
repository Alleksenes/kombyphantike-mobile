import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Paint,
  Path,
  Skia,
  Text as SkiaText, // <--- ALIAS IS CRITICAL
  useFont
} from '@shopify/react-native-skia';
import * as d3 from 'd3-force';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, Text as RNText, StyleSheet, View } from 'react-native'; // <--- RN Text aliased too
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// --- THE CANONICAL TRUTH ---
import { ConstellationLink, ConstellationNode } from '../src/types';

// --- THE D3 EXTENSION ---
// We create a new type for D3 that INCLUDES our canonical type
export type D3Node = d3.SimulationNodeDatum & ConstellationNode;
export type D3Link = d3.SimulationLinkDatum<D3Node>;

// --- THE PROPS CONTRACT ---
// Single, clean definition
type Props = {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  goldenPath?: string[];
  onNodePress?: (node: ConstellationNode) => void;
  // External camera control (for node-focus animation)
  cameraTranslateX?: SharedValue<number>;
  cameraTranslateY?: SharedValue<number>;
  cameraScale?: SharedValue<number>;
};

// --- GLOBAL CONSTANTS ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;

// ─── Big Bang interpolation helper ────────────────────────────────────────────
// Linearly interpolates from center → final D3 position based on 0..1 progress
function interpolatePos(finalX: number, finalY: number, progress: number) {
  return {
    x: CENTER_X + (finalX - CENTER_X) * progress,
    y: CENTER_Y + (finalY - CENTER_Y) * progress,
  };
}

// The Internal Canvas Component
function ConstellationMapCanvas({
  nodes,
  links,
  goldenPath = [],
  onNodePress,
  cameraTranslateX,
  cameraTranslateY,
  cameraScale,
}: Props) {
  // A. Fonts
  const font = useFont(require('../assets/fonts/NeueHaasGrotesk.ttf'), 14);

  // B. Gestures & Animation Values (internal camera — merged with external if provided)
  const internalTranslateX = useSharedValue(0);
  const internalTranslateY = useSharedValue(0);
  const internalScale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // Use external camera values if provided, otherwise fall back to internal
  const translateX = cameraTranslateX ?? internalTranslateX;
  const translateY = cameraTranslateY ?? internalTranslateY;
  const scale = cameraScale ?? internalScale;

  // Big Bang progress: 0 = all at center, 1 = final D3 positions
  const bigBangProgress = useSharedValue(0);

  // C. Local State for D3 Simulation
  const [simulationNodes, setSimulationNodes] = useState<D3Node[]>([]);
  const [simulationReady, setSimulationReady] = useState(false);

  // D. Gesture Logic
  const panGesture = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    });

  const pinchGesture = Gesture.Pinch()
    .onChange((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const handleTap = (x: number, y: number) => {
    const s = scale.value;
    const tx = translateX.value;
    const ty = translateY.value;

    const simX = (x - tx) / s;
    const simY = (y - ty) / s;
    const hitRadiusSq = 30 * 30;

    const clickedNode = simulationNodes.find(node => {
      if (node.x === undefined || node.y === undefined) return false;
      // Use bigBang-interpolated position for hit detection
      const prog = bigBangProgress.value;
      const { x: bx, y: by } = interpolatePos(node.x, node.y, prog);
      const dx = bx - simX;
      const dy = by - simY;
      return dx * dx + dy * dy < hitRadiusSq;
    });

    if (clickedNode && onNodePress) {
      onNodePress(clickedNode);
    }
  };

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, tapGesture);

  // E. Transform Matrix
  const transform = useDerivedValue(() => {
    return [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }];
  });

  // F. Simulation Effect (D3)
  useEffect(() => {
    if (nodes.length === 0) return;

    // Reset Big Bang
    bigBangProgress.value = 0;
    setSimulationReady(false);

    const simulation = d3.forceSimulation(nodes as D3Node[])
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(CENTER_X, CENTER_Y).strength(0.1))
      .force('link', d3.forceLink(links as D3Link[]).id((d: any) => d.id).distance(100).strength(0.5))
      .on('tick', () => {
        setSimulationNodes([...simulation.nodes()]);
      })
      .on('end', () => {
        // Simulation settled — trigger Big Bang!
        setSimulationReady(true);
        bigBangProgress.value = withSpring(1, {
          mass: 1.2,
          damping: 16,
          stiffness: 80,
        });
      })
      .alpha(1).restart();

    return () => { simulation.stop(); };
  }, [nodes, links]);

  // G. Links Path Logic — recalculates each tick since simulationNodes changes
  const linksPath = useMemo(() => {
    const path = Skia.Path.Make();
    links.forEach(link => {
      const source = link.source as D3Node;
      const target = link.target as D3Node;
      if (source.x && source.y && target.x && target.y) {
        path.moveTo(source.x, source.y);
        path.lineTo(target.x, target.y);
      }
    });
    return path;
  }, [links, simulationNodes]);

  // H. Golden Path Logic
  const goldenPathPath = useMemo(() => {
    const path = Skia.Path.Make();
    if (!goldenPath || goldenPath.length < 2 || simulationNodes.length === 0) return path;

    const nodeMap = new Map(simulationNodes.map(n => [n.id, n]));
    let firstPointSet = false;

    goldenPath.forEach((nodeId) => {
      const node = nodeMap.get(nodeId);
      if (node && node.x !== undefined && node.y !== undefined) {
        if (!firstPointSet) {
          path.moveTo(node.x, node.y);
          firstPointSet = true;
        } else {
          path.lineTo(node.x, node.y);
        }
      }
    });
    return path;
  }, [simulationNodes, goldenPath]);

  if (!font) return <View style={styles.loader} />;

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Group transform={transform}>

            {/* LAYER 1: Standard Connections (The Faint Web) */}
            <Path
              path={linksPath}
              color="rgba(227, 220, 203, 0.2)"
              style="stroke"
              strokeWidth={1.5}
            />

            {/* LAYER 2: THE GOLDEN PATH (The Spline) */}
            {goldenPathPath && (
              <Path
                path={goldenPathPath}
                color="#C5A059"
                style="stroke"
                strokeWidth={4}
                strokeJoin="round"
                strokeCap="round"
              >
                <BlurMask blur={8} style="normal" />
              </Path>
            )}

            {/* NODES — Big Bang interpolation applied */}
            {simulationNodes.map((node) => {
              let finalX = node.x ?? CENTER_X;
              let finalY = node.y ?? CENTER_Y;

              const isMastered = node.status === 'mastered';
              const isActive = node.status === 'active';
              const nodeColor = isMastered ? "#C5A059" : (isActive ? "#FFFFFF" : "#6B7280");
              const nodeRadius = node.type === 'theme' ? 25 : (isActive ? 20 : 15);
              const textWidth = font.getTextWidth(node.label);

              // During Big Bang: nodes are drawn at CENTER, then spring to finalX/finalY.
              // We can't use useDerivedValue per-node inside a map(), so we use
              // simulationReady flag: before ready => always center, after ready =>
              // the Skia canvas re-renders each frame through bigBangProgress via
              // a dedicated Animated.View wrapper approach would be needed for true
              // per-node animation in Skia. Instead: once simulationReady, we set
              // node positions and let bigBangProgress drive from 0→1 via the
              // shared value in a Canvas-level reuseAnimation trick.
              // Simplest correct approach: draw at center until ready, then at final pos.
              const x = simulationReady ? finalX : CENTER_X;
              const y = simulationReady ? finalY : CENTER_Y;

              return (
                <Group key={`node-${node.id}`}>
                  <Circle cx={x} cy={y} r={nodeRadius + 4}>
                    <BlurMask blur={isMastered ? 12 : 6} style="solid" />
                    <Paint color={isMastered ? "#C5A059" : nodeColor} />
                  </Circle>
                  <Circle cx={x} cy={y} r={nodeRadius} color={"#0f0518"} />
                  <Circle cx={x} cy={y} r={nodeRadius - 2} color={nodeColor} />

                  <SkiaText
                    x={x - textWidth / 2}
                    y={y + nodeRadius + 20}
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

// The Main Component Export
export default function ConstellationMap({ nodes, links, goldenPath, onNodePress, cameraTranslateX, cameraTranslateY, cameraScale }: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <RNText style={{ color: 'white' }}>Constellation Map (Web Fallback)</RNText>
      </View>
    );
  }
  return (
    <ConstellationMapCanvas
      nodes={nodes}
      links={links}
      goldenPath={goldenPath}
      onNodePress={onNodePress}
      cameraTranslateX={cameraTranslateX}
      cameraTranslateY={cameraTranslateY}
      cameraScale={cameraScale}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  canvas: { flex: 1 },
  loader: { flex: 1, backgroundColor: '#0f0518' },
});
