import { API_BASE_URL } from './apiConfig';

// Define types for payloads and responses

export interface NodeData {
  knot_id?: string;
  hero?: string;
  knot_definition?: string;
  ancient_context?: { author: string; greek: string; translation: string; citations?: string[] };
  target_sentence?: string;
  source_sentence?: string;
  target_tokens?: any[];
  // ... any other fields
  [key: string]: any;
}

export interface ConstellationNode {
  id: string;
  label: string;
  type: string;
  status: string; // 'locked' | 'unlocked' | 'mastered' | 'active'
  data?: NodeData; // <-- DATA IS A STRUCTURED OBJECT
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

export interface DraftCurriculumPayload {
  theme: string;
  sentence_count: number;
  target_level: string;
  complexity: string;
}

export interface DraftCurriculumResponse {
  nodes: ConstellationNode[];
  links: ConstellationLink[];
  draft_data: any[];
}

export interface FillCurriculumPayload {
  worksheet_data: any[];
  instruction_text?: string;
}

export interface FillCurriculumResponse {
  worksheet_data: ConstellationNode[];
}

export interface SpeakPayload {
  text: string;
}

export interface SpeakResponse {
  audio: string;
}

export const ApiService = {
  draftCurriculum: async (payload: DraftCurriculumPayload): Promise<DraftCurriculumResponse> => {
    const response = await fetch(`${API_BASE_URL}/draft_curriculum`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
    }
    return response.json();
  },

  fillCurriculum: async (payload: FillCurriculumPayload): Promise<FillCurriculumResponse> => {
    const response = await fetch(`${API_BASE_URL}/fill_curriculum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} ${errorText}`);
    }
    return response.json();
  },

  speak: async (payload: SpeakPayload): Promise<SpeakResponse> => {
    const response = await fetch(`${API_BASE_URL}/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Audio fetch failed: ${response.status}`);
      }

      return response.json();
  }
};
