import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View, Platform, Text as RNText } from 'react-native';
import { Canvas, Circle, Group, Path, Skia, Text, useFont, Fill, Shader, vec } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue, runOnJS, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { forceSimulation, forceManyBody, forceLink, forceCenter, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

// --- Types ---
export interface ConstellationNode extends SimulationNodeDatum {
  id: string;
  label: string;
  status: 'locked' | 'unlocked' | 'mastered';
  x?: number;
  y?: number;
}

export interface ConstellationLink extends SimulationLinkDatum<ConstellationNode> {
  source: string | ConstellationNode;
  target: string | ConstellationNode;
}

interface ConstellationMapProps {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
}

// --- Shaders ---
const LIQUID_GOLD_SHADER = `
uniform float time;
uniform vec2 resolution;

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

half4 main(vec2 xy) {
    vec2 st = xy / 100.0; // Scale for noise texture
    float t = time * 2.0;

    float n = noise(st + t);
    float n2 = noise(st * 2.0 - t * 0.5);

    vec3 gold1 = vec3(0.83, 0.68, 0.21); // #D4AF37
    vec3 gold2 = vec3(1.0, 0.84, 0.0);   // Gold
    vec3 highlight = vec3(1.0, 1.0, 0.8);

    vec3 color = mix(gold1, gold2, n);
    color = mix(color, highlight, pow(n2, 4.0));

    return half4(color, 1.0);
}
`;

const ConstellationMap: React.FC<ConstellationMapProps> = ({ nodes, links }) => {
  const { width, height } = useWindowDimensions();

  // Web Fallback
  if (Platform.OS === 'web') {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <RNText style={{ color: '#E3DCCB', fontSize: 24, marginBottom: 20 }}>Cosmic Scriptorium</RNText>
              <RNText style={{ color: '#E3DCCB', opacity: 0.7 }}>Constellation Map (Web View)</RNText>
              {nodes.map(node => (
                  <RNText key={node.id} style={{ color: '#E3DCCB', marginVertical: 2 }}>
                      {node.label} ({node.status})
                  </RNText>
              ))}
          </View>
      );
  }

  // Native Implementation
  const font = useFont(require('../assets/fonts/NeueHaasGrotesk.otf'), 12);

  // Simulation State
  const [simulationNodes, setSimulationNodes] = useState<ConstellationNode[]>([]);
  const [simulationLinks, setSimulationLinks] = useState<ConstellationLink[]>([]);

  // Animation for Shader
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(1000, { duration: 1000000, easing: Easing.linear }),
      -1
    );
  }, [time]);

  const goldUniforms = useDerivedValue(() => {
    return {
      time: time.value,
      resolution: [width, height],
    };
  }, [width, height]);

  const goldShader = useMemo(() => {
      return Skia.RuntimeEffect.Make(LIQUID_GOLD_SHADER);
  }, []);

  // Gesture State
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const context = useSharedValue({ x: 0, y: 0, scale: 1 });

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { x: translateX.value, y: translateY.value, scale: scale.value };
    })
    .onUpdate((event) => {
      translateX.value = context.value.x + event.translationX;
      translateY.value = context.value.y + event.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
        context.value = { x: translateX.value, y: translateY.value, scale: scale.value };
    })
    .onUpdate((event) => {
        const newScale = context.value.scale * event.scale;
        scale.value = Math.max(0.5, Math.min(newScale, 4));
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const transform = useDerivedValue(() => {
    const m = Skia.Matrix();
    m.translate(translateX.value, translateY.value);
    m.scale(scale.value);
    return m;
  }, [translateX, translateY, scale]);

  useEffect(() => {
    if (!nodes.length) return;

    const simNodes = JSON.parse(JSON.stringify(nodes));
    const simLinks = JSON.parse(JSON.stringify(links));

    const simulation = forceSimulation(simNodes)
      .force('charge', forceManyBody().strength(-300))
      .force('link', forceLink(simLinks).id((d: any) => d.id).distance(100))
      .force('center', forceCenter(width / 2, height / 2))
      .on('tick', () => {
        setSimulationNodes([...simNodes]);
        setSimulationLinks([...simLinks]);
      });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  if (!font) {
    return <View />;
  }

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Canvas style={{ flex: 1 }}>
            <Group matrix={transform}>
                {/* Edges */}
                {simulationLinks.map((link, i) => {
                    const source = link.source as ConstellationNode;
                    const target = link.target as ConstellationNode;
                    if (typeof source === 'object' && typeof target === 'object' && source.x && source.y && target.x && target.y) {
                         const path = Skia.Path.Make();
                         path.moveTo(source.x, source.y);

                         const midX = (source.x + target.x) / 2;
                         const midY = (source.y + target.y) / 2;
                         const dx = target.x - source.x;
                         const dy = target.y - source.y;

                         const controlX = midX - dy * 0.2;
                         const controlY = midY + dx * 0.2;

                         path.quadTo(controlX, controlY, target.x, target.y);

                         return (
                             <Path
                                key={`link-${i}`}
                                path={path}
                                color="#E3DCCB"
                                style="stroke"
                                strokeWidth={1}
                                opacity={0.2}
                             />
                         );
                    }
                    return null;
                })}

                {/* Nodes */}
                {simulationNodes.map((node, i) => {
                    if (!node.x || !node.y) return null;
                    const r = 20;
                    return (
                        <Group key={`node-${node.id}`}>
                            <Circle cx={node.x} cy={node.y} r={r}>
                                {node.status === 'mastered' && goldShader ? (
                                    <Shader source={goldShader} uniforms={goldUniforms} />
                                ) : (
                                    <Fill color={node.status === 'locked' ? '#333' : '#E3DCCB'} />
                                )}
                            </Circle>
                            {/* Label */}
                            <Text
                                x={node.x - 10}
                                y={node.y + r + 15}
                                text={node.label}
                                font={font}
                                color="#E3DCCB"
                            />
                        </Group>
                    );
                })}
            </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
};

export default ConstellationMap;
