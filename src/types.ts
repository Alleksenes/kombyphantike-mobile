// THE CANONICAL DATA CONTRACT
// This file rules them all. Backend and Frontend must agree on this!

import type { Token, AncientContext } from '../components/WordChip';

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
  level?: string;            // CEFR level (A1, A2, B1, B2)
}

export interface IslandDTO {
  id: string;
  title: string;
  level: string;
  progress: number;
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