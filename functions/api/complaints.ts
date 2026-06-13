// Cloudflare Pages Function: GET /api/complaints
// Reads customer complaints from D1 and maps them to the frontend ComplaintLog.

interface Env {
  DB: {
    prepare(query: string): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

interface ComplaintRow {
  complaint_id: string;
  complaint_date: string | null;
  fg_code: string | null;
  product_name: string | null;
  fg_lot_no: string | null;
  issue_type: string | null;
  description: string | null;
  corrective_action: string | null;
  status: string | null;
}

function mapStatus(value: string | null): 'Open' | 'Investigating' | 'Resolved' | 'Closed' {
  const v = (value ?? '').toLowerCase();
  if (v.includes('clos')) return 'Closed';
  if (v.includes('resolv')) return 'Resolved';
  if (v.includes('invest')) return 'Investigating';
  return 'Open';
}

function mapComplaint(row: ComplaintRow) {
  return {
    id: row.complaint_id,
    date: row.complaint_date ?? '',
    productId: row.fg_code ?? '',
    productName: row.product_name ?? '(unspecified product)',
    lot: row.fg_lot_no ?? '-',
    issue: row.issue_type ?? row.description ?? '',
    actionTaken: row.corrective_action ?? '',
    status: mapStatus(row.status),
  };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT complaint_id, complaint_date, fg_code, product_name, fg_lot_no,
            issue_type, description, corrective_action, status
     FROM customer_complaints
     ORDER BY complaint_date DESC`,
  ).all<ComplaintRow>();

  return Response.json(results.map(mapComplaint), {
    headers: { 'cache-control': 'no-store' },
  });
}
