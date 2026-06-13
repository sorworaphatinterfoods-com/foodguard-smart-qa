import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockRawMaterials } from '@/lib/mock-data';

export interface MaterialOption {
  materialId: string;
  materialName: string;
}

// Raw-material options (code + name) for form pickers, from live D1 with
// mock fallback. Codes must be real to satisfy the receiving FK constraint.
export function useMaterials() {
  return useQuery<MaterialOption[]>({
    queryKey: ['materials'],
    queryFn: async () => {
      try {
        return await apiGet<MaterialOption[]>('/api/materials');
      } catch {
        return mockRawMaterials.map((m) => ({ materialId: m.materialId, materialName: m.materialName }));
      }
    },
    staleTime: 60_000,
  });
}
