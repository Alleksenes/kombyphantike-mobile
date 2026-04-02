// ── THE DIACHRONIC ORRERY ────────────────────────────────────────────────────
// A constellation visualization for a given lemma's semantic neighborhood.
// Mock implementation: hardcoded graph for κόσμος with SVG node/edge rendering.
// Uses pure React Native + react-native-svg (no Skia, no D3).

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ApiService } from '../../src/services/ApiService';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { ContrastiveProfile, Knot } from '../../src/types';

// ── Mock Graph Data ─────────────────────────────────────────────────────────

interface OrreryNode {
  id: string;
  label: string;
  gloss: string;
  type: 'center' | 'synonym' | 'root' | 'derived' | 'idiom';
  x: number;
  y: number;
  cefr?: string;
  knot?: Partial<Knot>;
}

interface OrreryEdge {
  source: string;
  target: string;
  relation: 'synonym' | 'antonym' | 'derived' | 'mwe' | 'ancestor';
}

const { width: SCREEN_W } = Dimensions.get('window');
const GRAPH_W = Math.min(SCREEN_W - 40, 600);
const GRAPH_H = 500;
const CX = GRAPH_W / 2;
const CY = GRAPH_H / 2;

function buildKosmosGraph(): { nodes: OrreryNode[]; edges: OrreryEdge[] } {
  const nodes: OrreryNode[] = [
    {
      id: 'kosmos',
      label: 'κόσμος',
      gloss: 'world, order, ornament',
      type: 'center',
      x: CX,
      y: CY,
      cefr: 'A2',
      knot: {
        id: 'orrery-kosmos',
        text: 'κόσμος',
        lemma: 'κόσμος',
        pos: 'NOUN',
        definition: 'world, order, ornament',
        david_note: "From Homeric 'order/ornament' to Pythagorean 'universe' — the semantic journey of κόσμος mirrors Greek philosophy itself.",
        rag_scholia: 'Holton et al. notes κόσμος as a standard masculine noun (II.2.1.1) with regular -ος/-οι declension.',
        ancient_ancestor: 'κόσμος (Homeric: order, ornament)',
        cefr_level: 'A2',
        kds_score: 0.85,
      },
    },
    {
      id: 'oikoumene',
      label: 'οἰκουμένη',
      gloss: 'the inhabited world',
      type: 'synonym',
      x: CX - 140,
      y: CY - 130,
      cefr: 'C1',
      knot: {
        id: 'orrery-oikoumene',
        text: 'οἰκουμένη',
        lemma: 'οἰκουμένη',
        pos: 'NOUN',
        definition: 'the inhabited world, ecumene',
        david_note: "From οἰκέω (to inhabit). The participle 'the inhabited [land]' became a noun for the known world. Survives in 'ecumenical'.",
        rag_scholia: 'A feminine participle-noun. Classical usage denotes the Greek-inhabited world; modern usage is literary/ecclesiastical.',
      },
    },
    {
      id: 'sympan',
      label: 'σύμπαν',
      gloss: 'universe, totality',
      type: 'synonym',
      x: CX + 150,
      y: CY - 110,
      cefr: 'B2',
      knot: {
        id: 'orrery-sympan',
        text: 'σύμπαν',
        lemma: 'σύμπαν',
        pos: 'NOUN',
        definition: 'universe, totality, the whole',
        david_note: "From σύν + πᾶν (all together). The neuter substantive of σύμπας. In modern Greek, the standard word for 'universe' in scientific contexts.",
        rag_scholia: 'Neuter noun (τὸ σύμπαν). Holton classifies as standard neuter II.2.3.1.',
      },
    },
    {
      id: 'kosmeo',
      label: 'κοσμέω',
      gloss: 'to order, to adorn',
      type: 'root',
      x: CX - 120,
      y: CY + 140,
      cefr: 'C2',
      knot: {
        id: 'orrery-kosmeo',
        text: 'κοσμέω',
        lemma: 'κοσμέω',
        pos: 'VERB',
        definition: 'to arrange, to adorn, to order',
        david_note: "The verbal root from which κόσμος derives. The original sense 'to arrange' reveals why κόσμος means both 'ornament' and 'world-order'.",
        rag_scholia: 'Ancient Greek contracted verb (-έω). Survives in Modern Greek as κοσμώ (literary) and in compounds like καλλωπίζω.',
      },
    },
    {
      id: 'kosmikos',
      label: 'κοσμικός',
      gloss: 'cosmic, worldly, secular',
      type: 'derived',
      x: CX + 130,
      y: CY + 120,
      cefr: 'B1',
      knot: {
        id: 'orrery-kosmikos',
        text: 'κοσμικός',
        lemma: 'κοσμικός',
        pos: 'ADJ',
        definition: 'cosmic, worldly, secular',
        david_note: "The -ικός suffix creates the relational adjective. In Modern Greek, κοσμικός has split: 'cosmic' (scientific) vs 'secular/social' (everyday).",
        rag_scholia: 'Standard -ικός/-ική/-ικό adjective. Holton II.3.1. Regular comparison.',
      },
    },
    {
      id: 'idiom-ano-kato',
      label: 'κάνω τον κόσμο\nάνω κάτω',
      gloss: 'to turn the world upside down',
      type: 'idiom',
      x: CX,
      y: CY - 180,
      knot: {
        id: 'orrery-idiom-1',
        text: 'κάνω τον κόσμο άνω κάτω',
        lemma: 'κόσμος',
        pos: 'MWE',
        definition: 'to turn the world upside down; to cause chaos',
        david_note: "A vivid idiom combining κόσμος (world) with the spatial adverbs ἄνω-κάτω (up-down). The image of inverting world-order echoes the original cosmological meaning.",
        rag_scholia: 'METIS idiom registry. Frequency: common in spoken Greek.',
      },
    },
    {
      id: 'taxi',
      label: 'τάξη',
      gloss: 'order, class, rank',
      type: 'synonym',
      x: CX - 170,
      y: CY + 20,
      cefr: 'A2',
      knot: {
        id: 'orrery-taxi',
        text: 'τάξη',
        lemma: 'τάξη',
        pos: 'NOUN',
        definition: 'order, class, classroom, rank',
        david_note: "From τάσσω (to arrange). Shares the semantic field of 'arrangement' with κόσμος. In modern Greek, primarily 'classroom' or 'social class'.",
        rag_scholia: 'Feminine noun (-η, plural -εις). Holton II.2.2.2. Standard parisyllabic.',
      },
    },
  ];

  const edges: OrreryEdge[] = [
    { source: 'kosmos', target: 'oikoumene', relation: 'synonym' },
    { source: 'kosmos', target: 'sympan', relation: 'synonym' },
    { source: 'kosmos', target: 'kosmeo', relation: 'ancestor' },
    { source: 'kosmos', target: 'kosmikos', relation: 'derived' },
    { source: 'kosmos', target: 'idiom-ano-kato', relation: 'mwe' },
    { source: 'kosmos', target: 'taxi', relation: 'synonym' },
    { source: 'kosmeo', target: 'kosmikos', relation: 'derived' },
  ];

  return { nodes, edges };
}

// ── Edge Colors (Muted Constellation) ───────────────────────────────────────
// Obsidian-style: all edges fade into the void. Differentiated only by dash.

const EDGE_COLORS: Record<OrreryEdge['relation'], string> = {
  synonym: 'rgba(255, 255, 255, 0.15)',
  antonym: 'rgba(255, 255, 255, 0.15)',
  derived: 'rgba(255, 255, 255, 0.12)',
  mwe: 'rgba(255, 255, 255, 0.10)',
  ancestor: 'rgba(255, 255, 255, 0.18)',
};

const EDGE_DASH: Record<OrreryEdge['relation'], string> = {
  synonym: '',
  antonym: '4,4',
  derived: '6,4',
  mwe: '3,5',
  ancestor: '8,4',
};

// ── Node Colors (Jewel Tones) ───────────────────────────────────────────────
// Muted, sophisticated: gold for ancient, teal for synonyms, rust for idioms.

const NODE_CONFIG: Record<OrreryNode['type'], { fill: string; stroke: string; r: number; glow: string }> = {
  center:  { fill: C.INK, stroke: C.GOLD,       r: 42, glow: 'rgba(197, 160, 89, 0.15)' },
  synonym: { fill: C.INK, stroke: C.JEWEL_TEAL, r: 32, glow: 'rgba(74, 140, 130, 0.12)' },
  root:    { fill: C.INK, stroke: C.JEWEL_GOLD, r: 32, glow: 'rgba(184, 155, 94, 0.12)' },
  derived: { fill: C.INK, stroke: C.JEWEL_SLATE, r: 28, glow: 'rgba(107, 123, 141, 0.10)' },
  idiom:   { fill: C.INK, stroke: C.JEWEL_RUST,  r: 36, glow: 'rgba(160, 100, 75, 0.12)' },
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function OrreryScreen() {
  const { lemma } = useLocalSearchParams<{ lemma: string }>();
  const router = useRouter();
  const openInspector = useInspectorStore((s) => s.openInspector);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ContrastiveProfile | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  // Gesture handling for the Orrery canvas
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Fetch the ContrastiveProfile for this lemma to augment the graph
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await ApiService.inspectLemma(decodeURIComponent(lemma || 'κόσμος'));
        if (!cancelled && data) setProfile(data);
      } catch (e) {
        console.warn('[Orrery] API unreachable — using mock graph only');
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lemma]);

  // Build mock graph, then augment with API data (idioms, collocations)
  const { nodes, edges } = useMemo(() => {
    const mock = buildKosmosGraph();

    if (!profile) return mock;

    // Augment: add idiom nodes from API that aren't already in mock
    const existingIds = new Set(mock.nodes.map((n) => n.id));

    // Add API idioms as MWE wormhole nodes
    if (profile.idioms?.length) {
      profile.idioms.forEach((idiom, i) => {
        const id = `api-idiom-${i}`;
        if (existingIds.has(id)) return;
        const angle = Math.PI * 0.3 + (i * Math.PI * 0.4 / Math.max(profile.idioms?.length || 1, 1));
        mock.nodes.push({
          id,
          label: idiom.expression.length > 20 ? idiom.expression.slice(0, 20) + '...' : idiom.expression,
          gloss: idiom.translation,
          type: 'idiom',
          x: CX + Math.cos(angle) * 160,
          y: CY + Math.sin(angle) * 140,
          knot: {
            id,
            text: idiom.expression,
            lemma: decodeURIComponent(lemma || 'κόσμος'),
            pos: 'MWE',
            definition: idiom.translation,
            david_note: `Idiom: ${idiom.expression}`,
            rag_scholia: idiom.source || 'METIS idiom registry',
          },
        });
        mock.edges.push({ source: 'kosmos', target: id, relation: 'mwe' });
      });
    }

    return mock;
  }, [profile, lemma]);

  const nodeMap = useMemo(() => {
    const map: Record<string, OrreryNode> = {};
    nodes.forEach((n) => { map[n.id] = n; });
    return map;
  }, [nodes]);

  const selectedNode = selectedId ? nodeMap[selectedId] : null;

  const handleNodePress = (node: OrreryNode) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedId(node.id === selectedId ? null : node.id);
  };

  const handleInspect = (node: OrreryNode) => {
    if (!node.knot) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    openInspector(node.knot as any, 'knot');
  };

  // ── Legend items (jewel tones match node strokes)
  const legendItems = [
    { color: C.JEWEL_TEAL, label: 'Synonym', dash: false },
    { color: C.JEWEL_GOLD, label: 'Ancestor', dash: true },
    { color: C.JEWEL_SLATE, label: 'Derived', dash: true },
    { color: C.JEWEL_RUST, label: 'Idiom (MWE)', dash: true },
  ];

  return (
    <View style={styles.root}>
      {/* ── Back Button ──────────────────────────────────────────────── */}
      <View style={styles.hudTop}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          hitSlop={12}
        >
          <Text style={styles.backIcon}>{'‹'}</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>DIACHRONIC ORRERY</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{decodeURIComponent(lemma || 'κόσμος')}</Text>
            {apiLoading ? (
              <ActivityIndicator size="small" color={C.GOLD} style={{ marginLeft: 8 }} />
            ) : profile ? (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── The Constellation SVG ──────────────────────────────────── */}
        <GestureHandlerRootView style={styles.graphContainer}>
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[styles.graphWrapper, animatedStyle]}>
              <Svg width={GRAPH_W} height={GRAPH_H}>
                <Defs>
              {/* Radial glow gradients for each node */}
              {nodes.map((node) => {
                const cfg = NODE_CONFIG[node.type];
                return (
                  <RadialGradient key={`glow-${node.id}`} id={`glow-${node.id}`} cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={cfg.glow} stopOpacity="1" />
                    <Stop offset="100%" stopColor={cfg.glow} stopOpacity="0" />
                  </RadialGradient>
                );
              })}
            </Defs>

            {/* Edges — muted, thin, fading into the void */}
            {edges.map((edge, i) => {
              const src = nodeMap[edge.source];
              const tgt = nodeMap[edge.target];
              if (!src || !tgt) return null;
              return (
                <Line
                  key={`edge-${i}`}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={EDGE_COLORS[edge.relation]}
                  strokeWidth={1.5}
                  strokeDasharray={EDGE_DASH[edge.relation]}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Node Glow Halos */}
            {nodes.map((node) => {
              const cfg = NODE_CONFIG[node.type];
              const isSelected = node.id === selectedId;
              return (
                <Circle
                  key={`halo-${node.id}`}
                  cx={node.x}
                  cy={node.y}
                  r={cfg.r + 12}
                  fill={`url(#glow-${node.id})`}
                  opacity={isSelected ? 0.8 : 0.4}
                />
              );
            })}

            {/* Nodes — solid jewel-tone circles */}
            {nodes.map((node) => {
              const cfg = NODE_CONFIG[node.type];
              const isSelected = node.id === selectedId;
              return (
                <Circle
                  key={node.id}
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? cfg.r + 3 : cfg.r}
                  fill={cfg.fill}
                  stroke={isSelected ? C.PARCHMENT : cfg.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  fillOpacity={1}
                  onPress={() => handleNodePress(node)}
                />
              );
            })}

                {/* Node Labels — crisp GFSDidot against the void */}
                {nodes.map((node) => {
                  const cfg = NODE_CONFIG[node.type];
                  const lines = node.label.split('\n');
                  return lines.map((line, li) => (
                    <SvgText
                      key={`${node.id}-label-${li}`}
                      x={node.x}
                      y={node.y + (li * 15) - ((lines.length - 1) * 7.5)}
                      textAnchor="middle"
                      alignmentBaseline="central"
                      fill={node.type === 'center' ? C.GOLD : C.PARCHMENT}
                      fontSize={node.type === 'center' ? 14 : 11}
                      fontWeight={node.type === 'center' ? 'bold' : 'normal'}
                      fontFamily={F.DISPLAY}
                      onPress={() => handleNodePress(node)}
                    >
                      {line}
                    </SvgText>
                  ));
                })}
              </Svg>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>

        {/* ── Legend ──────────────────────────────────────────────────── */}
        <View style={styles.legend}>
          {legendItems.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendLine, { backgroundColor: item.color }, item.dash && styles.legendDash]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Evidence Panel ─────────────────────────────────────────── */}
        {selectedNode ? (
          <View style={styles.evidencePanel}>
            <View style={styles.evidenceHeader}>
              <Text style={styles.evidenceWord}>{selectedNode.label.replace('\n', ' ')}</Text>
              {selectedNode.cefr && (
                <View style={styles.cefrBadge}>
                  <Text style={styles.cefrText}>{selectedNode.cefr}</Text>
                </View>
              )}
            </View>

            <Text style={styles.evidenceGloss}>{selectedNode.gloss}</Text>

            {/* Type badge */}
            <View style={styles.typeBadgeRow}>
              <View style={[styles.typeBadge, { borderColor: NODE_CONFIG[selectedNode.type].stroke }]}>
                <Text style={[styles.typeBadgeText, { color: NODE_CONFIG[selectedNode.type].stroke }]}>
                  {selectedNode.type.toUpperCase()}
                </Text>
              </View>
              {selectedNode.knot?.pos && (
                <View style={styles.posBadge}>
                  <Text style={styles.posBadgeText}>{selectedNode.knot.pos}</Text>
                </View>
              )}
            </View>

            {/* Davidian Note excerpt */}
            {selectedNode.knot?.david_note ? (
              <View style={styles.noteExcerpt}>
                <Text style={styles.noteExcerptLabel}>Diachronic Note</Text>
                <Text style={styles.noteExcerptBody}>{selectedNode.knot.david_note}</Text>
              </View>
            ) : null}

            {/* API-sourced: KDS score (if this is the center node and profile loaded) */}
            {profile && selectedNode.id === 'kosmos' && profile.kds_score != null ? (
              <View style={styles.kdsRow}>
                <Text style={styles.kdsLabel}>KDS Score</Text>
                <Text style={styles.kdsValue}>{profile.kds_score.toFixed(2)}</Text>
              </View>
            ) : null}

            {/* API-sourced: HNC Collocations */}
            {profile && selectedNode.id === 'kosmos' && (profile.collocations?.length || 0) > 0 ? (
              <View style={styles.collocationsRow}>
                <Text style={styles.noteExcerptLabel}>HNC Collocations</Text>
                <View style={styles.collocChips}>
                  {(profile.collocations ?? []).slice(0, 6).map((c, i) => (
                    <View key={i} style={styles.collocChip}>
                      <Text style={styles.collocChipText}>{c.text}</Text>
                      <Text style={styles.collocChipFreq}>{c.frequency.toLocaleString()}×</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Inspect button */}
            <Pressable
              style={({ pressed }) => [styles.inspectButton, pressed && styles.inspectButtonPressed]}
              onPress={() => handleInspect(selectedNode)}
            >
              <Text style={styles.inspectButtonText}>Open in Inspector</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.hintPanel}>
            <Text style={styles.hintText}>
              Tap a node to reveal its evidence stack
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // ── HUD ──────────────────────────────────────────────────────────────────
  hudTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 15, 13, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.15)',
    borderColor: C.GOLD,
  },
  backIcon: {
    color: C.GOLD,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
    marginLeft: -2,
  },
  titleBlock: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontFamily: F.LABEL,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#34D399',
    letterSpacing: 1,
  },
  eyebrow: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 3,
    color: C.GOLD,
    textTransform: 'uppercase',
  },
  titleText: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.PARCHMENT,
    marginTop: 2,
  },

  scrollContent: {
    paddingBottom: 60,
  },

  // ── Graph ────────────────────────────────────────────────────────────────
  graphContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  graphWrapper: {
    width: GRAPH_W,
    height: GRAPH_H,
  },

  // ── Legend ────────────────────────────────────────────────────────────────
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
  legendDash: {
    opacity: 0.7,
  },
  legendLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    color: C.GRAY_TEXT,
    letterSpacing: 0.5,
  },

  // ── Evidence Panel ───────────────────────────────────────────────────────
  evidencePanel: {
    marginHorizontal: 20,
    backgroundColor: C.SURFACE_HEAVY,
    borderWidth: 1,
    borderColor: C.GOLD_DIM,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evidenceWord: {
    fontFamily: F.DISPLAY,
    fontSize: 24,
    color: C.PARCHMENT,
    flex: 1,
  },
  cefrBadge: {
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cefrText: {
    fontFamily: F.LABEL,
    fontSize: 10,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1,
  },
  evidenceGloss: {
    fontFamily: F.BODY,
    fontSize: 14,
    color: C.GRAY_TEXT,
    fontStyle: 'italic',
  },
  typeBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  posBadge: {
    backgroundColor: 'rgba(55, 65, 81, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  posBadgeText: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    color: C.GRAY_TEXT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  noteExcerpt: {
    backgroundColor: 'rgba(10, 15, 13, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 16,
  },
  noteExcerptLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: C.GOLD,
    marginBottom: 8,
  },
  noteExcerptBody: {
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.PARCHMENT,
    lineHeight: 20,
  },
  kdsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(197, 160, 89, 0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.15)',
  },
  kdsLabel: {
    fontFamily: F.LABEL,
    fontSize: 9,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  kdsValue: {
    fontFamily: F.DISPLAY,
    fontSize: 18,
    color: C.GOLD,
    fontWeight: 'bold',
  },
  collocationsRow: {
    gap: 8,
  },
  collocChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  collocChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 5, 24, 0.4)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  collocChipText: {
    fontFamily: F.BODY,
    fontSize: 11,
    color: C.PARCHMENT,
  },
  collocChipFreq: {
    fontFamily: F.LABEL,
    fontSize: 9,
    color: C.GRAY_TEXT,
  },
  inspectButton: {
    backgroundColor: C.GOLD_DIM,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.3)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  inspectButtonPressed: {
    backgroundColor: 'rgba(197, 160, 89, 0.25)',
    borderColor: C.GOLD,
  },
  inspectButtonText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    color: C.GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Hint Panel ───────────────────────────────────────────────────────────
  hintPanel: {
    marginHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 24,
  },
  hintText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    color: 'rgba(156, 163, 175, 0.5)',
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
});
