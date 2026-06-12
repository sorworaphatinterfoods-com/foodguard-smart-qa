// Cloudflare Pages Function: GET /api/ncrs
// Reads NCR records from the D1 "smart-qa-db" database and maps the stored
// columns onto the shape the frontend `NCR` type expects.

interface Env {
  DB: {
    prepare(query: string): {
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

interface NcrRow {
  ncr_id: string;
  issue_date: string | null;
  nc_description: string | null;
  parameter_name: string | null;
  process_ref: string | null;
  source_type: string | null;
  actual_result: string | null;
  severity: string | null;
  status: string | null;
  root_cause: string | null;
  assignee: string | null;
  target_date: string | null;
  closed_date: string | null;
}

// D1 stores severity as Low/Medium/High/Critical; the UI expects minor/major/critical.
function mapSeverity(value: string | null): 'minor' | 'major' | 'critical' {
  switch ((value ?? '').toLowerCase()) {
    case 'low':
      return 'minor';
    case 'high':
    case 'critical':
      return 'critical';
    default:
      return 'major';
  }
}

// D1 stores status as free-ish text (Open/In Progress/Closed); normalize it.
function mapStatus(value: string | null): 'open' | 'investigating' | 'corrective_action' | 'closed' {
  const v = (value ?? '').toLowerCase();
  if (v.includes('clos')) return 'closed';
  if (v.includes('correct')) return 'corrective_action';
  if (v.includes('invest') || v.includes('progress')) return 'investigating';
  return 'open';
}

function mapNcr(row: NcrRow) {
  const title = [row.parameter_name, row.actual_result].filter(Boolean).join(' — ') || row.nc_description || row.ncr_id;
  return {
    id: row.ncr_id,
    date: row.issue_date ?? '',
    title,
    description: row.nc_description ?? '',
    category: row.source_type ?? row.process_ref ?? '',
    severity: mapSeverity(row.severity),
    status: mapStatus(row.status),
    rootCause: row.root_cause ?? undefined,
    assignedTo: row.assignee ?? '',
    dueDate: row.target_date ?? '',
    closedDate: row.closed_date ?? undefined,
  };
}

export async function onRequestGet(context: { env: Env }): Promise<Response> {
  const { results } = await context.env.DB.prepare(
    `SELECT ncr_id, issue_date, nc_description, parameter_name, process_ref,
            source_type, actual_result, severity, status, root_cause,
            assignee, target_date, closed_date
     FROM ncr_records
     ORDER BY issue_date DESC`,
  ).all<NcrRow>();

  return Response.json(results.map(mapNcr), {
    headers: { 'cache-control': 'no-store' },
  });
}
