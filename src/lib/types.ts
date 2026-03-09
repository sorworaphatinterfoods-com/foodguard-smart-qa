// ===== Master Data Types =====

export type UserRole = 'operator' | 'qa' | 'supervisor' | 'admin';
export type InspectionResult = 'pass' | 'hold' | 'reject';
export type InspectionStatus = 'PASS' | 'FAIL';

// 01 - Employee
export interface Employee {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  status: 'Active' | 'Inactive';
}

// 02 - Supplier
export interface Supplier {
  supplierId: string;
  supplierName: string;
  materialType: string;
  country: string;
  approvedStatus: 'Approved' | 'Pending' | 'Rejected';
  lastAuditDate: string;
  remark: string;
}

// 03 - Raw Material
export interface RawMaterial {
  materialId: string;
  materialName: string;
  category: string;
  supplierId: string;
  storageCondition: string;
  shelfLife: string;
  allergen: string;
  specReference: string;
}

// 04 - Finished Goods Product
export interface FGProduct {
  productId: string;
  productName: string;
  productType: string;
  netWeight: string;
  packaging: string;
  allergen: string;
  storage: string;
  shelfLife: string;
}

// 05 - Equipment
export interface Equipment {
  equipmentId: string;
  equipmentName: string;
  process: string;
  location: string;
  status: 'Active' | 'Inactive';
  qrCode: string;
}

// 06 - Process
export interface ProcessItem {
  processId: string;
  processName: string;
  area: string;
  type: 'QC' | 'Safety' | 'CCP';
}

// 07 - Parameter Master
export interface ParameterMaster {
  process: string;
  parameter: string;
  specMin: number | null;
  specMax: number | null;
  unit: string;
  method: string;
  frequency: string;
  isCCP: boolean;
}

// 08 - Allergen
export interface AllergenMaster {
  allergen: string;
  control: string;
  cleaningRequired: boolean;
  verification: string;
}

// 09 - Water Parameter
export interface WaterParameter {
  parameter: string;
  specMin: number;
  specMax: number;
  unit: string;
  method: string;
  frequency: string;
}

// 10 - Sampling Plan
export interface SamplingPlan {
  lotMin: number;
  lotMax: number;
  sampleSize: number;
  accept: number;
  reject: number;
}

// 11 - GHP Checklist
export interface GHPChecklistItem {
  area: string;
  checklist: string;
  standard: string;
  frequency: string;
}

// 12 - HACCP CCP List
export interface HACCPCCPItem {
  process: string;
  hazard: string;
  criticalLimit: string;
  monitoring: string;
  correctiveAction: string;
  verification: string;
}

// ===== Operational / Log Types =====

// 13 - Inspection Log
export interface InspectionLog {
  id: string;
  timestamp: string;
  inspector: string;
  process: string;
  equipment: string;
  product: string;
  lot: string;
  parameter: string;
  value: number;
  spec: string;
  specMin: number;
  specMax: number;
  status: InspectionStatus;
  action: string;
  remark: string;
}

// 14 - Water Test Log
export interface WaterTestLog {
  id: string;
  timestamp: string;
  location: string;
  parameter: string;
  value: number;
  spec: string;
  status: InspectionStatus;
  inspector: string;
}

// 15 - Allergen Log
export interface AllergenLog {
  id: string;
  timestamp: string;
  area: string;
  product: string;
  allergen: string;
  controlMethod: string;
  verification: string;
  result: InspectionStatus;
  inspector: string;
}

// 16 - Metal Detector Log
export interface MetalDetectorLog {
  id: string;
  timestamp: string;
  line: string;
  feMm: number;
  nonFeMm: number;
  susMm: number;
  result: InspectionStatus;
  inspector: string;
}

// 17 - Deviation Log
export interface DeviationLog {
  id: string;
  timestamp: string;
  process: string;
  equipment: string;
  parameter: string;
  value: number;
  spec: string;
  rootCause: string;
  correctiveAction: string;
  responsible: string;
  status: 'OPEN' | 'CLOSED';
}

// 18 - Corrective Action Log (CAPA)
export interface CAPALog {
  id: string;
  timestamp: string;
  deviationId: string;
  actionTaken: string;
  doneBy: string;
  completionDate: string;
  status: 'Open' | 'Closed';
}

// 19 - Internal Audit Log
export interface AuditLog {
  id: string;
  date: string;
  area: string;
  checklistItem: string;
  result: InspectionStatus;
  remark: string;
  auditor: string;
}

// 20 - Customer Complaint Log
export interface ComplaintLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  lot: string;
  issue: string;
  actionTaken: string;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Closed';
}

// ===== Dashboard =====
export interface DashboardKPI {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'pass' | 'warning' | 'fail';
}

// ===== Legacy compat (used by some existing components) =====
export interface RawMaterialReceiving {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  materialName: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  temperature: number;
  appearance: string;
  packagingCondition: string;
  coaUploaded: boolean;
  result: InspectionResult;
  inspector: string;
  notes: string;
}

export interface CCPRecord {
  id: string;
  date: string;
  machineId: string;
  machineName: string;
  ccpType: string;
  value: number;
  unit: string;
  lowerLimit: number;
  upperLimit: number;
  status: 'within' | 'exceeded';
  batchId: string;
  operator: string;
  correctionTaken?: string;
}

export interface NCR {
  id: string;
  date: string;
  title: string;
  description: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  status: 'open' | 'investigating' | 'corrective_action' | 'closed';
  rootCause?: string;
  assignedTo: string;
  dueDate: string;
  closedDate?: string;
}

export interface CalibrationRecord {
  id: string;
  instrumentName: string;
  instrumentId: string;
  location: string;
  lastCalibration: string;
  nextDue: string;
  status: 'current' | 'due_soon' | 'overdue';
  calibratedBy?: string;
}

export interface EnvironmentalRecord {
  id: string;
  date: string;
  time: string;
  zone: string;
  type: 'temperature' | 'humidity' | 'sanitation' | 'pest_control';
  value?: number;
  unit?: string;
  result: 'pass' | 'fail';
  inspector: string;
  notes: string;
}

export interface TraceabilityNode {
  id: string;
  type: 'supplier' | 'raw_material' | 'batch' | 'finished_good' | 'shipment' | 'customer';
  label: string;
  details: string;
  date: string;
}
