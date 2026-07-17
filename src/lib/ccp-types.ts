// Types for the HACCP CCP / Metal Detector monitoring module.
// Mirrors the JSON returned by the /api/ccp/* Pages Functions.

export type PassFail = 'PASS' | 'FAIL';
export type OkNg = 'OK' | 'NG';

export interface MetalTest {
  id: string;
  ref: string;
  datetime: string;
  shift: string;
  line: string;
  product: string;
  fgCode: string;
  lot: string;
  deviceId: string;
  frequencyType: string;
  fe: PassFail;
  nonFe: PassFail;
  sus: PassFail;
  rejectMechanism: OkNg;
  result: PassFail;
  productionStopped: boolean;
  affectedFrom: string;
  affectedTo: string;
  qtyHeld: number | null;
  qtyUnit: string;
  correctiveAction: string;
  finalDisposition: string;
  inspector: string;
  verifiedBy: string;
  verifiedAt: string;
  remark: string;
  attachmentUrl: string;
  deviationId: string;
  holdId: string;
  capaId: string;
  status: 'CLOSED' | 'PENDING_VERIFICATION' | 'VOID';
}

export interface CcpDashboard {
  checksToday: number;
  passRate: number | null;
  failCount: number;
  openDeviations: number;
  productsOnHold: number;
  pendingVerification: number;
  lastTest: { at: string; result: PassFail; device: string } | null;
  devices: { active: number; maintenance: number; inactive: number; total: number };
}

export interface CcpDevice {
  id: string;
  name: string;
  location: string;
  line: string;
  ccpId: string;
  fe: number | null;
  nonFe: number | null;
  sus: number | null;
  rejectType: string;
  lastVerifiedAt: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

export interface CcpDeviation {
  id: string;
  ccpId: string;
  testId: string;
  datetime: string;
  line: string;
  product: string;
  lot: string;
  description: string;
  rootCause: string;
  correctiveAction: string;
  productionStopped: boolean;
  capaId: string;
  holdId: string;
  verifiedBy: string;
  verifiedAt: string;
  disposition: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'VERIFIED' | 'CLOSED';
}

export interface ProductHold {
  id: string;
  sourceRef: string;
  deviationId: string;
  product: string;
  fgCode: string;
  lot: string;
  line: string;
  affectedFrom: string;
  affectedTo: string;
  qtyHeld: number | null;
  qtyUnit: string;
  reason: string;
  disposition: 'PENDING' | 'RELEASE' | 'REWORK' | 'REJECT' | 'DESTROY';
  releasedBy: string;
  releasedAt: string;
  status: 'ON_HOLD' | 'RELEASED' | 'DISPOSED';
}

export interface Verification {
  id: string;
  sourceType: string;
  sourceRef: string;
  type: string;
  result: 'PENDING' | 'VERIFIED' | 'REJECTED';
  comment: string;
  verifiedBy: string;
  verifiedAt: string;
  createdAt: string;
  product: string;
  lot: string;
  line: string;
  testResult: string;
  device: string;
  testAt: string;
}

// Locked critical limits for the metal detector before packing (frozen skewers).
export const CCP_CRITICAL_LIMITS = [
  { hazard: 'Fe', value: 1.0, unit: 'mm' },
  { hazard: 'Non-Fe', value: 1.5, unit: 'mm' },
  { hazard: 'SUS', value: 2.0, unit: 'mm' },
] as const;

export const FREQUENCY_TYPES = [
  'Start-up',
  'Production period',
  'Product change',
  'After maintenance',
  'End of production',
] as const;

// ---- Thermal CCP (cooking / freezing) ----
export type ThermalStage = 'COOKING' | 'FREEZING';

export interface ThermalLog {
  id: string;
  ref: string;
  datetime: string;
  shift: string;
  line: string;
  stage: ThermalStage;
  product: string;
  fgCode: string;
  lot: string;
  batch: string;
  equipmentId: string;
  probeId: string;
  frequencyType: string;
  coreTemp: number | null;
  holdMinutes: number | null;
  limitValue: number | null;
  limitDirection: string;
  result: PassFail;
  productionStopped: boolean;
  affectedFrom: string;
  affectedTo: string;
  qtyHeld: number | null;
  qtyUnit: string;
  correctiveAction: string;
  finalDisposition: string;
  inspector: string;
  verifiedBy: string;
  verifiedAt: string;
  remark: string;
  attachmentUrl: string;
  deviationId: string;
  holdId: string;
  capaId: string;
  status: 'CLOSED' | 'PENDING_VERIFICATION' | 'VOID';
}

export interface ThermalEquipment {
  id: string;
  name: string;
  type: 'COOKER' | 'BLAST_FREEZER' | 'PROBE' | 'OTHER';
  stage: string;
  location: string;
  line: string;
  ccpId: string;
  lastCalibratedAt: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  limitValue: number | null;
  limitDirection: string;
  unit: string;
  minHoldMinutes: number | null;
}

export interface ThermalDashboard {
  checksToday: number;
  passRate: number | null;
  failCount: number;
  cookingToday: number;
  freezingToday: number;
  openDeviations: number;
  productsOnHold: number;
  pendingVerification: number;
  lastCooking: { at: string; result: PassFail; temp: number } | null;
  lastFreezing: { at: string; result: PassFail; temp: number } | null;
}

// Locked thermal critical limits (frozen meat skewers).
export const THERMAL_LIMITS = {
  COOKING: { direction: 'MIN' as const, value: 75, unit: '°C', label: 'อุณหภูมิแกนหลังทำสุก ≥ 75°C' },
  FREEZING: { direction: 'MAX' as const, value: -18, unit: '°C', label: 'อุณหภูมิแกนหลังแช่แข็ง ≤ -18°C' },
};

// ---- Cold-chain / chilling CCP ----
export type ColdChainPointType = 'FREEZER' | 'COLD_ROOM' | 'CHILLER' | 'TRANSPORT' | 'OTHER';

export interface ColdChainPoint {
  id: string;
  name: string;
  type: ColdChainPointType;
  location: string;
  limitMin: number | null;
  limitMax: number | null;
  unit: string;
  targetLabel: string;
  checkIntervalHours: number | null;
  ccpId: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  lastTemp: number | null;
  lastResult: string;
  lastAt: string;
}

export interface ColdChainLog {
  id: string;
  ref: string;
  datetime: string;
  shift: string;
  pointId: string;
  pointName: string;
  pointType: string;
  temp: number;
  limitMin: number | null;
  limitMax: number | null;
  product: string;
  fgCode: string;
  lot: string;
  result: PassFail;
  excursionMinutes: number | null;
  affectedFrom: string;
  affectedTo: string;
  qtyHeld: number | null;
  qtyUnit: string;
  correctiveAction: string;
  finalDisposition: string;
  recordedBy: string;
  verifiedBy: string;
  verifiedAt: string;
  remark: string;
  attachmentUrl: string;
  deviationId: string;
  holdId: string;
  capaId: string;
  status: 'CLOSED' | 'PENDING_VERIFICATION' | 'VOID';
}

export interface ColdChainDashboard {
  checksToday: number;
  passRate: number | null;
  failCount: number;
  totalPoints: number;
  pointsInAlarm: number;
  productsOnHold: number;
  pendingVerification: number;
  openDeviations: number;
}
