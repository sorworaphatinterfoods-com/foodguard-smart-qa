import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockComplaintLogs } from '@/lib/mock-data';
import type { ComplaintLog } from '@/lib/types';

// Customer complaints from the live D1-backed API, with mock fallback.
export function useComplaints() {
  return useQuery<ComplaintLog[]>({
    queryKey: ['complaints'],
    queryFn: async () => {
      try {
        return await apiGet<ComplaintLog[]>('/api/complaints');
      } catch {
        return mockComplaintLogs;
      }
    },
    staleTime: 30_000,
  });
}
