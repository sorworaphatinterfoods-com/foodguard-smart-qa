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

export const mockEnvironmental: EnvironmentalRecord[] = [
  { id: 'env-001', date: '2026-03-08', time: '06:00', zone: 'Production Zone A', type: 'temperature', value: 18.5, unit: '°C', result: 'pass', inspector: 'QA-001', notes: '' },
  { id: 'env-002', date: '2026-03-08', time: '06:00', zone: 'Cold Storage Room 1', type: 'temperature', value: 6.2, unit: '°C', result: 'fail', inspector: 'QA-001', notes: 'Above 4°C limit. Compressor checked.' },
  { id: 'env-003', date: '2026-03-08', time: '07:00', zone: 'Production Zone B', type: 'humidity', value: 55, unit: '%RH', result: 'pass', inspector: 'QA-002', notes: '' },
  { id: 'env-004', date: '2026-03-08', time: '08:00', zone: 'Packing Area', type: 'sanitation', result: 'pass', inspector: 'SAN-001', notes: 'ATP swab result: 42 RLU (limit: 100)' },
  { id: 'env-005', date: '2026-03-07', time: '09:00', zone: 'Warehouse Exterior', type: 'pest_control', result: 'pass', inspector: 'PEST-001', notes: 'Monthly bait station check. No activity.' },
];

export const mockAudits: AuditRecord[] = [
  {
    id: 'AUD-001', date: '2026-03-05', auditType: 'GMP', auditor: 'QA Supervisor',
    area: 'Production Line A', totalItems: 10, passedItems: 9, score: 90, status: 'completed',
    findings: [
      { id: 'f1', checkItem: 'Floor cleanliness', result: 'minor_nc', notes: 'Grout staining near drain' },
      { id: 'f2', checkItem: 'Handwashing compliance', result: 'conforming', notes: '' },
    ],
  },
  {
    id: 'AUD-002', date: '2026-03-10', auditType: 'HACCP', auditor: 'External Auditor',
    area: 'Entire Facility', totalItems: 25, passedItems: 0, score: 0, status: 'scheduled',
    findings: [],
  },
  {
    id: 'AUD-003', date: '2026-03-01', auditType: 'Internal', auditor: 'QA Manager',
    area: 'Warehouse & Cold Storage', totalItems: 15, passedItems: 13, score: 87, status: 'completed',
    findings: [
      { id: 'f3', checkItem: 'Temperature logs', result: 'minor_nc', notes: 'Missing 2 entries for Feb 28' },
      { id: 'f4', checkItem: 'Pest control records', result: 'observation', notes: 'Recommend increasing frequency' },
    ],
  },
];

export const mockComplaints: ComplaintRecord[] = [
  {
    id: 'CMP-001', date: '2026-03-06', customerName: 'Metro Supermarket', productName: 'Frozen Chicken Nuggets',
    lotNumber: 'FG-2026-0301-A', category: 'foreign_body', description: 'Customer found plastic fragment in product.',
    severity: 'high', status: 'investigating', linkedNCR: 'NCR-001',
  },
  {
    id: 'CMP-002', date: '2026-03-03', customerName: 'FoodMart Chain', productName: 'Breaded Fish Fillet',
    lotNumber: 'FG-2026-0225-B', category: 'quality', description: 'Product texture was mushy, not crispy after cooking.',
    severity: 'medium', status: 'resolved', resolution: 'Batch investigated. Breading mix ratio adjusted.',
  },
  {
    id: 'CMP-003', date: '2026-02-28', customerName: 'Quick Bites Restaurant', productName: 'Spring Rolls',
    lotNumber: 'FG-2026-0220-A', category: 'labeling', description: 'Allergen info missing shrimp on English label.',
    severity: 'high', status: 'closed', linkedNCR: 'NCR-002', resolution: 'Labels reprinted. All stock recalled and relabeled.',
  },
];

export const mockTraceData = {
  nodes: [
    { id: 't1', type: 'supplier' as const, label: 'Fresh Farm Co. (SUP-001)', details: 'Chicken breast supplier, certified', date: '2026-03-01' },
    { id: 't2', type: 'raw_material' as const, label: 'Chicken Breast — LOT-2026-0301-A', details: '500 kg received, temp 2.5°C, passed inspection', date: '2026-03-01' },
    { id: 't3', type: 'batch' as const, label: 'Production Batch B-2026-0301-01', details: 'Cooker Line A, CCP passed at 75°C', date: '2026-03-01' },
    { id: 't4', type: 'finished_good' as const, label: 'Frozen Chicken Nuggets — FG-2026-0301-A', details: 'SKU-1001, 2000 pcs packed', date: '2026-03-02' },
    { id: 't5', type: 'shipment' as const, label: 'Shipment SHP-2026-0302-01', details: 'Truck T-105, departed -18°C', date: '2026-03-02' },
    { id: 't6', type: 'customer' as const, label: 'Metro Supermarket', details: 'Delivered 2026-03-03, accepted', date: '2026-03-03' },
  ] as TraceabilityNode[],
};
