import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type {
  CcpDashboard,
  CcpDevice,
  CcpDeviation,
  MetalTest,
  ProductHold,
  Verification,
} from '@/lib/ccp-types';

// Small demo fallbacks so the static mirror (no Functions backend) still renders.
const mockDashboard: CcpDashboard = {
  checksToday: 0,
  passRate: null,
  failCount: 0,
  openDeviations: 0,
  productsOnHold: 0,
  pendingVerification: 0,
  lastTest: null,
  devices: { active: 2, maintenance: 0, inactive: 0, total: 2 },
};

const mockDevices: CcpDevice[] = [
  {
    id: 'MD-PACK-01', name: 'Metal Detector — Packing Line 1', location: 'Packing Area',
    line: 'Line 1', ccpId: 'CCP001', fe: 1.0, nonFe: 1.5, sus: 2.0,
    rejectType: 'Auto Reject + Belt Stop', lastVerifiedAt: '', status: 'ACTIVE',
  },
  {
    id: 'MD-PACK-02', name: 'Metal Detector — Packing Line 2', location: 'Packing Area',
    line: 'Line 2', ccpId: 'CCP001', fe: 1.0, nonFe: 1.5, sus: 2.0,
    rejectType: 'Auto Reject + Belt Stop', lastVerifiedAt: '', status: 'ACTIVE',
  },
];

export function useCcpDashboard() {
  return useQuery<CcpDashboard>({
    queryKey: ['ccp', 'dashboard'],
    queryFn: async () => {
      try {
        return await apiGet<CcpDashboard>('/api/ccp/dashboard');
      } catch {
        return mockDashboard;
      }
    },
    staleTime: 15_000,
  });
}

export function useMetalTests() {
  return useQuery<MetalTest[]>({
    queryKey: ['ccp', 'metal-tests'],
    queryFn: async () => {
      try {
        return await apiGet<MetalTest[]>('/api/ccp/metal-tests');
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
  });
}

export function useCcpDevices() {
  return useQuery<CcpDevice[]>({
    queryKey: ['ccp', 'devices'],
    queryFn: async () => {
      try {
        return await apiGet<CcpDevice[]>('/api/ccp/devices');
      } catch {
        return mockDevices;
      }
    },
    staleTime: 60_000,
  });
}

export function useCcpDeviations() {
  return useQuery<CcpDeviation[]>({
    queryKey: ['ccp', 'deviations'],
    queryFn: async () => {
      try {
        return await apiGet<CcpDeviation[]>('/api/ccp/deviations');
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
  });
}

export function useProductHolds() {
  return useQuery<ProductHold[]>({
    queryKey: ['ccp', 'holds'],
    queryFn: async () => {
      try {
        return await apiGet<ProductHold[]>('/api/ccp/holds');
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
  });
}

export function useVerifications() {
  return useQuery<Verification[]>({
    queryKey: ['ccp', 'verifications'],
    queryFn: async () => {
      try {
        return await apiGet<Verification[]>('/api/ccp/verifications');
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
  });
}
