export type UserRole = 'operator' | 'qa' | 'supervisor' | 'admin';

export type InspectionResult = 'pass' | 'hold' | 'reject';

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: string;
}

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

export interface CAPAAction {
  id: string;
  ncrId: string;
  type: 'corrective' | 'preventive';
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  verifiedBy?: string;
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

export interface DashboardKPI {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'pass' | 'warning' | 'fail';
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

export interface AuditRecord {
  id: string;
  date: string;
  auditType: 'GMP' | 'HACCP' | 'Internal' | 'Supplier';
  auditor: string;
  area: string;
  totalItems: number;
  passedItems: number;
  score: number;
  status: 'scheduled' | 'in_progress' | 'completed';
  findings: AuditFinding[];
}

export interface AuditFinding {
  id: string;
  checkItem: string;
  result: 'conforming' | 'minor_nc' | 'major_nc' | 'observation';
  notes: string;
}

export interface ComplaintRecord {
  id: string;
  date: string;
  customerName: string;
  productName: string;
  lotNumber: string;
  category: 'foreign_body' | 'quality' | 'labeling' | 'allergen' | 'packaging' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'received' | 'investigating' | 'resolved' | 'closed';
  linkedNCR?: string;
  resolution?: string;
}

export interface TraceabilityNode {
  id: string;
  type: 'supplier' | 'raw_material' | 'batch' | 'finished_good' | 'shipment' | 'customer';
  label: string;
  details: string;
  date: string;
}

export interface TraceabilityLink {
  fromId: string;
  toId: string;
}
