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