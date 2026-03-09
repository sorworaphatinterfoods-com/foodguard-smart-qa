import { RawMaterialReceiving, CCPRecord, NCR, CalibrationRecord, DashboardKPI, EnvironmentalRecord, AuditRecord, ComplaintRecord, TraceabilityNode } from './types';

export const mockSuppliers = [
  { id: 's1', name: 'Fresh Farm Co.', code: 'SUP-001', contact: 'John Doe' },
  { id: 's2', name: 'Pacific Seafood Ltd.', code: 'SUP-002', contact: 'Jane Smith' },
  { id: 's3', name: 'Golden Grain Inc.', code: 'SUP-003', contact: 'Bob Lee' },
];

export const mockReceiving: RawMaterialReceiving[] = [
  {
    id: 'rm-001', date: '2026-03-08', supplierId: 's1', supplierName: 'Fresh Farm Co.',
    materialName: 'Chicken Breast', lotNumber: 'LOT-2026-0308-A', quantity: 500, unit: 'kg',
    temperature: 2.5, appearance: 'Good', packagingCondition: 'Intact', coaUploaded: true,
    result: 'pass', inspector: 'QA-001', notes: '',
  },
  {
    id: 'rm-002', date: '2026-03-08', supplierId: 's2', supplierName: 'Pacific Seafood Ltd.',
    materialName: 'Shrimp', lotNumber: 'LOT-2026-0308-B', quantity: 200, unit: 'kg',
    temperature: 5.2, appearance: 'Slight discoloration', packagingCondition: 'Intact', coaUploaded: false,
    result: 'hold', inspector: 'QA-002', notes: 'Temperature exceeded 4°C. Held for review.',
  },
  {
    id: 'rm-003', date: '2026-03-07', supplierId: 's3', supplierName: 'Golden Grain Inc.',
    materialName: 'Rice Flour', lotNumber: 'LOT-2026-0307-A', quantity: 1000, unit: 'kg',
    temperature: 22, appearance: 'Good', packagingCondition: 'Torn bag', coaUploaded: true,
    result: 'reject', inspector: 'QA-001', notes: 'Packaging damaged. Rejected.',
  },
];

export const mockCCPRecords: CCPRecord[] = [
  {
    id: 'ccp-001', date: '2026-03-08', machineId: 'M-01', machineName: 'Cooker Line A',
    ccpType: 'Cooking Temperature', value: 75.5, unit: '°C', lowerLimit: 72, upperLimit: 85,
    status: 'within', batchId: 'B-2026-0308-01', operator: 'OP-001',
  },
  {
    id: 'ccp-002', date: '2026-03-08', machineId: 'M-02', machineName: 'Metal Detector',
    ccpType: 'Metal Detection', value: 1.5, unit: 'mm', lowerLimit: 0, upperLimit: 2.0,
    status: 'within', batchId: 'B-2026-0308-01', operator: 'OP-002',
  },
  {
    id: 'ccp-003', date: '2026-03-08', machineId: 'M-03', machineName: 'Blast Freezer',
    ccpType: 'Freezer Temperature', value: -15, unit: '°C', lowerLimit: -25, upperLimit: -18,
    status: 'exceeded', batchId: 'B-2026-0308-02', operator: 'OP-001',
    correctionTaken: 'Batch held. Freezer serviced. Re-frozen to -20°C.',
  },
];

export const mockNCRs: NCR[] = [
  {
    id: 'NCR-001', date: '2026-03-07', title: 'Metal fragment detected in batch',
    description: 'Metal detector triggered on batch B-2026-0307-05. Fragment found in product.',
    category: 'Foreign Body', severity: 'critical', status: 'investigating',
    assignedTo: 'QA Supervisor', dueDate: '2026-03-10',
  },
  {
    id: 'NCR-002', date: '2026-03-06', title: 'Incorrect labeling on finished goods',
    description: 'Allergen declaration missing peanut from label on SKU-1234.',
    category: 'Labeling', severity: 'major', status: 'corrective_action',
    rootCause: 'Label template not updated after recipe change.',
    assignedTo: 'Production Lead', dueDate: '2026-03-12',
  },
  {
    id: 'NCR-003', date: '2026-03-01', title: 'Sanitation failure in Zone 3',
    description: 'ATP swab result exceeded limit on conveyor belt Zone 3.',
    category: 'Sanitation', severity: 'minor', status: 'closed',
    rootCause: 'Cleaning SOP not followed properly.',
    assignedTo: 'Sanitation Team', dueDate: '2026-03-05', closedDate: '2026-03-04',
  },
];

export const mockCalibration: CalibrationRecord[] = [
  {
    id: 'cal-001', instrumentName: 'Digital Thermometer #1', instrumentId: 'INST-001',
    location: 'Receiving Area', lastCalibration: '2026-02-01', nextDue: '2026-03-01',
    status: 'overdue',
  },
  {
    id: 'cal-002', instrumentName: 'pH Meter', instrumentId: 'INST-002',
    location: 'QC Lab', lastCalibration: '2026-03-01', nextDue: '2026-03-15',
    status: 'due_soon',
  },
  {
    id: 'cal-003', instrumentName: 'Weighing Scale #3', instrumentId: 'INST-003',
    location: 'Production Line B', lastCalibration: '2026-02-15', nextDue: '2026-05-15',
    status: 'current',
  },
];

export const mockKPIs: DashboardKPI[] = [
  { label: 'Supplier Rejection Rate', value: '4.2%', trend: 'down', status: 'pass' },
  { label: 'CCP Deviations (MTD)', value: 3, trend: 'up', status: 'warning' },
  { label: 'Open NCRs', value: 2, status: 'warning' },
  { label: 'CAPA Overdue', value: 0, status: 'pass' },
  { label: 'Calibration Overdue', value: 1, status: 'fail' },
  { label: 'Audit Score (Last)', value: '92%', status: 'pass' },
  { label: 'Customer Complaints (MTD)', value: 1, trend: 'stable', status: 'pass' },
  { label: 'Defect Rate', value: '0.8%', trend: 'down', status: 'pass' },
];
