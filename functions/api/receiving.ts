// Cloudflare Pages Function: GET /api/receiving
// Reads raw-material receiving lots from D1 (joined to the supplier name)
// and maps them onto the frontend `RawMaterialReceiving` shape.

interface Env {
  DB: {
    prepare(query: string): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
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
