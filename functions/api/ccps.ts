// Cloudflare Pages Function: GET /api/ccps
// Reads the CCP master/plan from D1 (joined to the process name) — these are
// CCP definitions and their critical limits, not monitoring logs.

interface Env {
  DB: {
    prepare(query: string): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

interface CcpRow {
  ccp_id: string;
  ccp_name: string | null;
  critical_limit: string | null;
  process_id: string | null;
  process_name: string | null;
}

function mapCcp(row: CcpRow) {
  return {
    id: row.ccp_id,
    process: row.process_name ?? row.process_id ?? '',
    ccpName: row.ccp_name ?? '',
    criticalLimit: row.critical_limit ?? '',
  };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT c.ccp_id, c.ccp_name, c.critical_limit, c.process_id, p.process_name
     FROM ccp_master c
     LEFT JOIN processes p ON p.process_id = c.process_id
     WHERE c.is_active = 1
     ORDER BY c.ccp_id`,
  ).all<CcpRow>();

  return Response.json(results.map(mapCcp), {
    headers: { 'cache-control': 'no-store' },
  });
}
