import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { DashboardKPI } from '@/lib/types';

export function useDashboard() {
  return useQuery<DashboardKPI[]>({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardKPI[]>('/api/dashboard'),
    staleTime: 30_000,
  });
}
