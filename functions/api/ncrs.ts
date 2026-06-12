// Cloudflare Pages Function: GET /api/ncrs
// Reads NCR records from the D1 "smart-qa-db" database and maps the stored
// columns onto the shape the frontend `NCR` type expects.

interface D1Stmt {
  bind(...values: unknown[]): D1Stmt;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface Env {
  DB: { prepare(query: string): D1Stmt };
}

interface NcrRow {
  ncr_id: string;
  issue_date: string | null;
  nc_description: string | null;
  parameter_name: string | null;
  process_ref: string | null;
  source_type: string | null;
  source_ref: string | null;
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
    category: row.source_ref ?? row.source_type ?? row.process_ref ?? '',
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
            source_type, source_ref, actual_result, severity, status, root_cause,
            assignee, target_date, closed_date
     FROM ncr_records
     ORDER BY issue_date DESC`,
  ).all<NcrRow>();

  return Response.json(results.map(mapNcr), {
    headers: { 'cache-control': 'no-store' },
  });
}

// The UI uses minor/major/critical; D1 stores Low/Medium/High.
function toDbSeverity(value: string): string {
  switch ((value || '').toLowerCase()) {
    case 'minor':
      return 'Low';
    case 'critical':
      return 'High';
    default:
      return 'Medium';
  }
}

interface NewNcrBody {
  title?: string;
  category?: string;
  severity?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  rootCause?: string;
}

export async function onRequestPost(context: { env: Env; request: Request }): Promise<Response> {
  const body = (await context.request.json()) as NewNcrBody;

  if (!body.title || !body.description) {
    return Response.json({ error: 'title and description are required' }, { status: 400 });
  }

  const now = new Date();
  const stamp = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ncrId = `NCR-${stamp.replace(/-/g, '')}-${rand}`;

  // `source_type` has a CHECK constraint (fixed enum), so manually-created
  // NCRs use OTHER and keep the UI's defect category in the free-text source_ref.
  await context.env.DB.prepare(
    `INSERT INTO ncr_records
       (ncr_id, issue_date, found_date, nc_description, parameter_name,
        source_type, source_ref, severity, status, root_cause, assignee,
        target_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'OTHER', ?, ?, 'Open', ?, ?, ?, datetime('now'), datetime('now'))`,
  )
    .bind(
      ncrId,
      stamp,
      stamp,
      body.description,
      body.title,
      body.category ?? null,
      toDbSeverity(body.severity ?? ''),
      body.rootCause ?? null,
      body.assignedTo ?? null,
      body.dueDate ?? null,
    )
    .run();

  return Response.json({ id: ncrId }, { status: 201 });
}
