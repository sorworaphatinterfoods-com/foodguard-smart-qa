// Cloudflare Pages Function: GET /api/receiving
// Reads raw-material receiving lots from D1 (joined to the supplier name)
// and maps them onto the frontend `RawMaterialReceiving` shape.

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface Env {
  DB: { prepare(query: string): D1Stmt };
}

interface ReceivingRow {
  receiving_ref: string;
  receiving_date: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  material_code: string | null;
  internal_lot_no: string | null;
  supplier_lot_no: string | null;
  quantity: number | null;
  unit: string | null;
  core_temp: number | null;
  surface_temp: number | null;
  visual_appearance: string | null;
  packaging_condition: string | null;
  coa_received: number | null;
  overall_result: string | null;
  inspector_name: string | null;
  remarks: string | null;
}

function mapResult(value: string | null): 'pass' | 'hold' | 'reject' {
  const v = (value ?? '').toUpperCase();
  if (v === 'PASS') return 'pass';
  if (v === 'HOLD') return 'hold';
  return 'reject';
}

function mapReceiving(row: ReceivingRow) {
  return {
    id: row.receiving_ref,
    date: row.receiving_date ?? '',
    supplierId: row.supplier_id ?? '',
    supplierName: row.supplier_name ?? row.supplier_id ?? '',
    materialName: row.material_code ?? '',
    lotNumber: row.internal_lot_no ?? row.supplier_lot_no ?? '',
    quantity: row.quantity ?? 0,
    unit: row.unit ?? '',
    temperature: row.core_temp ?? row.surface_temp ?? 0,
    appearance: row.visual_appearance ?? '',
    packagingCondition: row.packaging_condition ?? '',
    coaUploaded: row.coa_received === 1,
    result: mapResult(row.overall_result),
    inspector: row.inspector_name ?? '',
    notes: row.remarks ?? '',
  };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT r.receiving_ref, r.receiving_date, r.supplier_id, s.supplier_name,
            r.material_code, r.internal_lot_no, r.supplier_lot_no, r.quantity,
            r.unit, r.core_temp, r.surface_temp, r.visual_appearance,
            r.packaging_condition, r.coa_received, r.overall_result,
            r.inspector_name, r.remarks
     FROM rm_receiving_lots r
     LEFT JOIN suppliers s ON s.supplier_id = r.supplier_id
     ORDER BY r.receiving_date DESC`,
  ).all<ReceivingRow>();

  return Response.json(results.map(mapReceiving), {
    headers: { 'cache-control': 'no-store' },
  });
}

interface NewReceivingBody {
  supplierId?: string;
  materialCode?: string;
  lot?: string;
  quantity?: number | string;
  unit?: string;
  temperature?: number | string;
  appearance?: string;
  packaging?: string;
  result?: string; // pass | hold | reject
  notes?: string;
}

// overall_result is CHECK-constrained to PASS/FAIL/HOLD/PENDING; reject -> FAIL.
function toDbResult(value: string): 'PASS' | 'HOLD' | 'FAIL' {
  switch ((value || '').toLowerCase()) {
    case 'pass':
      return 'PASS';
    case 'hold':
      return 'HOLD';
    default:
      return 'FAIL';
  }
}

// status is CHECK-constrained; pick a sensible terminal state per result.
function toDbStatus(result: 'PASS' | 'HOLD' | 'FAIL'): string {
  if (result === 'PASS') return 'Released';
  if (result === 'HOLD') return 'On Hold';
  return 'Rejected';
}

export async function onRequestPost(context: { env: Env; request: Request }): Promise<Response> {
  const body = (await context.request.json()) as NewReceivingBody;

  if (!body.supplierId || !body.materialCode || !body.lot) {
    return Response.json({ error: 'supplierId, materialCode and lot are required' }, { status: 400 });
  }

  const result = toDbResult(body.result ?? '');
  const status = toDbStatus(result);
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 16);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ref = `RCV-${stamp.replace(/-/g, '')}-${rand}`;
  const qty = body.quantity === undefined || body.quantity === '' ? 0 : Number(body.quantity);
  const temp = body.temperature === undefined || body.temperature === '' ? null : Number(body.temperature);

  await context.env.DB.prepare(
    `INSERT INTO rm_receiving_lots
       (receiving_ref, receiving_date, receiving_time, supplier_id, material_code,
        internal_lot_no, quantity, unit, core_temp, visual_appearance,
        packaging_condition, overall_result, inspector, status, remarks,
        created_by, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'web', ?, ?, 'web', datetime('now'))`,
  )
    .bind(
      ref,
      stamp,
      time,
      body.supplierId,
      body.materialCode,
      body.lot,
      qty,
      body.unit ?? 'kg',
      temp,
      body.appearance ?? null,
      body.packaging ?? null,
      result,
      status,
      body.notes ?? null,
    )
    .run();

  return Response.json({ id: ref, result }, { status: 201 });
}
