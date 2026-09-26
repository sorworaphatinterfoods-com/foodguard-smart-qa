import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { InspectionLog } from '@/lib/types';

export function useInspections() {
  return useQuery<InspectionLog[]>({
    queryKey: ['inspections'],
    queryFn: () => apiGet<InspectionLog[]>('/api/inspections'),
    staleTime: 30_000,
  });
}
