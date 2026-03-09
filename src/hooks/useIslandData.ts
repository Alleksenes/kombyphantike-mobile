// ── useIslandData ─────────────────────────────────────────────────────────────
// Returns island data from the API.
import { useCallback, useEffect, useState } from 'react';
import { IslandDTO } from '../types';
import { API_BASE_URL } from '../services/apiConfig';

interface UseIslandDataResult {
  island: IslandDTO | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useIslandData(islandId: string): UseIslandDataResult {
  const [island, setIsland] = useState<IslandDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e: any) {
      setError(e.message || 'Failed to fetch island data.');
    } finally {
      setLoading(false);
    }
  }, [islandId]);

  useEffect(() => {
    fetchIsland();
  }, [fetchIsland]);

  return { island, loading, error, refetch: fetchIsland };
}
