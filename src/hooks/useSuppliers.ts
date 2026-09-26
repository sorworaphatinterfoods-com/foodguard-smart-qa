import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { Supplier } from '@/lib/types';

export function useSuppliers() {
  return useQuery<Supplier[]>({
    queryKey: ['suppliers'],
    queryFn: () => apiGet<Supplier[]>('/api/suppliers'),
    staleTime: 60_000,
  });
}
