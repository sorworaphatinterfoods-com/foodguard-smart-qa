import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockSuppliers } from '@/lib/mock-data';
import type { Supplier } from '@/lib/types';

// Supplier master from the live D1-backed API, with mock fallback when the
// Functions backend isn't available (static mirror / offline).
export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: async () => {
      try {
        return await apiGet<Supplier[]>('/api/suppliers');
      } catch {
        return mockSuppliers;
      }
    },
    staleTime: 60_000,
  });
}
