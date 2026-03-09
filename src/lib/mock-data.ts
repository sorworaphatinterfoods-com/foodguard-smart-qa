import {
  Employee, Supplier, RawMaterial, FGProduct, Equipment, ProcessItem,
  ParameterMaster, AllergenMaster, WaterParameter, SamplingPlan,
  GHPChecklistItem, HACCPCCPItem, InspectionLog, WaterTestLog,
  AllergenLog, MetalDetectorLog, DeviationLog, CAPALog, AuditLog,
  ComplaintLog, RawMaterialReceiving, CCPRecord, NCR, CalibrationRecord,
  EnvironmentalRecord, DashboardKPI, TraceabilityNode
} from './types';

// ===== 01 Employee List =====
export const mockEmployees: Employee[] = [
  { employeeId: 'EMP001', employeeName: 'สมหญิง', department: 'QA', position: 'Inspector', status: 'Active' },
  { employeeId: 'EMP002', employeeName: 'สมชาย', department: 'Production', position: 'Line Operator', status: 'Active' },
  { employeeId: 'EMP003', employeeName: 'สมรัตน์', department: 'Packaging', position: 'QA Supervisor', status: 'Active' },
  { employeeId: 'EMP004', employeeName: 'สมนึก', department: 'Maintenance', position: 'Technician', status: 'Inactive' },
  { employeeId: 'EMP005', employeeName: 'วิชัย', department: 'QA', position: 'QA Manager', status: 'Active' },
];

// ===== 02 Supplier List =====
export const mockSuppliers: Supplier[] = [
  { supplierId: 'SUP001', supplierName: 'CP Foods', materialType: 'Chicken', country: 'Thailand', approvedStatus: 'Approved', lastAuditDate: '2026-01-10', remark: '' },
  { supplierId: 'SUP002', supplierName: 'ไก่สยาม', materialType: 'Pork', country: 'Thailand', approvedStatus: 'Pending', lastAuditDate: '2025-12-15', remark: 'under review' },
  { supplierId: 'SUP003', supplierName: 'ABC Spice Co.', materialType: 'Seasoning', country: 'Vietnam', approvedStatus: 'Approved', lastAuditDate: '2025-11-20', remark: '' },
  { supplierId: 'SUP004', supplierName: 'XYZ Seafood Ltd', materialType: 'Seafood', country: 'Vietnam', approvedStatus: 'Approved', lastAuditDate: '2026-02-01', remark: '' },
];

// ===== 03 Raw Material List =====
export const mockRawMaterials: RawMaterial[] = [
  { materialId: 'RM001', materialName: 'Frozen Chicken Breast', category: 'Meat', supplierId: 'SUP001', storageCondition: 'Frozen -18°C', shelfLife: '12M', allergen: 'None', specReference: 'Internal spec' },
  { materialId: 'RM002', materialName: 'Pork Liver Paste', category: 'Meat', supplierId: 'SUP002', storageCondition: 'Chilled 4°C', shelfLife: '7D', allergen: 'None', specReference: 'Codex HACCP' },
  { materialId: 'RM003', materialName: 'Oyster Sauce', category: 'Seasoning', supplierId: 'SUP003', storageCondition: 'Ambient', shelfLife: '36M', allergen: 'Soy', specReference: 'Label spec' },
  { materialId: 'RM004', materialName: 'Hot Chili Paste', category: 'Sauce', supplierId: 'SUP003', storageCondition: 'Ambient', shelfLife: '6M', allergen: 'None', specReference: '' },
];

// ===== 04 FG Product List =====
export const mockProducts: FGProduct[] = [
  { productId: 'FG001', productName: 'Chicken Nugget', productType: 'Frozen', netWeight: '20g', packaging: 'Tray+Bag', allergen: 'Soy', storage: '-18°C', shelfLife: '12M' },
  { productId: 'FG002', productName: 'Pork Sausage', productType: 'Frozen', netWeight: '50g', packaging: 'Vacuum', allergen: 'Milk', storage: '-18°C', shelfLife: '6M' },
  { productId: 'FG003', productName: 'Chili Chicken Jerky', productType: 'Dried', netWeight: '15g', packaging: 'Canning', allergen: 'None', storage: 'Ambient', shelfLife: '12M' },
  { productId: 'FG004', productName: 'Golden Fried Rice', productType: 'Cooked', netWeight: '200g', packaging: 'Tray', allergen: 'Wheat', storage: '4°C', shelfLife: '3D' },
];

// ===== 05 Equipment List =====
export const mockEquipment: Equipment[] = [
  { equipmentId: 'EQ001', equipmentName: 'Freezer A', process: 'Storage', location: 'Warehouse 1', status: 'Active', qrCode: 'QR0001' },
  { equipmentId: 'EQ002', equipmentName: 'Metal Detector 1', process: 'Packing', location: 'Line 2', status: 'Active', qrCode: 'QR0002' },
  { equipmentId: 'EQ003', equipmentName: 'Cooking Oven 1', process: 'Cooking', location: 'Line 1', status: 'Active', qrCode: 'QR0003' },
  { equipmentId: 'EQ004', equipmentName: 'Rice Cooker Station', process: 'Cooking', location: 'Kitchen', status: 'Active', qrCode: 'QR0004' },
];

// ===== 06 Process List =====
export const mockProcesses: ProcessItem[] = [
  { processId: 'PR001', processName: 'Receiving', area: 'Raw Material', type: 'QC' },
  { processId: 'PR002', processName: 'Thawing', area: 'Production', type: 'Safety' },
  { processId: 'PR003', processName: 'Cooking', area: 'Production', type: 'CCP' },
  { processId: 'PR004', processName: 'Freezing', area: 'Storage', type: 'CCP' },
  { processId: 'PR005', processName: 'Metal Detection', area: 'Packing', type: 'CCP' },
  { processId: 'PR006', processName: 'Packaging', area: 'Packing', type: 'QC' },
];

// ===== 07 Parameter Master =====
export const mockParameters: ParameterMaster[] = [
  { process: 'Cooking', parameter: 'Temperature', specMin: 75, specMax: null, unit: '°C', method: 'Thermometer', frequency: 'Hourly', isCCP: true },
  { process: 'Freezing', parameter: 'Temp', specMin: null, specMax: -18, unit: '°C', method: 'Thermometer', frequency: '4hr', isCCP: true },
  { process: 'Metal Detection', parameter: 'Fe (Test)', specMin: 2, specMax: 2, unit: 'mm', method: 'Test Piece', frequency: 'Start/End', isCCP: true },
  { process: 'Finished Rice', parameter: 'Salinity', specMin: 0.5, specMax: 1.5, unit: '%', method: 'Refractometer', frequency: 'Per Lot', isCCP: false },
];

// ===== 08 Allergen List =====
export const mockAllergens: AllergenMaster[] = [
  { allergen: 'Soy', control: 'Segregation', cleaningRequired: true, verification: 'Allergen Swab' },
  { allergen: 'Milk', control: 'Label Control', cleaningRequired: true, verification: 'Label Check' },
  { allergen: 'Wheat', control: 'Segregation', cleaningRequired: true, verification: 'Allergen Swab' },
  { allergen: 'Peanut', control: 'Segregation', cleaningRequired: true, verification: 'Allergen Swab' },
  { allergen: 'Fish', control: 'Segregation', cleaningRequired: true, verification: 'Allergen Swab' },
  { allergen: 'Sesame', control: 'Segregation', cleaningRequired: true, verification: 'Allergen Swab' },
];

// ===== 09 Water Parameter =====
export const mockWaterParams: WaterParameter[] = [
  { parameter: 'pH', specMin: 6.5, specMax: 8.5, unit: '-', method: 'pH Meter', frequency: 'Daily' },
  { parameter: 'Free Chlorine', specMin: 0.2, specMax: 0.5, unit: 'mg/L', method: 'DPD Test', frequency: 'Daily' },
  { parameter: 'E.Coli (HPC)', specMin: 0, specMax: 0, unit: 'CFU/100ml', method: 'Lab Test', frequency: 'Weekly' },
  { parameter: 'Turbidity', specMin: 0, specMax: 5, unit: 'NTU', method: 'Turbidimeter', frequency: 'Weekly' },
];

// ===== 10 Sampling Plan =====
export const mockSamplingPlans: SamplingPlan[] = [
  { lotMin: 2, lotMax: 25, sampleSize: 3, accept: 0, reject: 1 },
  { lotMin: 26, lotMax: 150, sampleSize: 5, accept: 0, reject: 1 },
  { lotMin: 151, lotMax: 500, sampleSize: 8, accept: 1, reject: 2 },
  { lotMin: 501, lotMax: 1200, sampleSize: 13, accept: 2, reject: 3 },
  { lotMin: 1201, lotMax: 3200, sampleSize: 20, accept: 3, reject: 4 },
];

// ===== 11 GHP Checklist =====
export const mockGHPChecklist: GHPChecklistItem[] = [
  { area: 'Personal Hygiene', checklist: 'Uniform Clean', standard: 'Clean Dress Code', frequency: 'Every Shift' },
  { area: 'Personal Hygiene', checklist: 'Jewelry Removed', standard: 'No Jewelry', frequency: 'Every Shift' },
  { area: 'Processing Area', checklist: 'Floor Clean', standard: 'No Debris', frequency: 'Daily' },
  { area: 'Equipment Cleaning', checklist: 'Surface Sanitized', standard: 'Yes', frequency: 'Each Use' },
  { area: 'Facility Hygiene', checklist: 'Restroom Clean', standard: 'Sanitary', frequency: 'Daily' },
];

// ===== 12 HACCP CCP List =====
export const mockHACCPCCPs: HACCPCCPItem[] = [
  { process: 'Cooking', hazard: 'Pathogen', criticalLimit: '≥75°C', monitoring: 'Temp Check', correctiveAction: 'Re-cook', verification: 'HACCP Review' },
  { process: 'Freezing', hazard: 'Bacteria', criticalLimit: '≤-18°C', monitoring: 'Temp Check', correctiveAction: 'Adjust', verification: 'HACCP Review' },
  { process: 'Metal Detection', hazard: 'Metal', criticalLimit: 'No Detect', monitoring: 'Test Piece Check', correctiveAction: 'Reject', verification: 'HACCP Review' },
  { process: 'Packaging', hazard: 'Labeling Error', criticalLimit: '0 Errors', monitoring: 'Visual Check', correctiveAction: 'Re-label', verification: 'QA Check' },
];

// ===== 13 Inspection Log =====
export const mockInspectionLogs: InspectionLog[] = [
  { id: 'INS-001', timestamp: '2026-03-09 08:15', inspector: 'EMP001', process: 'Cooking', equipment: 'Cooking Oven 1', product: 'Chicken Breast', lot: 'LOT123', parameter: 'Temperature', value: 73, specMin: 75, specMax: 100, spec: '75-100', status: 'FAIL', action: 'Reheat', remark: '' },
  { id: 'INS-002', timestamp: '2026-03-09 09:30', inspector: 'EMP002', process: 'Metal Detection', equipment: 'Metal Detector 1', product: 'Frozen Nugget', lot: 'LOT124', parameter: 'Fe (mm)', value: 2.0, specMin: 2, specMax: 2, spec: '2-2', status: 'PASS', action: '', remark: '' },
  { id: 'INS-003', timestamp: '2026-03-09 10:00', inspector: 'EMP001', process: 'Cooking', equipment: 'Cooking Oven 1', product: 'Chicken Breast', lot: 'LOT123', parameter: 'Temperature', value: 80, specMin: 75, specMax: 100, spec: '75-100', status: 'PASS', action: '', remark: 'Re-check after reheat' },
  { id: 'INS-004', timestamp: '2026-03-09 14:00', inspector: 'EMP003', process: 'Freezing', equipment: 'Freezer A', product: 'Chicken Nugget', lot: 'LOT125', parameter: 'Temperature', value: -20, specMin: -30, specMax: -18, spec: '-30 to -18', status: 'PASS', action: '', remark: '' },
];

// ===== 14 Water Test Log =====
export const mockWaterTests: WaterTestLog[] = [
  { id: 'WT-001', timestamp: '2026-03-09 07:00', location: 'Tap A', parameter: 'pH', value: 7.0, spec: '6.5-8.5', status: 'PASS', inspector: 'EMP003' },
  { id: 'WT-002', timestamp: '2026-03-09 07:00', location: 'Tap A', parameter: 'Free Chlorine', value: 0.3, spec: '0.2-0.5', status: 'PASS', inspector: 'EMP003' },
  { id: 'WT-003', timestamp: '2026-03-09 08:00', location: 'Tank B', parameter: 'E.Coli (HPC)', value: 0, spec: '0', status: 'PASS', inspector: 'EMP003' },
  { id: 'WT-004', timestamp: '2026-03-09 08:00', location: 'Tank B', parameter: 'Turbidity', value: 2.1, spec: '0-5', status: 'PASS', inspector: 'EMP003' },
];

// ===== 15 Allergen Log =====
export const mockAllergenLogs: AllergenLog[] = [
  { id: 'AL-001', timestamp: '2026-03-09 10:00', area: 'Marination Line', product: 'Marinated Chicken', allergen: 'Soy', controlMethod: 'Segregation', verification: 'Label Check', result: 'PASS', inspector: 'EMP001' },
  { id: 'AL-002', timestamp: '2026-03-09 10:15', area: 'Marination Line', product: 'Marinated Chicken', allergen: 'Milk', controlMethod: 'Segregation', verification: 'Label Check', result: 'PASS', inspector: 'EMP001' },
  { id: 'AL-003', timestamp: '2026-03-09 14:00', area: 'Packaging', product: 'Chicken Nugget', allergen: 'Gluten', controlMethod: 'Label Control', verification: 'Label Check', result: 'FAIL', inspector: 'EMP002' },
];

// ===== 16 Metal Detector Log =====
export const mockMetalDetectorLogs: MetalDetectorLog[] = [
  { id: 'MD-001', timestamp: '2026-03-09 11:00', line: 'Line1', feMm: 2.0, nonFeMm: 2.5, susMm: 3.0, result: 'PASS', inspector: 'EMP001' },
  { id: 'MD-002', timestamp: '2026-03-09 13:00', line: 'Line2', feMm: 2.0, nonFeMm: 2.5, susMm: 2.5, result: 'FAIL', inspector: 'EMP002' },
  { id: 'MD-003', timestamp: '2026-03-09 15:00', line: 'Line1', feMm: 2.0, nonFeMm: 2.5, susMm: 3.0, result: 'PASS', inspector: 'EMP001' },
];

// ===== 17 Deviation Log =====
export const mockDeviations: DeviationLog[] = [
  { id: 'DEV-001', timestamp: '2026-03-09 08:20', process: 'Cooking', equipment: 'Cooking Oven 1', parameter: 'Temperature', value: 73, spec: '75-100', rootCause: 'Low heat setting', correctiveAction: 'Increased temp', responsible: 'EMP001', status: 'OPEN' },
  { id: 'DEV-002', timestamp: '2026-03-09 13:10', process: 'Metal Detection', equipment: 'Metal Detector 1', parameter: 'SUS (mm)', value: 2.5, spec: '3.0', rootCause: 'Calibration error', correctiveAction: 'Calibrate', responsible: 'EMP002', status: 'OPEN' },
];

// ===== 18 CAPA Log =====
export const mockCAPALogs: CAPALog[] = [
  { id: 'CAPA-001', timestamp: '2026-03-09 09:00', deviationId: 'DEV-001', actionTaken: 'Reheated batch to 80°C (PASS)', doneBy: 'EMP003', completionDate: '2026-03-09', status: 'Closed' },
  { id: 'CAPA-002', timestamp: '2026-03-09 13:30', deviationId: 'DEV-002', actionTaken: 'Calibrated metal detector', doneBy: 'EMP004', completionDate: '2026-03-09', status: 'Closed' },
];

// ===== 19 Internal Audit Log =====
export const mockAuditLogs: AuditLog[] = [
  { id: 'AUD-001', date: '2026-03-08', area: 'Production Floor', checklistItem: 'Sanitation', result: 'PASS', remark: '-', auditor: 'Auditor A' },
  { id: 'AUD-002', date: '2026-03-08', area: 'Packaging Area', checklistItem: 'Labeling', result: 'FAIL', remark: 'Label missing allergen', auditor: 'Auditor B' },
  { id: 'AUD-003', date: '2026-03-08', area: 'Cold Storage', checklistItem: 'Temperature Log', result: 'PASS', remark: '-', auditor: 'Auditor A' },
  { id: 'AUD-004', date: '2026-03-07', area: 'Receiving Area', checklistItem: 'Supplier COA Check', result: 'PASS', remark: 'All COAs on file', auditor: 'Auditor A' },
];

// ===== 20 Customer Complaint Log =====
export const mockComplaintLogs: ComplaintLog[] = [
  { id: 'CMP-001', date: '2026-03-05', productId: 'FG002', productName: 'Pork Sausage', lot: 'LOT120', issue: 'Incorrect Label (Milk not declared)', actionTaken: 'Recall batch 120', status: 'Resolved' },
  { id: 'CMP-002', date: '2026-03-07', productId: 'FG004', productName: 'Golden Fried Rice', lot: 'LOT125', issue: 'Found bone in product', actionTaken: 'Retrained staff', status: 'Resolved' },
  { id: 'CMP-003', date: '2026-03-08', productId: 'FG001', productName: 'Chicken Nugget', lot: 'LOT130', issue: 'Off-flavor reported by customer', actionTaken: '', status: 'Investigating' },
];

// ===== Legacy compatible data (used by existing pages) =====
export const mockReceiving: RawMaterialReceiving[] = [
  {
    id: 'rm-001', date: '2026-03-08', supplierId: 'SUP001', supplierName: 'CP Foods',
    materialName: 'Frozen Chicken Breast', lotNumber: 'LOT-2026-0308-A', quantity: 500, unit: 'kg',
    temperature: 2.5, appearance: 'Good', packagingCondition: 'Intact', coaUploaded: true,
    result: 'pass', inspector: 'EMP001', notes: '',
  },
  {
    id: 'rm-002', date: '2026-03-08', supplierId: 'SUP004', supplierName: 'XYZ Seafood Ltd',
    materialName: 'Shrimp', lotNumber: 'LOT-2026-0308-B', quantity: 200, unit: 'kg',
    temperature: 5.2, appearance: 'Slight discoloration', packagingCondition: 'Intact', coaUploaded: false,
    result: 'hold', inspector: 'EMP001', notes: 'Temperature exceeded 4°C. Held for review.',
  },
  {
    id: 'rm-003', date: '2026-03-07', supplierId: 'SUP003', supplierName: 'ABC Spice Co.',
    materialName: 'Oyster Sauce', lotNumber: 'LOT-2026-0307-A', quantity: 100, unit: 'boxes',
    temperature: 22, appearance: 'Good', packagingCondition: 'Torn bag', coaUploaded: true,
    result: 'reject', inspector: 'EMP003', notes: 'Packaging damaged. Rejected.',
  },
];

export const mockCCPRecords: CCPRecord[] = [
  {
    id: 'ccp-001', date: '2026-03-08', machineId: 'EQ003', machineName: 'Cooking Oven 1',
    ccpType: 'Cooking Temperature', value: 75.5, unit: '°C', lowerLimit: 75, upperLimit: 100,
    status: 'within', batchId: 'B-2026-0308-01', operator: 'EMP002',
  },
  {
    id: 'ccp-002', date: '2026-03-08', machineId: 'EQ002', machineName: 'Metal Detector 1',
    ccpType: 'Metal Detection (Fe)', value: 2.0, unit: 'mm', lowerLimit: 2, upperLimit: 2,
    status: 'within', batchId: 'B-2026-0308-01', operator: 'EMP002',
  },
  {
    id: 'ccp-003', date: '2026-03-08', machineId: 'EQ001', machineName: 'Freezer A',
    ccpType: 'Freezer Temperature', value: -15, unit: '°C', lowerLimit: -30, upperLimit: -18,
    status: 'exceeded', batchId: 'B-2026-0308-02', operator: 'EMP002',
    correctionTaken: 'Batch held. Freezer serviced. Re-frozen to -20°C.',
  },
];

export const mockNCRs: NCR[] = [
  {
    id: 'NCR-001', date: '2026-03-07', title: 'Metal fragment detected in batch',
    description: 'Metal detector triggered on batch B-2026-0307-05. Fragment found in product.',
    category: 'Foreign Body', severity: 'critical', status: 'investigating',
    assignedTo: 'สมรัตน์ (QA Supervisor)', dueDate: '2026-03-10',
  },
  {
    id: 'NCR-002', date: '2026-03-06', title: 'Incorrect labeling on finished goods',
    description: 'Allergen declaration missing milk from label on FG002 Pork Sausage.',
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

export const mockEnvironmental: EnvironmentalRecord[] = [
  { id: 'env-001', date: '2026-03-08', time: '06:00', zone: 'Production Zone A', type: 'temperature', value: 18.5, unit: '°C', result: 'pass', inspector: 'EMP001', notes: '' },
  { id: 'env-002', date: '2026-03-08', time: '06:00', zone: 'Cold Storage Room 1', type: 'temperature', value: 6.2, unit: '°C', result: 'fail', inspector: 'EMP001', notes: 'Above 4°C limit. Compressor checked.' },
  { id: 'env-003', date: '2026-03-08', time: '07:00', zone: 'Production Zone B', type: 'humidity', value: 55, unit: '%RH', result: 'pass', inspector: 'EMP002', notes: '' },
  { id: 'env-004', date: '2026-03-08', time: '08:00', zone: 'Packing Area', type: 'sanitation', result: 'pass', inspector: 'EMP003', notes: 'ATP swab result: 42 RLU (limit: 100)' },
  { id: 'env-005', date: '2026-03-07', time: '09:00', zone: 'Warehouse Exterior', type: 'pest_control', result: 'pass', inspector: 'EMP003', notes: 'Monthly bait station check. No activity.' },
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

export const mockTraceData = {
  nodes: [
    { id: 't1', type: 'supplier' as const, label: 'CP Foods (SUP001)', details: 'Chicken supplier, Approved', date: '2026-03-01' },
    { id: 't2', type: 'raw_material' as const, label: 'Frozen Chicken Breast — LOT-2026-0301-A', details: '500 kg received, temp 2.5°C, passed', date: '2026-03-01' },
    { id: 't3', type: 'batch' as const, label: 'Production Batch B-2026-0301-01', details: 'Cooking Oven 1, CCP passed at 75°C', date: '2026-03-01' },
    { id: 't4', type: 'finished_good' as const, label: 'Chicken Nugget — FG001 — LOT130', details: 'SKU FG001, 2000 pcs packed', date: '2026-03-02' },
    { id: 't5', type: 'shipment' as const, label: 'Shipment SHP-2026-0302-01', details: 'Truck T-105, departed -18°C', date: '2026-03-02' },
    { id: 't6', type: 'customer' as const, label: 'Metro Supermarket', details: 'Delivered 2026-03-03, accepted', date: '2026-03-03' },
  ] as TraceabilityNode[],
};
