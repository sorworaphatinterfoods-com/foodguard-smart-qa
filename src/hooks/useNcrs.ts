import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockNCRs } from '@/lib/mock-data';
import type { NCR } from '@/lib/types';

// Fetches NCRs from the live D1-backed API. When the API isn't available
// (e.g. the static mirror without a Functions backend), it transparently
// falls back to the bundled mock data so the screen still renders.
export function useNcrs() {
  return useQuery<NCR[]>({
    queryKey: ['ncrs'],
    queryFn: async () => {
      try {
        return await apiGet<NCR[]>('/api/ncrs');
      } catch {
        return mockNCRs;
      }
    },
    staleTime: 30_000,
  });
}
