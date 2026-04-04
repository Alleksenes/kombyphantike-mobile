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
import { ORRERY_PIGMENTS as P, PhilologicalColors as C, PhilologicalFonts as F } from '../../src/theme';
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
const GRAPH_H = 560;
const CX = GRAPH_W / 2;
const CY = GRAPH_H / 2;

// Orbit radii — five concentric bands for five data types
const INNER_R   = 105;  // LSJ definitions         (Faded Cinnabar)
const MOD_R     = 155;  // Modern defs METIS/Kaikki (Murex Ash)
const MID_R     = 195;  // Collocations / ngrams    (Egyptian Frit)
const OUTER_R   = 235;  // Idioms / MWE             (Verdigris Chalk)

// ── Build Graph from API Data ───────────────────────────────────────────────

function buildDynamicGraph(
  lemma: string,
  profile: ContrastiveProfile,
): { nodes: OrreryNode[]; edges: OrreryEdge[] } {
  const nodes: OrreryNode[] = [];
  const edges: OrreryEdge[] = [];

  // ── SAFE CONSTANTS — defensive extraction from ContrastiveProfile ────────
  const lsjDefs: string[]      = Array.isArray(profile?.lsj_definitions) ? profile.lsj_definitions.filter(Boolean) : [];
  const modernDefs: string[]   = Array.isArray(profile?.definitions)     ? profile.definitions.filter(Boolean)     : [];
  const idioms: Idiom[]        = Array.isArray(profile?.idioms)          ? profile.idioms.filter((i) => i?.expression) : [];
  const collocs: Collocation[] = Array.isArray(profile?.collocations)    ? profile.collocations.filter((c) => c?.text) : [];
  const ngrams: string[]       = Array.isArray(profile?.ngrams)          ? profile.ngrams.filter(Boolean)           : [];
  const ancestor: string       = profile?.ancient_ancestor ?? '';
  const davidNote: string      = profile?.david_note ?? '';
  const ragScholia: string     = profile?.rag_scholia ?? '';
  const kdsScore: number | undefined = profile?.kds_score;

  // Collocation source: prefer typed ngrams (plain strings), fall back to Collocation objects
  type CollocEntry = { label: string; gloss: string };
  const collocEntries: CollocEntry[] = ngrams.length > 0
    ? ngrams.slice(0, 5).map((ng) => ({ label: ng, gloss: ng }))
    : collocs.slice(0, 5).map((c) => ({
        label: c.text,
        gloss: `${c.text} (${(c.frequency ?? 0).toLocaleString()}×)`,
      }));

  // ── Center Star: the searched lemma (Electrum) ──────────────────────────
  const primaryDef = lsjDefs[0] ?? modernDefs[0] ?? davidNote.slice(0, 60) ?? '';
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
      definition: [...lsjDefs, ...modernDefs].join('; '),
      david_note: davidNote,
      rag_scholia: ragScholia,
      ancient_ancestor: ancestor || undefined,
      kds_score: kdsScore,
    },
  });

  // ── Ancestor node — top of chart (shares Electrum) ──────────────────────
  if (ancestor) {
    nodes.push({
      id: 'ancestor',
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
    edges.push({ source: 'center', target: 'ancestor', relation: 'ancestor' });
  }

  // ── LSJ definition nodes — inner orbit, RIGHT arc (Faded Cinnabar) ──────
  // Arc from upper-right to lower-right, clearing space above for ancestor.
  const hasAncestor = !!ancestor;
  const lsjCount = Math.min(lsjDefs.length, 5);
  const lsjStart = hasAncestor ? -Math.PI * 0.38 : -Math.PI / 2;
  const lsjSpan  = hasAncestor ? Math.PI * 1.0   : Math.PI * 2;

  for (let i = 0; i < lsjCount; i++) {
    const id = `lsj-${i}`;
    const angle = lsjStart + (i / Math.max(lsjCount - 1, 1)) * lsjSpan;
    const def = lsjDefs[i];
    nodes.push({
      id,
      label: def,
      gloss: def,
      type: 'lsj',
      x: CX + Math.cos(angle) * INNER_R,
      y: CY + Math.sin(angle) * INNER_R,
      knot: { id: `orrery-lsj-${i}`, text: def, lemma, pos: 'LSJ', definition: def },
    });
    edges.push({ source: 'center', target: id, relation: 'definition' });
  }

  // ── Modern definition nodes — second orbit, LEFT arc (Murex Ash) ────────
  // Arc from lower-left to upper-left, mirroring the LSJ arc on the other side.
  const modCount = Math.min(modernDefs.length, 5);
  const modStart = Math.PI * 0.6;   // ~108° — lower-left
  const modSpan  = Math.PI * 0.8;   // ~144° sweep → ends at ~252°

  for (let i = 0; i < modCount; i++) {
    const id = `mod-${i}`;
    const angle = modStart + (i / Math.max(modCount - 1, 1)) * modSpan;
    const def = modernDefs[i];
    nodes.push({
      id,
      label: def,
      gloss: def,
      type: 'definition',
      x: CX + Math.cos(angle) * MOD_R,
      y: CY + Math.sin(angle) * MOD_R,
      knot: { id: `orrery-mod-${i}`, text: def, lemma, pos: 'MOD', definition: def },
    });
    edges.push({ source: 'center', target: id, relation: 'definition' });
  }

  // ── Collocation / ngram nodes — mid orbit, bottom arc (Egyptian Frit) ───
  // Bottom arc keeps them spatially distinct from the definition arcs above.
  const colCount = collocEntries.length;
  const colStart = Math.PI * 0.45;   // ~81° (right-bottom)
  const colSpan  = Math.PI * 1.1;    // ~198° sweep → ends at ~279°

  for (let i = 0; i < colCount; i++) {
    const id = `colloc-${i}`;
    const angle = colStart + (i / Math.max(colCount, 1)) * colSpan;
    const entry = collocEntries[i];
    nodes.push({
      id,
      label: entry.label,
      gloss: entry.gloss,
      type: 'collocation',
      x: CX + Math.cos(angle) * MID_R,
      y: CY + Math.sin(angle) * MID_R,
      knot: {
        id: `orrery-colloc-${i}`,
        text: entry.label,
        lemma,
        pos: 'HNC',
        definition: entry.gloss,
      },
    });
    edges.push({ source: 'center', target: id, relation: 'collocation' });
  }

  // ── Idiom nodes — outer orbit, upper arc (Verdigris Chalk) ──────────────
  // Spread across the top portion, flanking the ancestor node.
  const idiomCount = Math.min(idioms.length, 5);
  const idiomStart = -Math.PI * 0.38;  // -68° (upper-right)
  const idiomSpan  =  Math.PI * 0.76;  // 137° sweep → ends at +68° (upper-left)

  for (let i = 0; i < idiomCount; i++) {
    const id = `idiom-${i}`;
    const angle = idiomStart + (i / Math.max(idiomCount, 1)) * idiomSpan;
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

// Warm parchment-tinted filaments — subtle antiquity feel on the dark void
const EDGE_COLOR   = 'rgba(223, 206, 159, 0.18)';
const EDGE_STROKE_W = 1.5;

// ── Node Colors — Faded Antiquity Pigments ───────────────────────────────────
// All pigments are light pastels on the dark void. Text is always dark ink.
const NODE_CONFIG: Record<OrreryNode['type'], { fill: string; text: string; stroke: string; r: number; glow: string }> = {
  center:      { fill: P.ELECTRUM,        text: '#111413', stroke: 'rgba(223, 206, 159, 0.55)', r: 46, glow: 'rgba(223, 206, 159, 0.22)' },
  lsj:         { fill: P.FADED_CINNABAR,  text: '#111413', stroke: 'rgba(213, 160, 150, 0.55)', r: 30, glow: 'rgba(213, 160, 150, 0.20)' },
  definition:  { fill: P.MUREX_ASH,       text: '#111413', stroke: 'rgba(181, 163, 196, 0.55)', r: 30, glow: 'rgba(181, 163, 196, 0.20)' },
  ancestor:    { fill: P.ELECTRUM,        text: '#111413', stroke: 'rgba(223, 206, 159, 0.45)', r: 34, glow: 'rgba(223, 206, 159, 0.16)' },
  collocation: { fill: P.EGYPTIAN_FRIT,   text: '#111413', stroke: 'rgba(147, 168, 186, 0.55)', r: 26, glow: 'rgba(147, 168, 186, 0.18)' },
  idiom:       { fill: P.VERDIGRIS_CHALK, text: '#111413', stroke: 'rgba(161, 184, 160, 0.55)', r: 32, glow: 'rgba(161, 184, 160, 0.20)' },
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

  // ── Legend — Faded Antiquity Pigments ─────────────────────────────────
  const legendItems = [
    { color: P.ELECTRUM,        label: 'Center' },
    { color: P.FADED_CINNABAR,  label: 'LSJ / Ancient' },
    { color: P.MUREX_ASH,       label: 'Modern · Kaikki' },
    { color: P.VERDIGRIS_CHALK, label: 'Idiom / MWE' },
    { color: P.EGYPTIAN_FRIT,   label: 'Collocation · HNC' },
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
