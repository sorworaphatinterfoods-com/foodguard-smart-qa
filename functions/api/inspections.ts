// Cloudflare Pages Function: GET + POST /api/inspections
// Reads/writes the inspection_logs table in D1.

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface Env {
  DB: { prepare(query: string): D1Stmt };
}

interface InspectionRow {
  inspection_ref: string;
  inspection_date: string | null;
  inspection_time: string | null;
  process_name: string | null;
  fg_code: string | null;
  fg_lot_no: string | null;
  equipment_id: string | null;
  parameter_name: string | null;
  spec_limit: string | null;
  value: number | null;
  unit: string | null;
  result: string | null;
  remarks: string | null;
  inspector_name: string | null;
}

function mapInspection(row: InspectionRow) {
  return {
    id: row.inspection_ref,
    timestamp: [row.inspection_date, row.inspection_time].filter(Boolean).join(' '),
    inspector: row.inspector_name ?? '',
    process: row.process_name ?? '',
    equipment: row.equipment_id ?? '',
    product: row.fg_code ?? '',
    lot: row.fg_lot_no ?? '',
    parameter: row.parameter_name ?? '',
    value: row.value ?? 0,
    spec: row.spec_limit ?? '',
    specMin: 0,
    specMax: 0,
    status: (row.result ?? '').toUpperCase() === 'FAIL' ? 'FAIL' : 'PASS',
    action: '',
    remark: row.remarks ?? '',
  };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT inspection_ref, inspection_date, inspection_time, process_name,
            fg_code, fg_lot_no, equipment_id, parameter_name, spec_limit,
            value, unit, result, remarks, inspector_name
     FROM inspection_logs
     ORDER BY inspection_date DESC, inspection_time DESC`,
  ).all<InspectionRow>();

  return Response.json(results.map(mapInspection), {
    headers: { 'cache-control': 'no-store' },
  });
}

interface NewInspectionBody {
  inspector?: string;
  process?: string;
  equipmentId?: string;
  productId?: string;
  lot?: string;
  parameter?: string;
  spec?: string;
  unit?: string;
  value?: number | string;
  result?: string; // PASS | FAIL
  remark?: string;
}

export async function onRequestPost(context: { env: Env; request: Request }): Promise<Response> {
  const body = (await context.request.json()) as NewInspectionBody;

  if (!body.inspector || !body.process) {
    return Response.json({ error: 'inspector and process are required' }, { status: 400 });
  }

  // result column is CHECK-constrained to PASS/FAIL/HOLD/N/A
  const result = (body.result ?? '').toUpperCase() === 'FAIL' ? 'FAIL' : 'PASS';
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10);
  const time = now.toISOString().slice(11, 16);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ref = `INS-${stamp.replace(/-/g, '')}-${rand}`;
  const numValue = body.value === undefined || body.value === '' ? null : Number(body.value);

  await context.env.DB.prepare(
    `INSERT INTO inspection_logs
       (inspection_ref, inspection_date, inspection_time, inspection_type,
        process_name, fg_code, fg_lot_no, equipment_id, parameter_name,
        spec_limit, value, unit, result, remarks, inspector_name, status)
     VALUES (?, ?, ?, 'In-Process', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recorded')`,
  )
    .bind(
      ref,
      stamp,
      time,
      body.process,
      body.productId ?? null,
      body.lot ?? null,
      body.equipmentId ?? null,
      body.parameter ?? null,
      body.spec ?? null,
      numValue,
      body.unit ?? null,
      result,
      body.remark ?? null,
      body.inspector,
    )
    .run();

  return Response.json({ id: ref, result }, { status: 201 });
}
