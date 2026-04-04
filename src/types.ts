// THE CANONICAL DATA CONTRACT
// This file rules them all. Backend and Frontend must agree on this!
// v0.8.2 — Supabase Auth, Paywall, ContrastiveProfile, Voyage, Progressive Disclosure

import type { Token, AncientContext } from '../components/WordChip';

// ── CEFR & MASTERY ───────────────────────────────────────────────────────────

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type MasteryState = 'unseen' | 'seen' | 'practiced' | 'mastered';
export type DisclosureLevel = 'translation' | 'audio' | 'knot' | 'etymology';

// ── USER & AUTH ──────────────────────────────────────────────────────────────

export type UserTier = 'initiate' | 'scholar';

export interface UserProfile {
  id: string;
  email: string;
  tier: UserTier;
}

// ── CONTRASTIVE PROFILE (from GET /inspect/{lemma}) ──────────────────────────
// The diachronic fingerprint of a word: LSJ roots, KDS distance, merged scholia.

export interface Idiom {
  expression: string;
  translation: string;
  source?: string;
}

export interface Collocation {
  text: string;
  frequency: number;
}

export interface ContrastiveProfile {
  david_note: string;                            // AI-compiled diachronic note
  rag_scholia: string;                           // Raw academic citation
  grammar_scholia: string;                       // Merged RAG + Davidian synthesis
  lsj_definitions: string[];                     // LSJ dictionary entries
  kds_score: number;                             // Diachronic distance score (0–1)
  paradigm: { form: string; tags: string[] }[];  // Declension/conjugation table
  ancient_ancestor?: string;                     // Deep etymon (Homeric/Classical root)
  idioms?: Idiom[];                              // METIS idiom data
  collocations?: Collocation[];                  // HNC collocational data
}

// ── API ERROR TYPING ─────────────────────────────────────────────────────────

export type ApiErrorKind = 'void' | 'unauthorized' | 'network' | 'server';

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── RAW BACKEND DTOs ────────────────────────────────────────────────────────
// These mirror the Python backend's JSON shape exactly.
// The frontend Knot/CuratedSentenceDTO types below are the normalized forms
// used by UI components — mappers convert between the two.

export interface KnotDTO {
  target_word_mg?: string;      // The Modern Greek word form in context
  lexis_ag?: string;            // The Ancient Greek lexical ancestor
  knot_type?: string;           // Classification (NOUN, VERB, ADJ, etc.)
  david_note?: string;          // AI-compiled diachronic evolutionary note
  rag_scholia?: string;         // Raw academic citation from Holton et al.
  ancient_ancestor?: string;    // Deep etymon (if present in backend response)
  // ── Fields the backend may send in either DTO or Knot shape ──────────
  text?: string;                // Already-mapped text (if backend uses Knot shape)
  lemma?: string;               // Already-mapped lemma
  pos?: string;                 // Already-mapped pos
  word?: string;                // Alternative key some backends use for the surface form
  surface_form?: string;        // Another alternative surface-form key
  transliteration?: string;     // Latin-script transliteration
  cefr_level?: string;          // CEFR proficiency level
  definition?: string;          // Short lexical definition
  morphology?: string;          // Human-readable morphological description
  tag?: string;                 // Morphological tags
  has_paradigm?: boolean;       // Whether paradigm data is present
  paradigm?: any[];             // Raw backend shape — normalized by mapKnotDTO
  [key: string]: any;           // Catch-all for unknown backend fields
}

export interface CuratedSentenceBackendDTO {
  greek_text?: string;
  english_translation?: string;
  translation?: string;         // Alternate key the backend may send
  audio_url?: string | null;
  knots?: KnotDTO[];
  words?: KnotDTO[];            // Alternate key the backend may send for knots
  // ── Fields present if the backend uses the frontend shape directly ────
  id?: string;
  [key: string]: any;           // Catch-all for unknown backend keys
}

// ── PARADIGM NORMALIZER ─────────────────────────────────────────────────────
// The backend may send paradigm data in many shapes:
//   - string[]:                ["κόσμου", "κόσμῳ", ...]
//   - { form, tags }[]:        [{ form: "κόσμου", tags: ["Gen","Sing"] }]
//   - { word, features }[]:    [{ word: "κόσμου", features: "Gen.Sing" }]
//   - { text, label }[]:       [{ text: "κόσμου", label: "genitive" }]
// This normalizer coerces ALL of the above into the canonical { form, tags }[].

function normalizeParadigmEntry(entry: any): { form: string; tags: string[] } | null {
  if (!entry) return null;

  // Plain string: "κόσμου"
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    return trimmed ? { form: trimmed, tags: [] } : null;
  }

  // Object: extract form from any plausible key
  if (typeof entry === 'object') {
    const form = String(
      entry.form ?? entry.word ?? entry.text ?? entry.surface_form ?? entry.surface ?? ''
    ).trim();

    let tags: string[] = [];
    const rawTags = entry.tags ?? entry.features ?? entry.morphology ?? entry.label;
    if (Array.isArray(rawTags)) {
      tags = rawTags.map(String);
    } else if (typeof rawTags === 'string' && rawTags.length > 0) {
      tags = rawTags.split(/[|,;]/).map((t: string) => t.trim()).filter(Boolean);
    }

    return form ? { form, tags } : null;
  }

  // Fallback: coerce to string
  const str = String(entry).trim();
  return str ? { form: str, tags: [] } : null;
}

function normalizeParadigm(raw: any): { form: string; tags: string[] }[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  const normalized = raw
    .map(normalizeParadigmEntry)
    .filter((p): p is { form: string; tags: string[] } => p !== null && p.form.length > 0);
  return normalized.length > 0 ? normalized : undefined;
}

/**
 * THE IRON MAPPER — Map a raw backend KnotDTO into the frontend Knot shape.
 * Accepts BOTH the raw DTO schema (target_word_mg, lexis_ag, knot_type) AND
 * the frontend Knot schema (text, lemma, pos). Gracefully handles missing fields.
 *
 * Fallback chain for text: target_word_mg → text → word → surface_form → lemma → lexis_ag
 * Fallback chain for lemma: lexis_ag → lemma → target_word_mg → text → word
 * Paradigm is normalized from any backend shape into canonical { form, tags }[].
 */
export function mapKnotDTO(dto: KnotDTO, index: number): Knot {
  // Defensive: if dto is null/undefined, return a shell
  if (!dto) {
    return {
      id: `knot-${index}`,
      text: '',
      lemma: '',
      pos: '',
      david_note: '',
      rag_scholia: '',
    };
  }

  // Aggressive fallback — terminal 'UNKNOWN' makes mapper failures visible in UI
  const text = dto.target_word_mg || dto.text || dto.word || dto.surface_form || dto.lemma || dto.lexis_ag || 'UNKNOWN';
  const lemma = dto.lexis_ag || dto.lemma || dto.target_word_mg || dto.text || dto.word || 'UNKNOWN';
  const pos = dto.knot_type || dto.pos || '';

  // Normalize the paradigm from whatever shape the backend sends
  const paradigm = normalizeParadigm(dto.paradigm);

  return {
    id: `knot-${index}`,
    text,
    lemma,
    pos,
    david_note: dto.david_note ?? '',
    rag_scholia: dto.rag_scholia ?? '',
    ancient_ancestor: dto.ancient_ancestor,
    transliteration: dto.transliteration,
    cefr_level: dto.cefr_level as CefrLevel | undefined,
    definition: dto.definition,
    morphology: dto.morphology,
    tag: dto.tag,
    has_paradigm: dto.has_paradigm ?? (paradigm !== undefined && paradigm.length > 0),
    paradigm,
  };
}

/** Map a raw backend CuratedSentenceBackendDTO into the frontend shape. */
export function mapCuratedSentenceDTO(
  dto: CuratedSentenceBackendDTO,
  index: number,
): CuratedSentenceDTO {
  if (!dto) {
    return { id: `sentence-${index}`, greek_text: '', translation: '', knots: [] };
  }

  // Fallback chain: knots → words → annotations → tokens (backends use varying keys)
  const rawKnots: any[] =
    Array.isArray(dto.knots) && dto.knots.length > 0 ? dto.knots :
    Array.isArray(dto.words) && dto.words.length > 0 ? dto.words :
    Array.isArray((dto as any).annotations) ? (dto as any).annotations :
    Array.isArray((dto as any).tokens) ? (dto as any).tokens :
    [];

  return {
    id: dto.id || `sentence-${index}`,
    greek_text: dto.greek_text || (dto as any).text || '',
    translation: dto.english_translation || dto.translation || '',
    knots: rawKnots.map(mapKnotDTO),
  };
}

/**
 * THE IRON GATE — Normalize an entire IslandDTO from raw backend JSON.
 * Call this on the raw response.json() to ensure every knot is mapped,
 * every array is safe, and every field has a sane default.
 */
export function mapIslandDTO(raw: any): IslandDTO {
  if (!raw) {
    return { id: '', title: '', level: '', progress: 0, locked: false, sentences: [] };
  }

  const rawSentences = Array.isArray(raw.sentences) ? raw.sentences : [];

  return {
    id: raw.id || '',
    title: raw.title || '',
    level: raw.level || '',
    progress: raw.progress ?? 0,
    locked: raw.locked ?? false,
    sentences: rawSentences.map(mapCuratedSentenceDTO),
  };
}

export interface NodeData {
  knot_id?: string;
  hero?: string;
  knot_definition?: string;
  target_sentence?: string; // The Greek Sentence
  source_sentence?: string; // The English Translation
  target_tokens?: Token[];
  ancient_context?: AncientContext | string;
}

// ── THE CURATED SENTENCE CONTRACT ────────────────────────────────────────────
// Source of truth for the Island Workbench. Each sentence is a curated
// philological artifact with annotated knots (words of interest).

export interface Knot {
  id: string;
  text: string;              // The Greek word form as it appears in the sentence
  lemma: string;             // Dictionary headword
  pos: string;               // Part of speech (NOUN, VERB, ADJ, etc.)
  tag?: string;              // Morphological tags (pipe-separated: Case=Nom|Number=Sing)
  transliteration?: string;  // Latin-script transliteration
  morphology?: string;       // Human-readable morphological description
  definition?: string;       // Short lexical definition

  // THE KNOT: Davidian Note — AI-compiled evolutionary note
  david_note: string;

  // THE SCHOLIA: RAG — raw academic citation from Holton et al.
  rag_scholia: string;

  // v0.7.0 — ContrastiveProfile fields (populated by GET /inspect/{lemma})
  grammar_scholia?: string;    // Merged RAG + Davidian synthesis
  lsj_definitions?: string[];  // LSJ dictionary entries
  kds_score?: number;           // Diachronic distance score (0–1)

  // v0.8.2 — Extended philological fields
  ancient_ancestor?: string;           // Deep etymon (Homeric/Classical root)
  cefr_level?: CefrLevel;             // CEFR proficiency level
  ngrams?: string[];                   // HNC collocational phrases
  kelly_rank?: number;                 // Kelly Core frequency rank
  idioms?: Idiom[];                    // METIS idiom data

  // THE PARADIGM: Declension/conjugation table data
  has_paradigm?: boolean;
  paradigm?: { form: string; tags: string[] }[];
}

export interface CuratedSentenceDTO {
  id: string;
  greek_text: string;        // The primary Greek sentence text
  translation: string;       // English translation
  knots: Knot[];             // Annotated words — the philological treasure
  source?: string;           // Attribution (e.g., "Heraclitus, Fragment 91")
  level?: CefrLevel;          // CEFR level (A1, A2, B1, B2)
}

export interface IslandDTO {
  id: string;
  title: string;
  level: string;
  progress: number;
  locked: boolean;             // v0.7.0 — Paywall: true for free users on B1+
  sentences: CuratedSentenceDTO[];
}

export interface ConstellationNode {
  id: string;
  label: string;
  type: 'theme' | 'lemma' | 'rule';
  status: 'locked' | 'unlocked' | 'mastered' | 'active' | 'pending';
  data?: NodeData; 
  x?: number; // Added by D3
  y?: number; // Added by D3
  vx?: number; // Added by D3
  vy?: number; // Added by D3
}

export interface ConstellationLink {
  source: string | ConstellationNode;
  target: string | ConstellationNode;
  value?: number;
}

export interface ConstellationGraph {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  golden_path: string[];
}

// ── THE VOYAGE (Client-Side Sentence Sequencer) ─────────────────────────────
// Built entirely from IslandDTO.sentences — no new backend endpoint.

export interface VoyageSentence extends CuratedSentenceDTO {
  sequence_index: number;
  mastery: MasteryState;
}

export interface VoyageManifest {
  island_id: string;
  sentences: VoyageSentence[];
  current_index: number;
  started_at: string;
}

// ── THE LAPIDARY'S TABLE (Morphological Challenge) ──────────────────────────

export interface LapidaryChallenge {
  sentence_id: string;
  blanked_knot: Knot;
  options: { form: string; tags: string[] }[];
  correct_form: string;
}