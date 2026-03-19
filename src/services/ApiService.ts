// ── API Service ──────────────────────────────────────────────────────────────
// All data queries go through this service → FastAPI backend.
// Supabase is used for JWT extraction ONLY — never for direct DB queries.
// v0.7.0: authFetch wrapper, typed errors, new GET endpoints.

import { API_BASE_URL } from './apiConfig';
import { supabase } from './supabaseClient';
import {
  ApiError,
  ContrastiveProfile,
  IslandDTO,
  UserProfile,
} from '../types';

// ── Payload & Response Types ─────────────────────────────────────────────────

export interface NodeData {
  knot_id?: string;
  hero?: string;
  knot_definition?: string;
  ancient_context?: { author: string; greek: string; translation: string; citations?: string[] };
  target_sentence?: string;
  source_sentence?: string;
  target_tokens?: any[];
  [key: string]: any;
}

export interface ConstellationNode {
  id: string;
  label: string;
  type: string;
  status: string;
  data?: NodeData;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
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

// ── Auth-Aware Fetch Wrapper ─────────────────────────────────────────────────
// Reads the Supabase session JWT and injects it as a Bearer token.
// Handles 401 (refresh + retry once), 404 (ApiError 'void'), 5xx (ApiError 'server').

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function authFetch(
  url: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // 401: attempt a single token refresh + retry
  if (response.status === 401 && retry) {
    const { error } = await supabase.auth.refreshSession();
    if (!error) {
      return authFetch(url, options, false);
    }
    throw new ApiError('unauthorized', 401, 'Session expired. Please sign in again.');
  }

  return response;
}

/** Throw a typed ApiError from a failed response. */
async function throwApiError(response: Response): Promise<never> {
  const body = await response.text().catch(() => '');

  if (response.status === 404) {
    throw new ApiError('void', 404, body || 'Resource not found.');
  }
  if (response.status === 401) {
    throw new ApiError('unauthorized', 401, body || 'Unauthorized.');
  }
  throw new ApiError('server', response.status, body || `Server Error: ${response.status}`);
}

// ── The Service ──────────────────────────────────────────────────────────────

export const ApiService = {

  // ── v0.7.0 GET Endpoints ─────────────────────────────────────────────────

  /** GET /me — Returns the authenticated user's profile and tier. */
  getMe: async (): Promise<UserProfile> => {
    const response = await authFetch(`${API_BASE_URL}/me`);
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  /** GET /curriculum/islands — Returns all islands; backend applies paywall (locked=true, sentences=[] for free B1+). */
  getCurriculumIslands: async (): Promise<IslandDTO[]> => {
    const response = await authFetch(`${API_BASE_URL}/curriculum/islands`);
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  /** GET /islands/{id} — Returns full CuratedSentenceDTO with nested PhilologicalKnotDTOs. */
  getIsland: async (id: string): Promise<IslandDTO> => {
    const response = await authFetch(`${API_BASE_URL}/islands/${encodeURIComponent(id)}`);
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  /** GET /inspect/{lemma} — Returns ContrastiveProfile, or null on 404 (Philological Void). */
  inspectLemma: async (lemma: string): Promise<ContrastiveProfile | null> => {
    const response = await authFetch(`${API_BASE_URL}/inspect/${encodeURIComponent(lemma)}`);
    if (response.status === 404) {
      return null; // Philological Void — the diachronic link is lost to time
    }
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  // ── Legacy POST Endpoints (unchanged contract, now auth-aware) ───────────

  /** POST /draft_curriculum — Generate curriculum graph nodes/links. */
  draftCurriculum: async (payload: DraftCurriculumPayload): Promise<DraftCurriculumResponse> => {
    const response = await authFetch(`${API_BASE_URL}/draft_curriculum`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  /** POST /fill_curriculum — Enrich draft curriculum with sentence data. */
  fillCurriculum: async (payload: FillCurriculumPayload): Promise<FillCurriculumResponse> => {
    const response = await authFetch(`${API_BASE_URL}/fill_curriculum`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  /** POST /islands/synthesize — Synthesize island data. */
  synthesizeIsland: async (): Promise<any> => {
    const response = await authFetch(`${API_BASE_URL}/islands/synthesize`, {
      method: 'POST',
    });
    if (!response.ok) await throwApiError(response);
    return response.json();
  },

  /** POST /speak — Generate audio for text. */
  speak: async (payload: SpeakPayload): Promise<SpeakResponse> => {
    const response = await authFetch(`${API_BASE_URL}/speak`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!response.ok) await throwApiError(response);
    return response.json();
  },
};
