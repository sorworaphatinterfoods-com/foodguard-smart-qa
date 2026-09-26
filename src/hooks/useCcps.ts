import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { CcpMaster } from '@/lib/types';

export function useCcps() {
  return useQuery<CcpMaster[]>({
    queryKey: ['ccps'],
    queryFn: () => apiGet<CcpMaster[]>('/api/ccps'),
    staleTime: 60_000,
  });
}
