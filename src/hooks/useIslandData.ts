// ── useIslandData ─────────────────────────────────────────────────────────────
// Returns island data from the API via ApiService (auth-aware).
import { useCallback, useEffect, useState } from 'react';
import { IslandDTO, ApiError } from '../types';
import { ApiService } from '../services/ApiService';

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
      const data = await ApiService.getIsland(islandId);
      setIsland(data);
    } catch (e: any) {
      if (e instanceof ApiError) {
        setError(e.kind === 'unauthorized' ? 'Please sign in to access this island.' : e.message);
      } else {
        setError(e.message || 'Failed to fetch island data.');
      }
    } finally {
      setLoading(false);
    }
  }, [islandId]);

  useEffect(() => {
    fetchIsland();
  }, [fetchIsland]);

  return { island, loading, error, refetch: fetchIsland };
}
