import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { CcpDeviation } from '@/lib/ccp-types';

export function useCcpDeviations() {
  return useQuery<CcpDeviation[]>({ queryKey: ['ccp', 'deviations'], queryFn: () => apiGet<CcpDeviation[]>('/api/ccp/deviations'), staleTime: 15_000 });
}
