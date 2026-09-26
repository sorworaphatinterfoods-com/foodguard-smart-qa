import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { ComplaintLog } from '@/lib/types';

export function useComplaints() {
  return useQuery<ComplaintLog[]>({
    queryKey: ['complaints'],
    queryFn: () => apiGet<ComplaintLog[]>('/api/complaints'),
    staleTime: 30_000,
  });
}
