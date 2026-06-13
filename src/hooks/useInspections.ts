import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockInspectionLogs } from '@/lib/mock-data';
import type { InspectionLog } from '@/lib/types';

// Inspection logs from the live D1-backed API, with mock fallback.
export function useInspections() {
  return useQuery<InspectionLog[]>({
    queryKey: ['inspections'],
    queryFn: async () => {
      try {
        return await apiGet<InspectionLog[]>('/api/inspections');
      } catch {
        return mockInspectionLogs;
      }
    },
    staleTime: 30_000,
  });
}
