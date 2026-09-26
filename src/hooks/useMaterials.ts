import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

export interface MaterialOption {
  materialId: string;
  materialName: string;
}

export function useMaterials() {
  return useQuery<MaterialOption[]>({
    queryKey: ['materials'],
    queryFn: () => apiGet<MaterialOption[]>('/api/materials'),
    staleTime: 60_000,
  });
}
