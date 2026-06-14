import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { mockProcesses, mockProducts, mockParameters, mockEquipment } from '@/lib/mock-data';

export interface ProcessOption {
  processId: string;
  processName: string;
  area: string;
}

export interface EquipmentOption {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
}

export interface FinishedGoodOption {
  productId: string;
  productName: string;
  productType: string;
}

export interface ParameterOption {
  id: string;
  name: string;
  category: string;
  specLimit: string;
  unit: string;
}

// Master-data option lists for form pickers — live from D1 with mock fallback.

export function useProcesses() {
  return useQuery<ProcessOption[]>({
    queryKey: ['processes'],
    queryFn: async () => {
      try {
        return await apiGet<ProcessOption[]>('/api/processes');
      } catch {
        return mockProcesses.map((p) => ({ processId: p.processId, processName: p.processName, area: p.area }));
      }
    },
    staleTime: 60_000,
  });
}

export function useEquipment() {
  return useQuery<EquipmentOption[]>({
    queryKey: ['equipment'],
    queryFn: async () => {
      try {
        return await apiGet<EquipmentOption[]>('/api/equipment');
      } catch {
        return mockEquipment.map((e) => ({ equipmentId: e.equipmentId, equipmentName: e.equipmentName, equipmentType: '' }));
      }
    },
    staleTime: 60_000,
  });
}

export function useFinishedGoods() {
  return useQuery<FinishedGoodOption[]>({
    queryKey: ['finished-goods'],
    queryFn: async () => {
      try {
        return await apiGet<FinishedGoodOption[]>('/api/finished-goods');
      } catch {
        return mockProducts.map((p) => ({ productId: p.productId, productName: p.productName, productType: p.productType }));
      }
    },
    staleTime: 60_000,
  });
}

export function useParameters() {
  return useQuery<ParameterOption[]>({
    queryKey: ['parameters'],
    queryFn: async () => {
      try {
        return await apiGet<ParameterOption[]>('/api/parameters');
      } catch {
        return mockParameters.map((p) => ({
          id: p.parameter,
          name: p.parameter,
          category: p.isCCP ? 'Food Safety' : '',
          specLimit: `${p.specMin ?? '—'} - ${p.specMax ?? '—'}`,
          unit: p.unit,
        }));
      }
    },
    staleTime: 60_000,
  });
}
