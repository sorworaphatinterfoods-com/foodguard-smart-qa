import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { NCR } from '@/lib/types';

export function useNcrs() {
  return useQuery<NCR[]>({
    queryKey: ['ncrs'],
    queryFn: () => apiGet<NCR[]>('/api/ncrs'),
    staleTime: 30_000,
  });
}
