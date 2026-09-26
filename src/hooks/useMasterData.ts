import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';

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

export function useProcesses() {
  return useQuery<ProcessOption[]>({
    queryKey: ['processes'],
    queryFn: () => apiGet<ProcessOption[]>('/api/processes'),
    staleTime: 60_000,
  });
}

export function useEquipment() {
  return useQuery<EquipmentOption[]>({
    queryKey: ['equipment'],
    queryFn: () => apiGet<EquipmentOption[]>('/api/equipment'),
    staleTime: 60_000,
  });
}

export function useFinishedGoods() {
  return useQuery<FinishedGoodOption[]>({
    queryKey: ['finished-goods'],
    queryFn: () => apiGet<FinishedGoodOption[]>('/api/finished-goods'),
    staleTime: 60_000,
  });
}

export function useParameters() {
  return useQuery<ParameterOption[]>({
    queryKey: ['parameters'],
    queryFn: () => apiGet<ParameterOption[]>('/api/parameters'),
    staleTime: 60_000,
  });
}
