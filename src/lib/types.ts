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
