import { API_BASE_URL } from './apiConfig';

// Define types for payloads and responses

export interface ConstellationNode {
  id: string;
  label: string;
  status: 'locked' | 'unlocked' | 'mastered';
  x?: number;
  y?: number;
  target_sentence?: string;
  source_sentence?: string;
  target_tokens?: any[];
  ancient_context?: string | any;
  vx?: number;
  vy?: number;
  data?: any;
}

export interface ConstellationLink {
  source: string;
  target: string;
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
