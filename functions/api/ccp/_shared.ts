// Shared D1 types + helpers for the HACCP CCP / Metal Detector module.
// Files prefixed with "_" are not routed by Cloudflare Pages; import-only.

export interface D1Result<T = Record<string, unknown>> {
  results: T[];
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface Env {
  DB: D1Database;
}

export interface CcpContext {
  env: Env;
  request: Request;
}

// A short, human-readable unique id, e.g. MDT-20260704-8F3A.
export function makeId(prefix: string): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' },
  });
}

// Append an immutable audit-trail row. Never updated or deleted afterwards.
export async function audit(
  db: D1Database,
  entry: {
    table: string;
    recordId: string;
    action: string;
    summary?: string;
    by?: string;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO audit_logs (table_name, record_id, action, change_summary, changed_by, changed_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(
      entry.table,
      entry.recordId,
      entry.action,
      entry.summary ?? null,
      entry.by ?? 'system',
    )
    .run();
}
