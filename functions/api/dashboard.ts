// Cloudflare Pages Function: GET /api/dashboard
// Computes the dashboard KPI tiles from live D1 data.

interface Env {
  DB: {
    prepare(query: string): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
    };
  };
}

interface Counts {
  open_ncrs: number;
  open_complaints: number;
  approved_suppliers: number;
  total_suppliers: number;
  receiving_holds: number;
  ccp_points: number;
  total_ncrs: number;
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const c = (await context.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM ncr_records WHERE LOWER(status) NOT LIKE '%clos%') AS open_ncrs,
       (SELECT COUNT(*) FROM customer_complaints WHERE LOWER(status) NOT LIKE '%clos%') AS open_complaints,
       (SELECT COUNT(*) FROM suppliers WHERE approved_status = 'Approved' AND is_active = 1) AS approved_suppliers,
       (SELECT COUNT(*) FROM suppliers WHERE is_active = 1) AS total_suppliers,
       (SELECT COUNT(*) FROM rm_receiving_lots WHERE UPPER(overall_result) = 'HOLD') AS receiving_holds,
       (SELECT COUNT(*) FROM ccp_master WHERE is_active = 1) AS ccp_points,
       (SELECT COUNT(*) FROM ncr_records) AS total_ncrs`,
  ).first<Counts>()) ?? {
    open_ncrs: 0,
    open_complaints: 0,
    approved_suppliers: 0,
    total_suppliers: 0,
    receiving_holds: 0,
    ccp_points: 0,
    total_ncrs: 0,
  };

  const kpis = [
    { label: 'Open NCRs', value: c.open_ncrs, status: c.open_ncrs > 0 ? 'warning' : 'pass' },
    { label: 'Open Complaints', value: c.open_complaints, status: c.open_complaints > 0 ? 'warning' : 'pass' },
    { label: 'Receiving Holds', value: c.receiving_holds, status: c.receiving_holds > 0 ? 'warning' : 'pass' },
    { label: 'Approved Suppliers', value: `${c.approved_suppliers}/${c.total_suppliers}` },
    { label: 'CCP Points', value: c.ccp_points },
    { label: 'Total NCRs', value: c.total_ncrs },
  ];

  return Response.json(kpis, { headers: { 'cache-control': 'no-store' } });
}
