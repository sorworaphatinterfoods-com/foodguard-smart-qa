import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockReceiving } from '@/lib/mock-data';
import type { RawMaterialReceiving } from '@/lib/types';

// Raw-material receiving lots from the live D1-backed API, with mock fallback.
export function useReceiving() {
  return useQuery<RawMaterialReceiving[]>({
    queryKey: ['receiving'],
    queryFn: async () => {
      try {
        return await apiGet<RawMaterialReceiving[]>('/api/receiving');
      } catch {
        return mockReceiving;
      }
    },
    staleTime: 30_000,
  });
}
