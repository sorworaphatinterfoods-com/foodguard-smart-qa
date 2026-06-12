// Cloudflare Pages Function: GET /api/suppliers
// Reads the supplier master from D1 and maps it to the frontend `Supplier` type.

interface Env {
  DB: {
    prepare(query: string): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

interface SupplierRow {
  supplier_id: string;
  supplier_name: string | null;
  material_type: string | null;
  approved_status: string | null;
  last_audit_date: string | null;
  notes: string | null;
}

function mapSupplier(row: SupplierRow) {
  return {
    supplierId: row.supplier_id,
    supplierName: row.supplier_name ?? '',
    materialType: row.material_type ?? '',
    country: '',
    approvedStatus: row.approved_status ?? 'Pending',
    lastAuditDate: row.last_audit_date ?? '',
    remark: row.notes ?? '',
  };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT supplier_id, supplier_name, material_type, approved_status,
            last_audit_date, notes
     FROM suppliers
     WHERE is_active = 1
     ORDER BY supplier_id`,
  ).all<SupplierRow>();

  return Response.json(results.map(mapSupplier), {
    headers: { 'cache-control': 'no-store' },
  });
}
