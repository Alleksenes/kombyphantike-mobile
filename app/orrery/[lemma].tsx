// ── THE DIACHRONIC ORRERY (DYNAMIC) ─────────────────────────────────────────
// A constellation visualization for ANY lemma's semantic neighborhood.
// Fully dynamic: the graph is built entirely from the API's ContrastiveProfile.
// No hardcoded mock data — every node comes from live data.

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, Line, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { ApiService } from '../../src/services/ApiService';
import { useInspectorStore } from '../../src/store/unifiedInspectorStore';
import { PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
import type { Collocation, ContrastiveProfile, Idiom, Knot } from '../../src/types';

// ── Graph Types ─────────────────────────────────────────────────────────────

interface OrreryNode {
  id: string;
  label: string;
  gloss: string;
  type: 'center' | 'definition' | 'lsj' | 'idiom' | 'collocation' | 'ancestor';
  x: number;
  y: number;
  knot?: Partial<Knot>;
}

/** Split a long label into multiple lines at word boundaries (~20 chars each). */
function wrapLabel(text: string, maxChars = 20): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

interface OrreryEdge {
  source: string;
  target: string;
  relation: 'definition' | 'idiom' | 'collocation' | 'ancestor';
}

// ── Layout Constants ────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const GRAPH_W = Math.min(SCREEN_W - 40, 600);
const GRAPH_H = 520;
const CX = GRAPH_W / 2;
const CY = GRAPH_H / 2;

// Orbit radii
const INNER_R = 120;  // definitions
const MID_R = 170;    // collocations
const OUTER_R = 200;  // idioms

// ── Build Graph from API Data ───────────────────────────────────────────────

function buildDynamicGraph(
  lemma: string,
  profile: ContrastiveProfile,
): { nodes: OrreryNode[]; edges: OrreryEdge[] } {
  const nodes: OrreryNode[] = [];
  const edges: OrreryEdge[] = [];

  // ── SAFE CONSTANTS — never touch profile.xxx directly below this line ──
  const defs: string[]         = Array.isArray(profile?.lsj_definitions) ? profile.lsj_definitions.filter(Boolean) : [];
  const collocs: Collocation[] = Array.isArray(profile?.collocations) ? profile.collocations.filter((c) => c && c.text) : [];
  const idioms: Idiom[]        = Array.isArray(profile?.idioms) ? profile.idioms.filter((i) => i && i.expression) : [];
  const ancestor: string       = profile?.ancient_ancestor ?? '';
  const davidNote: string      = profile?.david_note ?? '';
  const ragScholia: string     = profile?.rag_scholia ?? '';
  const kdsScore: number | undefined = profile?.kds_score;

  // ── Center Star: the queried lemma ──────────────────────────────────────
  const primaryDef = defs[0] ?? davidNote.slice(0, 60) ?? '';
  nodes.push({
    id: 'center',
    label: lemma,
    gloss: primaryDef,
    type: 'center',
    x: CX,
    y: CY,
    knot: {
      id: 'orrery-center',
      text: lemma,
      lemma,
      pos: 'NOUN',
      definition: defs.join('; '),
      david_note: davidNote,
      rag_scholia: ragScholia,
      ancient_ancestor: ancestor || undefined,
      kds_score: kdsScore,
    },
  });

  // ── Ancestor node (if present) ──────────────────────────────────────────
  if (ancestor) {
    const id = 'ancestor';
    nodes.push({
      id,
      label: ancestor,
      gloss: 'Ancient etymon',
      type: 'ancestor',
      x: CX,
      y: CY - OUTER_R,
      knot: {
        id: 'orrery-ancestor',
        text: ancestor,
        lemma,
        pos: 'ETYM',
        definition: ancestor,
        david_note: davidNote,
      },
    });
    edges.push({ source: 'center', target: id, relation: 'ancestor' });
  }

  // ── Definition nodes (inner orbit) ──────────────────────────────────────
  const defCount = Math.min(defs.length, 5);
  const hasAncestor = !!ancestor;
  const defStartAngle = hasAncestor ? -Math.PI * 0.3 : -Math.PI / 2;

  for (let i = 0; i < defCount; i++) {
    const id = `def-${i}`;
    const angle = defStartAngle + (i / Math.max(defCount - 1, 1)) * (hasAncestor ? Math.PI * 1.6 : Math.PI * 2);
    const def = defs[i] || '';
    nodes.push({
      id,
      label: def,
      gloss: def,
      type: 'lsj',
      x: CX + Math.cos(angle) * INNER_R,
      y: CY + Math.sin(angle) * INNER_R,
      knot: {
        id: `orrery-def-${i}`,
        text: def,
        lemma,
        pos: 'DEF',
        definition: def,
      },
    });
    edges.push({ source: 'center', target: id, relation: 'definition' });
  }

  // ── Collocation nodes (mid orbit) ─────────────────────────────────────
  const collocCount = Math.min(collocs.length, 6);
  for (let i = 0; i < collocCount; i++) {
    const id = `colloc-${i}`;
    const angle = (Math.PI * 0.8) + (i / Math.max(collocCount, 1)) * Math.PI * 1.2;
    const c = collocs[i];
    const cText = c.text || '';
    const cFreq = typeof c.frequency === 'number' ? c.frequency : 0;
    nodes.push({
      id,
      label: cText,
      gloss: `${cText} (${cFreq.toLocaleString()}×)`,
      type: 'collocation',
      x: CX + Math.cos(angle) * MID_R,
      y: CY + Math.sin(angle) * MID_R,
      knot: {
        id: `orrery-colloc-${i}`,
        text: cText,
        lemma,
        pos: 'COLL',
        definition: `Collocation: ${cText} — ${cFreq.toLocaleString()} occurrences`,
      },
    });
    edges.push({ source: 'center', target: id, relation: 'collocation' });
  }

  // ── Idiom nodes (outer orbit) ─────────────────────────────────────────
  const idiomCount = Math.min(idioms.length, 5);
  for (let i = 0; i < idiomCount; i++) {
    const id = `idiom-${i}`;
    const angle = -Math.PI * 0.3 + (i / Math.max(idiomCount, 1)) * Math.PI * 0.6;
    const idiom = idioms[i];
    const expr = idiom.expression || '';
    const trans = idiom.translation || '';
    nodes.push({
      id,
      label: expr,
      gloss: trans,
      type: 'idiom',
      x: CX + Math.cos(angle) * OUTER_R,
      y: CY + Math.sin(angle) * OUTER_R,
      knot: {
        id: `orrery-idiom-${i}`,
        text: expr,
        lemma,
        pos: 'MWE',
        definition: trans,
        david_note: `Idiom: ${expr}`,
        rag_scholia: idiom.source || 'METIS idiom registry',
      },
    });
    edges.push({ source: 'center', target: id, relation: 'idiom' });
  }

  return { nodes, edges };
}

// ── Edge Colors ─────────────────────────────────────────────────────────────

const EDGE_COLOR = '#4c535b';
const EDGE_STROKE_W = 1.5;

// ── Node Colors ─────────────────────────────────────────────────────────────

// Obsidian Orrery — strict high-contrast palette with per-node text colors
const NODE_CONFIG: Record<OrreryNode['type'], { fill: string; text: string; stroke: string; r: number; glow: string }> = {
  center:      { fill: '#ffd33d', text: '#000000', stroke: 'rgba(255, 211, 61, 0.35)',  r: 46, glow: 'rgba(255, 211, 61, 0.18)' },
  lsj:         { fill: '#ff9800', text: '#000000', stroke: 'rgba(255, 152, 0, 0.35)',  r: 30, glow: 'rgba(255, 152, 0, 0.15)' },
  definition:  { fill: '#e93188', text: '#ffffff', stroke: 'rgba(233, 49, 136, 0.35)', r: 30, glow: 'rgba(233, 49, 136, 0.15)' },
  ancestor:    { fill: '#ff9800', text: '#000000', stroke: 'rgba(255, 152, 0, 0.35)',  r: 34, glow: 'rgba(255, 152, 0, 0.15)' },
  collocation: { fill: '#58a6ff', text: '#000000', stroke: 'rgba(88, 166, 255, 0.35)', r: 26, glow: 'rgba(88, 166, 255, 0.12)' },
  idiom:       { fill: '#42b883', text: '#000000', stroke: 'rgba(66, 184, 131, 0.35)', r: 32, glow: 'rgba(66, 184, 131, 0.15)' },
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function OrreryScreen() {
  const { lemma: rawLemma } = useLocalSearchParams<{ lemma: string }>();
  const lemma = decodeURIComponent(rawLemma || '');
  const router = useRouter();
  const openInspector = useInspectorStore((s) => s.openInspector);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ContrastiveProfile | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  // Fetch the ContrastiveProfile for this lemma
  useEffect(() => {
    // Guard: Expo Router passes the literal "[lemma]" during the initial
    // unresolved render cycle. Firing inspectLemma with that string causes a 404.
    if (!lemma || lemma === '[lemma]') return;
    let cancelled = false;
    setApiLoading(true);
    setProfile(null);
    setSelectedId(null);
    (async () => {
      try {
        const data = await ApiService.inspectLemma(lemma);
        if (!cancelled && data) setProfile(data);
      } catch (e) {
        console.warn('[Orrery] API unreachable for', lemma);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lemma]);

  // Build dynamic graph from API data
  const { nodes, edges } = useMemo(() => {
    if (!profile) return { nodes: [], edges: [] };
    return buildDynamicGraph(lemma, profile);
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

  // ── Legend ─────────────────────────────────────────────────────────────
  const legendItems = [
    { color: '#ffd33d',  label: 'Center' },
    { color: '#ff9800',  label: 'LSJ / Ancestor' },
    { color: '#e93188',  label: 'Modern Definition' },
    { color: '#58a6ff',  label: 'Collocation' },
    { color: '#42b883',  label: 'Idiom / MWE' },
  ];

  // ── Loading State ─────────────────────────────────────────────────────
  if (apiLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.GOLD} />
        <Text style={styles.loadingText}>
          Charting the constellation for {lemma}...
        </Text>
      </View>
    );
  }

  // ── Philological Void: API returned nothing ───────────────────────────
  if (!profile) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed, { position: 'absolute', top: 48, left: 16 }]}
          hitSlop={12}
        >
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </Pressable>
        <Text style={{ fontFamily: F.DISPLAY, fontSize: 24, color: C.GOLD, marginBottom: 8 }}>
          Philological Void
        </Text>
        <Text style={{ fontFamily: F.BODY, fontSize: 14, color: C.GRAY_TEXT, textAlign: 'center', lineHeight: 22 }}>
          The diachronic link for "{lemma}" is lost to time.{'\n'}
          No constellation data could be retrieved.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.searchAgainButton, pressed && styles.searchAgainButtonPressed]}
          onPress={() => router.replace('/orrery' as any)}
        >
          <Text style={styles.searchAgainText}>Search Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Back + Title ──────────────────────────────────────────────── */}
      <View style={styles.hudTop}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          hitSlop={12}
        >
          <Text style={styles.backIcon}>{'\u2039'}</Text>
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>DIACHRONIC ORRERY</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{lemma}</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── The Constellation SVG ──────────────────────────────────── */}
        <View style={styles.graphContainer}>
          <Svg width={GRAPH_W} height={GRAPH_H}>
            <Defs>
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

            {/* Edges */}
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
                  stroke={EDGE_COLOR}
                  strokeWidth={EDGE_STROKE_W}
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
                  r={cfg.r + 14}
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

            {/* Node Labels — outside nodes, word-wrapped, no truncation */}
            {nodes.map((node) => {
              const cfg = NODE_CONFIG[node.type];
              const lines = wrapLabel(node.label, 20);
              return lines.map((line, li) => (
                <SvgText
                  key={`${node.id}-label-${li}`}
                  x={node.x}
                  y={node.y + cfg.r + 15 + li * 14}
                  textAnchor="middle"
                  fill={C.PARCHMENT}
                  fontSize={11}
                  fontWeight={node.type === 'center' ? 'bold' : 'normal'}
                  fontFamily={F.DISPLAY}
                  onPress={() => handleNodePress(node)}
                >
                  {line}
                </SvgText>
              ));
            })}
          </Svg>
        </View>

        {/* ── Legend ──────────────────────────────────────────────────── */}
        <View style={styles.legend}>
          {legendItems.map((item) => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Evidence Panel ─────────────────────────────────────────── */}
        {selectedNode ? (
          <View style={styles.evidencePanel}>
            <View style={styles.evidenceHeader}>
              <Text style={styles.evidenceWord}>{selectedNode.label.replace('\n', ' ')}</Text>
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

            {/* Davidian Note (center node only) */}
            {selectedNode.knot?.david_note && selectedNode.id === 'center' ? (
              <View style={styles.noteExcerpt}>
                <Text style={styles.noteExcerptLabel}>Diachronic Note</Text>
                <Text style={styles.noteExcerptBody}>{selectedNode.knot.david_note}</Text>
              </View>
            ) : null}

            {/* Grammar Scholia (center node only) */}
            {profile.grammar_scholia && selectedNode.id === 'center' ? (
              <View style={styles.noteExcerpt}>
                <Text style={styles.noteExcerptLabel}>Grammar Scholia</Text>
                <Text style={styles.noteExcerptBody}>{profile.grammar_scholia}</Text>
              </View>
            ) : null}

            {/* KDS Score (center node only) */}
            {selectedNode.id === 'center' && profile.kds_score != null ? (
              <View style={styles.kdsRow}>
                <Text style={styles.kdsLabel}>KDS Score</Text>
                <Text style={styles.kdsValue}>{profile.kds_score.toFixed(2)}</Text>
              </View>
            ) : null}

            {/* HNC Collocations (center node) */}
            {selectedNode.id === 'center' && (profile.collocations?.length || 0) > 0 ? (
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

        {/* ── Search Again shortcut ──────────────────────────────────── */}
        <View style={styles.searchAgainRow}>
          <Pressable
            style={({ pressed }) => [styles.searchAgainButton, pressed && styles.searchAgainButtonPressed]}
            onPress={() => router.replace('/orrery' as any)}
          >
            <Text style={styles.searchAgainText}>Search Another Lemma</Text>
          </Pressable>
        </View>
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

  // ── Loading ─────────────────────────────────────────────────────────────
  loadingText: {
    fontFamily: F.BODY,
    fontSize: 13,
    color: C.GRAY_TEXT,
    marginTop: 16,
    fontStyle: 'italic',
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
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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

  // ── Search Again ─────────────────────────────────────────────────────────
  searchAgainRow: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  searchAgainButton: {
    backgroundColor: 'rgba(10, 15, 13, 0.5)',
    borderWidth: 1,
    borderColor: C.GRAY_BORDER,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  searchAgainButtonPressed: {
    backgroundColor: C.GOLD_DIM,
    borderColor: C.GOLD,
  },
  searchAgainText: {
    fontFamily: F.LABEL,
    fontSize: 11,
    fontWeight: 'bold',
    color: C.GRAY_TEXT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
