import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { RawMaterialReceiving } from '@/lib/types';

export function useReceiving() {
  return useQuery<RawMaterialReceiving[]>({
    queryKey: ['receiving'],
    queryFn: () => apiGet<RawMaterialReceiving[]>('/api/receiving'),
    staleTime: 30_000,
  });
}
