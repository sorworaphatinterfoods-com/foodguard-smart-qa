import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type {
  CcpDashboard,
  CcpDevice,
  CcpDeviation,
  MetalTest,
  ProductHold,
  Verification,
  ThermalDashboard,
  ThermalEquipment,
  ThermalLog,
  ColdChainPoint,
  ColdChainLog,
  ColdChainDashboard,
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

const mockThermalDashboard: ThermalDashboard = {
  checksToday: 0, passRate: null, failCount: 0, cookingToday: 0, freezingToday: 0,
  openDeviations: 0, productsOnHold: 0, pendingVerification: 0, lastCooking: null, lastFreezing: null,
};

const mockThermalEquipment: ThermalEquipment[] = [
  { id: 'COOK-01', name: 'เตาต้ม/สตีมเมอร์ Line 1', type: 'COOKER', stage: 'COOKING', location: 'Cooking Area', line: 'Line 1', ccpId: 'CCP004', lastCalibratedAt: '', status: 'ACTIVE', limitValue: 75, limitDirection: 'MIN', unit: 'C', minHoldMinutes: 1 },
  { id: 'BFRZ-01', name: 'Blast Freezer #1', type: 'BLAST_FREEZER', stage: 'FREEZING', location: 'Freezing Area', line: 'Line 1', ccpId: 'CCP005', lastCalibratedAt: '', status: 'ACTIVE', limitValue: -18, limitDirection: 'MAX', unit: 'C', minHoldMinutes: null },
];

export function useThermalDashboard() {
  return useQuery<ThermalDashboard>({
    queryKey: ['ccp', 'thermal-dashboard'],
    queryFn: async () => {
      try {
        return await apiGet<ThermalDashboard>('/api/ccp/thermal-dashboard');
      } catch {
        return mockThermalDashboard;
      }
    },
    staleTime: 15_000,
  });
}

export function useThermalLogs() {
  return useQuery<ThermalLog[]>({
    queryKey: ['ccp', 'thermal-logs'],
    queryFn: async () => {
      try {
        return await apiGet<ThermalLog[]>('/api/ccp/thermal-logs');
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
  });
}

export function useThermalEquipment() {
  return useQuery<ThermalEquipment[]>({
    queryKey: ['ccp', 'thermal-equipment'],
    queryFn: async () => {
      try {
        return await apiGet<ThermalEquipment[]>('/api/ccp/thermal-equipment');
      } catch {
        return mockThermalEquipment;
      }
    },
    staleTime: 60_000,
  });
}

const mockColdChainPoints: ColdChainPoint[] = [
  { id: 'CR-01', name: 'ห้องเย็นเก็บ FG #1 (Frozen)', type: 'FREEZER', location: 'FG Cold Store', limitMin: -30, limitMax: -18, unit: 'C', targetLabel: '≤ -18°C', checkIntervalHours: 4, ccpId: 'CCP006', status: 'ACTIVE', lastTemp: -21.5, lastResult: 'PASS', lastAt: '' },
  { id: 'CR-02', name: 'ห้องเย็นเก็บ FG #2 (Frozen)', type: 'FREEZER', location: 'FG Cold Store', limitMin: -30, limitMax: -18, unit: 'C', targetLabel: '≤ -18°C', checkIntervalHours: 4, ccpId: 'CCP006', status: 'ACTIVE', lastTemp: -19.8, lastResult: 'PASS', lastAt: '' },
  { id: 'CH-01', name: 'ห้องเย็นวัตถุดิบ (Chiller)', type: 'CHILLER', location: 'RM Chiller', limitMin: 0, limitMax: 4, unit: 'C', targetLabel: '0 – 4°C', checkIntervalHours: 4, ccpId: 'CCP006', status: 'ACTIVE', lastTemp: 2.6, lastResult: 'PASS', lastAt: '' },
  { id: 'TRK-01', name: 'รถห้องเย็น Reefer #1', type: 'TRANSPORT', location: 'Dispatch', limitMin: -30, limitMax: -18, unit: 'C', targetLabel: '≤ -18°C', checkIntervalHours: 2, ccpId: 'CCP006', status: 'ACTIVE', lastTemp: null, lastResult: '', lastAt: '' },
];

const mockColdChainDashboard: ColdChainDashboard = {
  checksToday: 0, passRate: null, failCount: 0, totalPoints: 4,
  pointsInAlarm: 0, productsOnHold: 0, pendingVerification: 0, openDeviations: 0,
};

export function useColdChainPoints() {
  return useQuery<ColdChainPoint[]>({
    queryKey: ['ccp', 'coldchain-points'],
    queryFn: async () => {
      try {
        return await apiGet<ColdChainPoint[]>('/api/ccp/coldchain-points');
      } catch {
        return mockColdChainPoints;
      }
    },
    staleTime: 15_000,
  });
}

export function useColdChainLogs() {
  return useQuery<ColdChainLog[]>({
    queryKey: ['ccp', 'coldchain-logs'],
    queryFn: async () => {
      try {
        return await apiGet<ColdChainLog[]>('/api/ccp/coldchain-logs');
      } catch {
        return [];
      }
    },
    staleTime: 15_000,
  });
}

export function useColdChainDashboard() {
  return useQuery<ColdChainDashboard>({
    queryKey: ['ccp', 'coldchain-dashboard'],
    queryFn: async () => {
      try {
        return await apiGet<ColdChainDashboard>('/api/ccp/coldchain-dashboard');
      } catch {
        return mockColdChainDashboard;
      }
    },
    staleTime: 15_000,
  });
}
