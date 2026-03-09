// ── useIslandData ─────────────────────────────────────────────────────────────
// Returns island data from the API if reachable, otherwise falls back to mock
// data. This ensures the UI remains fully functional for design and refinement
// while we battle the Supabase network war.

import { useCallback, useEffect, useState } from 'react';
import { IslandDTO } from '../types';
import { MOCK_ISLANDS_MAP } from '../services/mock_data';
import { API_BASE_URL } from '../services/apiConfig';

interface UseIslandDataResult {
  island: IslandDTO | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  refetch: () => void;
}

export function useIslandData(islandId: string): UseIslandDataResult {
  const [island, setIsland] = useState<IslandDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  const fetchIsland = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/island/${islandId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data: IslandDTO = await response.json();
      setIsland(data);
      setIsMock(false);
    } catch (_e) {
      // API unreachable — fall back to mock data
      const mockIsland = MOCK_ISLANDS_MAP[islandId];
      if (mockIsland) {
        setIsland(mockIsland);
        setIsMock(true);
        setError(null);
      } else {
        setError(`Island "${islandId}" not found in mock data`);
      }
    } finally {
      setLoading(false);
    }
  }, [islandId]);

  useEffect(() => {
    fetchIsland();
  }, [fetchIsland]);

  return { island, loading, error, isMock, refetch: fetchIsland };
}
