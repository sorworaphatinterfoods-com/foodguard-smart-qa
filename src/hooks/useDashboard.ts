import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockKPIs } from '@/lib/mock-data';
import type { DashboardKPI } from '@/lib/types';

// Dashboard KPIs computed from live D1 data, with mock fallback.
export function useDashboard() {
  return useQuery<DashboardKPI[]>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        return await apiGet<DashboardKPI[]>('/api/dashboard');
      } catch {
        return mockKPIs;
      }
    },
    staleTime: 30_000,
  });
}
